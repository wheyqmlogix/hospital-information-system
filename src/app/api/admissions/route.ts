import { createAdmission } from "./actions";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Fetch admissions with patient and bed details.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const department = searchParams.get("department");

  try {
    const where: any = {};
    if (status) where.status = status;
    if (department) where.department = department;

    const admissions = await prisma.admission.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
          }
        },
        bed: {
          select: {
            bedNumber: true,
            room: {
              select: {
                roomNumber: true,
                floor: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        admittedAt: "desc"
      }
    });

    return NextResponse.json(admissions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admissions" }, { status: 500 });
  }
}

/**
 * FHIR-aligned Admission (Encounter) endpoint.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createAdmission(data);
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }
}
