import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.dateOfBirth || !data.gender) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, dateOfBirth, and gender are mandatory." },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      },
    });
    
    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("Failed to create patient:", error);
    
    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || "identifier";
      return NextResponse.json(
        { error: `A patient with this ${field} already exists.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error while creating patient record." }, 
      { status: 500 }
    );
  }
}
