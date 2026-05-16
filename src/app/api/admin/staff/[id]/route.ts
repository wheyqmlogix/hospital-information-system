import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";
import bcrypt from "bcryptjs";

const StaffUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "BILLING", "PHARMACY", "LABORATORY"]),
  specialization: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  email: z.string().email(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");
    
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
          }
        },
        department: true
      }
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch staff member" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");
    const body = await req.json();
    const validated = StaffUpdateSchema.parse(body);

    const staff = await prisma.$transaction(async (tx) => {
      // 1. Update Staff
      const updatedStaff = await tx.staff.update({
        where: { id },
        data: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          role: validated.role,
          specialization: validated.specialization,
          departmentId: validated.departmentId,
        }
      });

      // 2. Update User
      await tx.user.update({
        where: { staffId: id },
        data: {
          email: validated.email,
          name: `${validated.firstName} ${validated.lastName}`,
          role: validated.role,
        }
      });

      return updatedStaff;
    });

    return NextResponse.json(staff);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");

    await prisma.$transaction(async (tx) => {
      // Delete user first (or let it cascade if set up, but safer to do explicitly if needed)
      // Actually, staff and user have a 1:1. 
      await tx.user.deleteMany({
        where: { staffId: id }
      });

      await tx.staff.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/staff/[id] - Error:", error);
    return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 });
  }
}
