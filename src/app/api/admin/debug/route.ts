import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const counts = {
      departments: await prisma.department.count(),
      staff: await prisma.staff.count(),
      users: await prisma.user.count(),
    };
    return NextResponse.json({ 
      status: "connected", 
      database: "accessible",
      counts 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: "error", 
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
