import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const StaffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "BILLING", "PHARMACY", "LABORATORY"]),
  specialization: z.string().optional(),
  departmentId: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function GET() {
  try {
    console.log("GET /api/admin/staff - Checking authorization");
    await authorize("system_admin");
    console.log("GET /api/admin/staff - Authorized, fetching staff directory");
    const staff = await prisma.staff.findMany({
      orderBy: { lastName: "asc" }
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

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // 1. Generate Staff ID (STF-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const count = await prisma.staff.count();
    const staffId = `STF-${year}-${(count + 1).toString().padStart(5, "0")}`;

    // 2. Create Staff and User in a transaction
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
          staffId: newStaff.id
        }
      });

      return newStaff;
    });

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
