import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("can_manage_users")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dept = searchParams.get("department");
  const role = searchParams.get("role");

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          dept ? { primaryDepartment: { name: dept } } : {},
          role ? { role: { name: role } } : {},
        ]
      },
      include: {
        role: true,
        primaryDepartment: true,
      },
      orderBy: { name: "asc" },
    });

    // Remove password hashes from response
    const safeUsers = users.map(({ passwordHash: _, ...user }) => user);

    return NextResponse.json(safeUsers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("can_manage_users")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    // Clinical-specific validation
    if (["Doctor", "Nurse"].includes(data.roleName) && !data.licenseNumber) {
      return NextResponse.json(
        { error: "Professional License Number is mandatory for clinical roles." }, 
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password || "Cliniq@2026", 10);
    
    const role = await prisma.role.findUnique({ where: { name: data.roleName } });
    const dept = await prisma.department.findUnique({ where: { name: data.departmentName } });

    if (!role || !dept) {
      return NextResponse.json({ error: "Invalid Role or Department" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        licenseNumber: data.licenseNumber,
        specialization: data.specialization,
        roleId: role.id,
        primaryDepartmentId: dept.id,
        status: "ACTIVE",
      },
    });

    await createAuditLog({
      action: "CREATE",
      table: "User",
      recordId: user.id,
      performedById: session.user.id,
      changes: { name: user.name, role: role.name, department: dept.name },
    });

    const { passwordHash: __, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const meta = (error as any).meta;
      const field = meta?.target?.[0] || "identifier";
      return NextResponse.json(
        { error: `A user with this ${field} already exists.` }, 
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
