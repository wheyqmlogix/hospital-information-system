import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const RestockSchema = z.object({
  medicationId: z.string(),
  batchNumber: z.string(),
  expiryDate: z.string().transform(val => new Date(val)),
  quantity: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const user = await authorize("manage_inventory");
    const body = await req.json();
    const validated = RestockSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Stock Batch
      const batch = await tx.stockBatch.create({
        data: {
          medicationId: validated.medicationId,
          batchNumber: validated.batchNumber,
          expiryDate: validated.expiryDate,
          initialQuantity: validated.quantity,
          remainingQuantity: validated.quantity,
          status: "ACTIVE"
        }
      });

      // 2. Update Medication Total Stock
      await tx.medication.update({
        where: { id: validated.medicationId },
        data: { stock: { increment: validated.quantity } }
      });

      // 3. Record Inventory Transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          medicationId: validated.medicationId,
          batchId: batch.id,
          type: "STOCK_IN",
          quantity: validated.quantity,
          batchNumber: validated.batchNumber,
          expiryDate: validated.expiryDate,
          recordedByUserId: user.id
        }
      });

      return { batch, transaction };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Restock Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to restock medication" }, { status: 500 });
  }
}
