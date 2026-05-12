import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const DepartmentSchema = z.object({
  code: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
});

export async function GET() {
  try {
    console.log("GET /api/admin/departments - Checking authorization");
    await authorize("system_admin");
    console.log("GET /api/admin/departments - Authorized, fetching departments with staff count");
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" }
    });
    console.log(`GET /api/admin/departments - Found ${departments.length} departments`);
    return NextResponse.json(departments);
  } catch (error: any) {
    console.error("GET /api/admin/departments - Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch departments" }, { status: 500 });
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
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
