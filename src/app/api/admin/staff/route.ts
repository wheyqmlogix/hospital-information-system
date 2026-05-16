import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const StaffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "BILLING", "PHARMACY", "LABORATORY"]),
  specialization: z.string().optional(),
  departmentId: z.string().optional(),
  email: z.string().email(),
});

export async function GET() {
  try {
    console.log("GET /api/admin/staff - Checking authorization");
    await authorize("system_admin");
    console.log("GET /api/admin/staff - Authorized, fetching staff directory");
    const staff = await prisma.staff.findMany({
      orderBy: { lastName: "asc" },
      include: {
        user: {
          select: {
            email: true,
          }
        },
        department: {
          select: {
            name: true,
          }
        }
      }
    });
    console.log(`GET /api/admin/staff - Found ${staff.length} staff members`);
    return NextResponse.json(staff);
  } catch (error: any) {
    console.error("GET /api/admin/staff - Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await authorize("system_admin");
    const body = await req.json();
    const validated = StaffSchema.parse(body);

    // 1. Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 4);

    // Default random password (will be changed by user)
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

    // 2. Generate Staff ID (STF-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const count = await prisma.staff.count();
    const staffId = `STF-${year}-${(count + 1).toString().padStart(5, "0")}`;

    // 3. Create Staff and User in a transaction
    const staff = await prisma.$transaction(async (tx) => {
      const newStaff = await tx.staff.create({
        data: {
          staffId,
          firstName: validated.firstName,
          lastName: validated.lastName,
          role: validated.role,
          specialization: validated.specialization,
          departmentId: validated.departmentId,
        }
      });

      await tx.user.create({
        data: {
          email: validated.email,
          password: hashedPassword,
          name: `${validated.firstName} ${validated.lastName}`,
          role: validated.role,
          staffId: newStaff.id,
          invitationToken: token,
          invitationExpires: expires,
        }
      });

      return newStaff;
    });

    // 4. Send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const setupLink = `${appUrl}/setup-password/${token}`;
    
    try {
      await sendEmail({
        to: [{ email: validated.email, name: `${validated.firstName} ${validated.lastName}` }],
        subject: "Welcome to Rose and Co. HIS - Account Invitation",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; text-transform: uppercase; letter-spacing: 0.1em;">Institutional Access Invitation</h2>
            <p style="color: #475569; line-height: 1.6;">Hello ${validated.firstName},</p>
            <p style="color: #475569; line-height: 1.6;">You have been registered as a staff member at <strong>Rose and Co. Hospital Information System</strong>.</p>
            <p style="color: #475569; line-height: 1.6;">To finalize your credentials and access the system, please set your password using the link below:</p>
            <div style="margin: 30px 0;">
              <a href="${setupLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 0.1em;">Set My Password</a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              This invitation link is valid for <strong>4 hours</strong>. If the link expires, please contact your system administrator for a new invitation.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
    }

    return NextResponse.json(staff, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
