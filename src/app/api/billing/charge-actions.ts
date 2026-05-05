"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

const ChargeSchema = z.object({
  patientId: z.string().cuid(),
  serviceName: z.string().min(1),
  category: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  isVatable: z.boolean().default(true),
});

export async function recordCharge(data: unknown) {
  try {
    const validated = ChargeSchema.parse(data);
    const { patientId, serviceName, category, quantity, unitPrice, isVatable } = validated;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find active admission for this patient
      const admission = await tx.admission.findFirst({
        where: { patientId, status: "ADMITTED" },
        include: { billingRecords: { where: { status: "UNPAID" } } }
      });

      let billingRecordId: string;

      if (admission && admission.billingRecords.length > 0) {
        billingRecordId = admission.billingRecords[0].id;
      } else {
        // Fallback: Create a standalone billing record or find one
        const record = await tx.billingRecord.findFirst({
          where: { patientId, status: "UNPAID", admissionId: null }
        });

        if (record) {
          billingRecordId = record.id;
        } else {
          const newRecord = await tx.billingRecord.create({
            data: {
              patientId,
              description: "Outpatient charges",
              status: "UNPAID",
            }
          });
          billingRecordId = newRecord.id;
        }
      }

      // 2. Create Billing Item
      const totalAmount = new Decimal(unitPrice).times(quantity);
      
      const item = await tx.billingItem.create({
        data: {
          billingRecordId,
          serviceName,
          category,
          quantity,
          unitPrice: new Decimal(unitPrice),
          totalAmount,
          isVatable,
        }
      });

      // 3. Update Billing Record Totals (Simplified aggregation)
      // Note: In a large system, we might want to aggregate on-demand in the engine,
      // but here we cache it for quick view.
      const allItems = await tx.billingItem.findMany({ where: { billingRecordId } });
      const newGross = allItems.reduce((acc, i) => acc.plus(i.totalAmount), new Decimal(0));
      
      await tx.billingRecord.update({
        where: { id: billingRecordId },
        data: {
          grossAmount: newGross,
          totalAmount: newGross, // Will be refined by the billing engine calculation
          balanceAmount: newGross.minus(0), // Simplified
        }
      });

      return item;
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Charge Error:", error);
    return { success: false, error: error.message };
  }
}
