import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth";

const DepartmentSchema = z.object({
  code: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
});

export async function GET() {
  try {
    await authorize("system_admin");
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { staff: true }
        }
      },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(departments);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await authorize("system_admin");
    const body = await req.json();
    const validated = DepartmentSchema.parse(body);

    const department = await prisma.department.create({
      data: validated
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
