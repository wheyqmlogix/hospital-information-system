import prisma from "@/lib/prisma";
import { toZonedTime } from "date-fns-tz";
import { Prisma } from "@prisma/client";
const Decimal = Prisma.Decimal;

const TIMEZONE = "Asia/Manila";

/**
 * Robust Discharge Workflow logic for an HIS.
 */
export async function processDischarge(data: {
  admissionId: string;
  finalDiagnosis: string;
  homeMedications: string;
  followUpInstructions: string;
}) {
  const now = toZonedTime(new Date(), TIMEZONE);

  try {
    // 1. Fetch admission and validate state
    const admission = await prisma.admission.findUnique({
      where: { id: data.admissionId },
      include: { 
        patient: {
          include: {
            labRequests: { where: { status: { not: "COMPLETED" } } },
            radRequests: { where: { status: { not: "COMPLETED" } } }
          }
        },
        bed: { include: { room: true } },
        billingRecords: { where: { status: "UNPAID" } }
      }
    });

    if (!admission) throw new Error("Admission record not found");
    if (admission.status !== "ADMITTED") throw new Error("Patient is not currently admitted");

    // 2. Validate pending laboratory/radiology results are 'COMPLETED'
    if (admission.patient.labRequests.length > 0) {
      throw new Error(`Cannot discharge: ${admission.patient.labRequests.length} pending lab results.`);
    }
    if (admission.patient.radRequests.length > 0) {
      throw new Error(`Cannot discharge: ${admission.patient.radRequests.length} pending radiology results.`);
    }

    // 3. Calculate Room & Board Charges
    const stayDurationMs = now.getTime() - admission.admittedAt.getTime();
    const stayDurationDays = Math.max(1, Math.ceil(stayDurationMs / (1000 * 60 * 60 * 24)));
    
    // Simplified price logic based on room type
    const roomRate = admission.bed?.room.type === "PRIVATE" ? 2500 : 1500;
    const roomBoardTotal = new Decimal(roomRate).times(stayDurationDays);

    // 4. Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Add Room & Board to the active BillingRecord
      if (admission.billingRecords.length > 0) {
        await tx.billingItem.create({
          data: {
            billingRecordId: admission.billingRecords[0].id,
            serviceName: `Room & Board (${admission.bed?.room.roomNumber})`,
            category: "ACCOMMODATION",
            quantity: stayDurationDays,
            unitPrice: new Decimal(roomRate),
            totalAmount: roomBoardTotal,
            isVatable: true
          }
        });
      }

      // Update Admission status and clinical summary
      const updatedAdmission = await tx.admission.update({
        where: { id: data.admissionId },
        data: {
          status: "PENDING_BILLING",
          dischargedAt: now,
          finalDiagnosis: data.finalDiagnosis,
          homeMedications: data.homeMedications,
          followUpInstructions: data.followUpInstructions
        }
      });

      // Update Patient status (Transition to outpatient/discharged)
      await tx.patient.update({
        where: { id: admission.patientId },
        data: { status: "RECOVERED" } // Example status update
      });

      // Release the bed - ensures Room status logic is handled (Bed status back to 'Available')
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

      return updatedAdmission;
    });

    // 4. Trigger a notification to the Billing Department
    notifyBillingDepartment(admission.id);

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Discharge Workflow Failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mock function to notify Billing Department
 */
function notifyBillingDepartment(admissionId: string) {
  // In a real app, this could be a Pusher event, WebSocket, or an entry in a Notification table.
  console.log(`[NOTIFICATION] Billing Department: Admission ${admissionId} is ready for final billing.`);
}
