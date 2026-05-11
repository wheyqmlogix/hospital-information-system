"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";

const TIMEZONE = "Asia/Manila";

const ReleaseERSchema = z.object({
  admissionId: z.string().cuid(),
  finalDiagnosis: z.string().min(3),
  disposition: z.string().default("Released Home"),
  followUpInstructions: z.string().optional(),
});

const TransitionERSchema = z.object({
  admissionId: z.string().cuid(),
  newRoomNumber: z.string().min(1),
  newWard: z.string().optional(),
  admittingDiagnosis: z.string().optional(),
});

/**
 * Workflow for ER Release (Direct discharge from ER)
 */
export async function releaseERPatient(data: unknown) {
  const now = toZonedTime(new Date(), TIMEZONE);
  
  try {
    const validated = ReleaseERSchema.parse(data);
    const { admissionId, finalDiagnosis, disposition, followUpInstructions } = validated;

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bed: true }
    });

    if (!admission) throw new Error("Admission record not found");
    if (admission.department !== "ER") throw new Error("This workflow is only for ER patients");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Admission status to ER_RELEASED
      const updated = await tx.admission.update({
        where: { id: admissionId },
        data: {
          status: "ER_RELEASED",
          dischargedAt: now,
          finalDiagnosis,
          followUpInstructions: `${disposition}. ${followUpInstructions || ""}`,
        }
      });

      // 2. Release the ER Bed
      if (admission.bed) {
        await tx.bed.update({
          where: { id: admission.bed.id },
          data: {
            status: "AVAILABLE",
            patientId: null,
            admissionId: null
          }
        });
      }

      // 3. Update Patient Status
      await tx.patient.update({
        where: { id: admission.patientId },
        data: { status: "OUTPATIENT" }
      });

      return updated;
    });

    revalidatePath("/admissions");
    revalidatePath("/patients");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("ER Release Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Workflow for Transitioning from ER to Inpatient Ward
 */
export async function admitFromER(data: unknown) {
  const now = toZonedTime(new Date(), TIMEZONE);

  try {
    const validated = TransitionERSchema.parse(data);
    const { admissionId, newRoomNumber, newWard, admittingDiagnosis } = validated;

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bed: true }
    });

    if (!admission) throw new Error("Admission record not found");
    if (admission.department !== "ER") throw new Error("Patient is not in ER department");

    // Check for available bed in new room
    const newBed = await prisma.bed.findFirst({
      where: {
        room: { roomNumber: newRoomNumber },
        status: "AVAILABLE"
      }
    });

    if (!newBed) throw new Error("No available bed in the target room");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Release old ER Bed
      if (admission.bed) {
        await tx.bed.update({
          where: { id: admission.bed.id },
          data: {
            status: "AVAILABLE",
            patientId: null,
            admissionId: null
          }
        });
      }

      // 2. Occupy new Inpatient Bed
      await tx.bed.update({
        where: { id: newBed.id },
        data: {
          status: "OCCUPIED",
          patientId: admission.patientId,
          admissionId: admission.id
        }
      });

      // 3. Update Admission to ADMITTING department and new room
      const updated = await tx.admission.update({
        where: { id: admissionId },
        data: {
          department: "ADMITTING",
          roomNumber: newRoomNumber,
          ward: newWard || admission.ward,
          admittingDiagnosis: admittingDiagnosis || admission.admittingDiagnosis,
          admissionType: "ROUTINE", // Change from EMERGENCY to ROUTINE inpatient stay
          updatedAt: now,
        }
      });

      // 4. Update Patient Status to INPATIENT (if not already)
      await tx.patient.update({
        where: { id: admission.patientId },
        data: { status: "INPATIENT" }
      });

      return updated;
    });

    revalidatePath("/admissions");
    revalidatePath(`/patients/${admission.patientId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("ER Admission Error:", error);
    return { success: false, error: error.message };
  }
}
