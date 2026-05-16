import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const RestockSchema = z.object({
  supplyItemId: z.string(),
  batchNumber: z.string(),
  expiryDate: z.string().optional().transform(val => val ? new Date(val) : null),
  quantity: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const user = await authorize("manage_inventory");
    const body = await req.json();
    const validated = RestockSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Supply Batch
      const batch = await tx.supplyBatch.create({
        data: {
          supplyItemId: validated.supplyItemId,
          batchNumber: validated.batchNumber,
          expiryDate: validated.expiryDate,
          initialQuantity: validated.quantity,
          remainingQuantity: validated.quantity,
          status: "ACTIVE"
        }
      });

      // 2. Update Supply Total Stock
      await tx.supplyItem.update({
        where: { id: validated.supplyItemId },
        data: { stock: { increment: validated.quantity } }
      });

      // 3. Record Supply Transaction
      const transaction = await tx.supplyTransaction.create({
        data: {
          supplyItemId: validated.supplyItemId,
          batchId: batch.id,
          type: "STOCK_IN",
          quantity: validated.quantity,
          batchNumber: validated.batchNumber,
          recordedByUserId: user.id
        }
      });

      return { batch, transaction };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("CSR Restock Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to restock supply item" }, { status: 500 });
  }
}
