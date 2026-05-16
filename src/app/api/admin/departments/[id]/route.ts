import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";
import { Prisma } from "@prisma/client";

const DepartmentSchema = z.object({
  code: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");
    
    const department = await prisma.department.findUnique({
      where: { id }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch department" }, { status: 500 });
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
    const validated = DepartmentSchema.parse(body);

    const department = await prisma.department.update({
      where: { id },
      data: validated
    });

    return NextResponse.json(department);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Department code already in use" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");

    // Check if department has staff
    const staffCount = await prisma.staff.count({
      where: { departmentId: id }
    });

    if (staffCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete department with active personnel. Reassign staff first." }, 
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
