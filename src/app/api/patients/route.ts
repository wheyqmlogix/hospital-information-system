import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const PatientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  extensionName: z.string().optional(),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  philHealthPIN: z.string().optional().refine(val => !val || /^\d{2}-\d{9}-\d{1}$/.test(val), {
    message: "PhilHealth PIN must follow the format XX-XXXXXXXXX-X"
  }),
  nationalId: z.string().optional(),
  seniorId: z.string().optional(),
  pwdId: z.string().optional(),
  mobileNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zipCode: z.string().optional(),
  dpaConsent: z.boolean().refine(val => val === true, {
    message: "DPA consent is mandatory"
  })
});

/**
 * GET: Search patients
 */
export async function GET(req: Request) {
  try {
    await authorize("view_patients");

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { patientId: { contains: query, mode: "insensitive" } },
          { philHealthPIN: { contains: query, mode: "insensitive" } },
          { nationalId: { contains: query, mode: "insensitive" } },
        ]
      },
      take: 10,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(patients);
  } catch (error: any) {
    console.error("Search Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to search patients" }, { status: 500 });
  }
}

/**
 * POST: Register new patient
 */
export async function POST(req: Request) {
  try {
    const user = await authorize("edit_patients");

    const body = await req.json();
    
    // Custom date handling for JSON
    if (body.dateOfBirth) body.dateOfBirth = new Date(body.dateOfBirth).toISOString();

    const validated = PatientSchema.parse(body);

    // 1. Check for duplicates (PhilHealth or National ID)
    if (validated.philHealthPIN || validated.nationalId) {
      const existing = await prisma.patient.findFirst({
        where: {
          OR: [
            validated.philHealthPIN ? { philHealthPIN: validated.philHealthPIN } : {},
            validated.nationalId ? { nationalId: validated.nationalId } : {},
          ].filter(obj => Object.keys(obj).length > 0)
        }
      });

      if (existing) {
        return NextResponse.json({ 
          error: "A patient with this PhilHealth PIN or National ID already exists." 
        }, { status: 400 });
      }
    }

    // 2. Generate Patient ID (PT-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const count = await prisma.patient.count();
    const patientId = `PT-${year}-${(count + 1).toString().padStart(5, "0")}`;

    // 3. Create Patient
    const patient = await prisma.patient.create({
      data: {
        ...validated,
        patientId,
        dateOfBirth: new Date(body.dateOfBirth),
        dpaConsentTimestamp: validated.dpaConsent ? new Date() : null,
        registeredByUserId: user.id,
        // Remove dpaConsent from data as it's not in the model
        dpaConsent: undefined 
      } as any
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to register patient" }, { status: 500 });
  }
}
