import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Allow clinical staff to fetch users (limited) or managers to manage users
  const isClinical = session?.user.role === "Doctor" || session?.user.role === "Nurse";
  const canManage = session?.user.permissions.includes("can_manage_users");

  if (!session || (!canManage && !isClinical)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dept = searchParams.get("department");
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          dept ? { primaryDepartment: { name: dept } } : {},
          role ? { role: { name: role } } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { specialization: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
        ]
      },
      include: {
        role: true,
        primaryDepartment: true,
      },
      orderBy: { name: "asc" },
      take: canManage ? undefined : 20, // Limit results for search if not managing
    });

    // Remove password hashes from response
    const safeUsers = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const field = (error as { meta?: { target?: string[] } }).meta?.target?.[0] || "identifier";
      return NextResponse.json(
        { error: `A user with this ${field} already exists.` }, 
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
