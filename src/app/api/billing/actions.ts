"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

const PaymentSchema = z.object({
  billingRecordId: z.string().cuid(),
  amount: z.number().positive(),
  method: z.enum(["CASH", "CARD", "CHEQUE", "ONLINE"]),
  referenceNumber: z.string().optional(),
  collectedBy: z.string().optional(),
});

const PromissoryNoteSchema = z.object({
  billingRecordId: z.string().cuid(),
  initialPayment: z.number().min(0),
  dueDate: z.date(),
  reason: z.string().optional(),
  guarantorName: z.string().optional(),
  guarantorContact: z.string().optional(),
});

export async function recordPayment(data: unknown) {
  try {
    const validated = PaymentSchema.parse(data);
    const { billingRecordId, amount, method, referenceNumber, collectedBy } = validated;

    const result = await prisma.$transaction(async (tx) => {
      const billingRecord = await tx.billingRecord.findUnique({
        where: { id: billingRecordId }
      });

      if (!billingRecord) throw new Error("Billing record not found");

      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          billingRecordId,
          amount: new Decimal(amount),
          method,
          referenceNumber,
          collectedBy
        }
      });

      // 2. Update Billing Record
      const newPaidAmount = new Decimal(billingRecord.paidAmount).plus(amount);
      const newBalance = new Decimal(billingRecord.totalAmount).minus(newPaidAmount);
      
      let newStatus = "PARTIAL";
      if (newBalance.lessThanOrEqual(0)) {
        newStatus = "PAID";
      }

      const updatedRecord = await tx.billingRecord.update({
        where: { id: billingRecordId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalance,
          status: newStatus
        }
      });

      return { payment, updatedRecord };
    });

    revalidatePath(`/patients/${result.updatedRecord.patientId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Payment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function issuePromissoryNote(data: unknown) {
  try {
    // Note: Zod date validation might need coercing if from a form
    const validated = PromissoryNoteSchema.parse(data);
    const { 
      billingRecordId, 
      initialPayment, 
      dueDate, 
      reason, 
      guarantorName, 
      guarantorContact 
    } = validated;

    const result = await prisma.$transaction(async (tx) => {
      const billingRecord = await tx.billingRecord.findUnique({
        where: { id: billingRecordId }
      });

      if (!billingRecord) throw new Error("Billing record not found");

      // 1. Create Payment if initial payment exists
      if (initialPayment > 0) {
        await tx.payment.create({
          data: {
            billingRecordId,
            amount: new Decimal(initialPayment),
            method: "CASH", // Default for initial promissory payment
            referenceNumber: "PROMISSORY_INITIAL"
          }
        });
      }

      // 2. Create Promissory Note
      const note = await tx.promissoryNote.create({
        data: {
          billingRecordId,
          totalAmount: billingRecord.totalAmount,
          initialPayment: new Decimal(initialPayment),
          remainingBalance: new Decimal(billingRecord.totalAmount).minus(initialPayment),
          dueDate,
          reason,
          guarantorName,
          guarantorContact,
          status: "ACTIVE"
        }
      });

      // 3. Update Billing Record
      const newPaidAmount = new Decimal(billingRecord.paidAmount).plus(initialPayment);
      const newBalance = new Decimal(billingRecord.totalAmount).minus(newPaidAmount);

      const updatedRecord = await tx.billingRecord.update({
        where: { id: billingRecordId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalance,
          status: "PROMISSORY"
        }
      });

      return { note, updatedRecord };
    });

    revalidatePath(`/patients/${result.updatedRecord.patientId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Promissory Note Error:", error);
    return { success: false, error: error.message };
  }
}
