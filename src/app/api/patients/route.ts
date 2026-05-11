import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  try {
    const patients = await prisma.patient.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { patientId: { contains: search, mode: 'insensitive' } },
        ],
      } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20, // Limit for search results
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
  } catch (error: unknown) {
    console.error("Failed to create patient:", error);
    
    // Handle Prisma unique constraint violations
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const field = (error as { meta?: { target?: string[] } }).meta?.target?.[0] || "identifier";
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
