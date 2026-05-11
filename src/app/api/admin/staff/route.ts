import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth";

const StaffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "BILLING", "PHARMACY", "LABORATORY"]),
  specialization: z.string().optional(),
  departmentId: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6), // In production, use hashing
});

export async function GET() {
  try {
    await authorize("system_admin");
    const staff = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        },
        department: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: { lastName: "asc" }
    });
    return NextResponse.json(staff);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await authorize("system_admin");
    const body = await req.json();
    const validated = StaffSchema.parse(body);

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
          password: validated.password, // IMPORTANT: Hash this in real implementation
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
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
