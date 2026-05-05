"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Manila";

import { z } from "zod";

const AdmissionSchema = z.object({
  patientId: z.string().cuid(),
  admittingDiagnosis: z.string().min(3, "Diagnosis is too short"),
  roomNumber: z.string(),
  ward: z.string().optional(),
  isPhilHealthMember: z.boolean(),
  philHealthPIN: z.string().optional(),
  dpaConsent: z.boolean().refine(val => val === true, {
    message: "Data Privacy Act consent is mandatory for admission."
  })
});

export async function createAdmission(data: unknown) {
  const now = toZonedTime(new Date(), TIMEZONE);
  
  try {
    // 0. Validate input using Zod
    const validated = AdmissionSchema.parse(data);
    const { 
      patientId, 
      admittingDiagnosis, 
      roomNumber, 
      ward, 
      isPhilHealthMember, 
      philHealthPIN,
      dpaConsent
    } = validated;

    // 1. Validate patient is not currently admitted
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { admissions: { where: { status: "ADMITTED" } } }
    });

    if (!patient) throw new Error("Patient not found");
    if (patient.admissions.length > 0) throw new Error("Patient is already admitted");

    // 2. Validate bed availability
    const bed = await prisma.bed.findFirst({
      where: { 
        room: { roomNumber }, 
        status: "AVAILABLE" 
      }
    });

    if (!bed) throw new Error("No available bed in this room");

    // 3. Transaction
    const result = await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.create({
        data: {
          patientId,
          admittingDiagnosis,
          roomNumber,
          ward,
          isPhilHealthMember,
          philHealthPIN,
          dpaConsentTimestamp: dpaConsent ? now : null,
          status: "ADMITTED",
          admittedAt: now,
        }
      });

      // Initialize Billing Record for this admission
      await tx.billingRecord.create({
        data: {
          patientId,
          admissionId: admission.id,
          description: `Inpatient charges for ${admittingDiagnosis}`,
          status: "UNPAID",
        }
      });

      await tx.patient.update({
        where: { id: patientId },
        data: { status: "INPATIENT" }
      });

      await tx.bed.update({
        where: { id: bed.id },
        data: { 
          status: "OCCUPIED",
          patientId,
          admissionId: admission.id
        }
      });

      return admission;
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${patientId}`);
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Admission Error:", error);
    return { success: false, error: error.message };
  }
}
