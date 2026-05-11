"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { toZonedTime } from "date-fns-tz";
import { z } from "zod";

const TIMEZONE = "Asia/Manila";

const AdmissionSchema = z.object({
  patientId: z.string().cuid(),
  admittingDiagnosis: z.string().min(3, "Diagnosis is too short"),
  admissionType: z.enum(["ROUTINE", "EMERGENCY", "URGENT", "MATERNITY"]),
  admissionSource: z.string().min(1, "Admission source is required"),
  department: z.string().default("ADMITTING"),
  // Multiple Physicians Support
  physicians: z.array(z.object({
    physicianId: z.string().cuid(),
    role: z.enum(["ATTENDING", "CONSULTANT", "RESIDENT"]),
    isPrimary: z.boolean().default(false),
  })).min(1, "At least one physician is required"),
  roomNumber: z.string(),
  ward: z.string().optional(),
  guarantorName: z.string().optional(),
  guarantorRelation: z.string().optional(),
  guarantorPhone: z.string().optional(),
  isPhilHealthMember: z.boolean(),
  philHealthPIN: z.string().optional(),
  dpaConsent: z.boolean().refine(val => val === true, {
    message: "Data Privacy Act consent is mandatory for admission."
  }),
  // Optional Vitals
  vitals: z.object({
    bloodPressure: z.string().optional(),
    temperature: z.number().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
  }).optional()
});

export async function createAdmission(data: unknown) {
  const now = toZonedTime(new Date(), TIMEZONE);
  console.log("createAdmission DEBUG - Data:", JSON.stringify(data, null, 2));
  
  try {
    // 0. Validate input using Zod
    const validated = AdmissionSchema.parse(data);
    console.log("createAdmission DEBUG - Validation Success");
    const { 
      patientId, 
      admittingDiagnosis, 
      admissionType,
      admissionSource,
      department,
      physicians,
      roomNumber, 
      ward, 
      guarantorName,
      guarantorRelation,
      guarantorPhone,
      isPhilHealthMember, 
      philHealthPIN,
      dpaConsent,
      vitals
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
          admissionType,
          admissionSource,
          department,
          roomNumber,
          ward,
          guarantorName,
          guarantorRelation,
          guarantorPhone,
          isPhilHealthMember,
          philHealthPIN,
          dpaConsentTimestamp: dpaConsent ? now : null,
          status: "ADMITTED",
          admittedAt: now,
          physicians: {
            create: physicians.map(p => ({
              physicianId: p.physicianId,
              role: p.role,
              isPrimary: p.isPrimary
            }))
          }
        }
      });

      const primaryPhysicianJoin = physicians.find(p => p.isPrimary) || physicians[0];
      const primaryPhysician = await tx.user.findUnique({
        where: { id: primaryPhysicianJoin.physicianId }
      });

      // Create Initial Admission Note with Vitals
      await tx.clinicalNote.create({
        data: {
          patientId,
          doctorName: primaryPhysician?.name || "System",
          subjective: "Initial Admission Assessment",
          assessment: `Admitting Diagnosis: ${admittingDiagnosis}`,
          plan: "Inpatient monitoring and treatment started.",
          ...(vitals && {
            bloodPressure: vitals.bloodPressure,
            temperature: vitals.temperature,
            heartRate: vitals.heartRate,
            respiratoryRate: vitals.respiratoryRate,
            oxygenSaturation: vitals.oxygenSaturation,
            weight: vitals.weight,
            height: vitals.height,
          })
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
    revalidatePath("/admissions");
    
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Admission Error:", error);
    return { success: false, error: message };
  }
}
