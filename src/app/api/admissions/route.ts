import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const AdmissionSchema = z.object({
  patientId: z.string(),
  type: z.enum(["ER", "INPATIENT", "OBSERVATION", "OUTPATIENT"]),
  triageLevel: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5"]),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  admittingDiagnosis: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Check authorization
    const user = await authorize("create_admissions");

    const body = await req.json();
    const validated = AdmissionSchema.parse(body);

    // 1. Check for active admissions for this patient
    const activeAdmission = await prisma.admission.findFirst({
      where: {
        patientId: validated.patientId,
        status: "ACTIVE"
      }
    });

    if (activeAdmission) {
      return NextResponse.json({ 
        error: "Patient already has an active admission." 
      }, { status: 400 });
    }

    // 2. Generate Admission ID (ADM-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const count = await prisma.admission.count();
    const admissionId = `ADM-${year}-${(count + 1).toString().padStart(5, "0")}`;

    // 3. Create Admission and update patient status
    const admission = await prisma.$transaction(async (tx) => {
      const newAdmission = await tx.admission.create({
        data: {
          ...validated,
          admissionId,
          status: "ACTIVE",
          admittedByUserId: user.id
        }
      });

      await tx.patient.update({
        where: { id: validated.patientId },
        data: { status: validated.type }
      });

      return newAdmission;
    });

    return NextResponse.json(admission, { status: 201 });
  } catch (error: any) {
    console.error("Admission Error:", error);
    
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create admission" }, { status: 500 });
  }
}
