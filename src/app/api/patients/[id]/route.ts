import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        appointments: { orderBy: { appointmentDate: "desc" } },
        billingRecords: { 
          orderBy: { createdAt: "desc" },
          include: { items: true }
        },
        clinicalNotes: { orderBy: { createdAt: "desc" } },
        prescriptions: {
          orderBy: { createdAt: "desc" },
          include: { items: true }
        },
        assignedBed: {
          include: { room: true }
        },
        labRequests: { orderBy: { createdAt: "desc" } },
        radRequests: { orderBy: { createdAt: "desc" } }
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Failed to fetch patient:", error);
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });
    return NextResponse.json(patient);
  } catch (error) {
    console.error("Failed to update patient:", error);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}
