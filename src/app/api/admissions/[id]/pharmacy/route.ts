import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const DispenseSchema = z.object({
  medicationId: z.string(),
  quantity: z.number().int().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admissionId = id;
    const body = await req.json();
    const { medicationId, quantity } = DispenseSchema.parse(body);

    // 1. Get medication and check stock
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    });

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }

    if (medication.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // 2. Perform transaction: FEFO (First Expiry First Out)
    const result = await prisma.$transaction(async (tx) => {
      // a. Get active batches sorted by expiry date
      const activeBatches = await tx.stockBatch.findMany({
        where: {
          medicationId,
          remainingQuantity: { gt: 0 },
          status: "ACTIVE"
        },
        orderBy: { expiryDate: "asc" }
      });

      let remainingToDispense = quantity;
      const transactions = [];

      for (const batch of activeBatches) {
        if (remainingToDispense <= 0) break;

        const dispenseFromBatch = Math.min(batch.remainingQuantity, remainingToDispense);
        
        // Update batch
        const updatedBatch = await tx.stockBatch.update({
          where: { id: batch.id },
          data: {
            remainingQuantity: { decrement: dispenseFromBatch },
            status: batch.remainingQuantity - dispenseFromBatch === 0 ? "DEPLETED" : "ACTIVE"
          }
        });

        // Create transaction for this batch
        const trans = await tx.inventoryTransaction.create({
          data: {
            medicationId,
            batchId: batch.id,
            type: "DISPENSE",
            quantity: -dispenseFromBatch,
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate,
            referenceId: admissionId,
          }
        });

        transactions.push(trans);
        remainingToDispense -= dispenseFromBatch;
      }

      if (remainingToDispense > 0) {
        throw new Error("Insufficient stock across all active batches");
      }

      // b. Update Medication Total Stock
      await tx.medication.update({
        where: { id: medicationId },
        data: { stock: { decrement: quantity } }
      });

      // c. Get or create invoice
      let invoice = await tx.invoice.findUnique({
        where: { admissionId }
      });

      if (!invoice) {
        const year = new Date().getFullYear();
        const count = await tx.invoice.count();
        const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(5, "0")}`;
        invoice = await tx.invoice.create({
          data: { admissionId, invoiceNumber }
        });
      }

      // d. Add Item to Invoice
      const totalPrice = Number(medication.price) * quantity;
      const invoiceItem = await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          category: "MEDICATION",
          description: `${medication.name} (${medication.genericName}) ${medication.strength}`,
          quantity,
          unitPrice: medication.price,
          totalPrice,
          isVatable: true
        }
      });

      // e. Recalculate Invoice Totals
      const allItems = await tx.invoiceItem.findMany({
        where: { invoiceId: invoice.id }
      });

      const isSeniorOrPWD = invoice.discountType === "SENIOR_CITIZEN" || invoice.discountType === "PWD";
      const { calculatePHBilling } = await import("@/lib/billing");
      
      const billingItems = allItems.map(item => ({
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        isVatable: item.isVatable
      }));

      const totals = calculatePHBilling(billingItems, isSeniorOrPWD, Number(invoice.philHealthAmount));

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          grossAmount: totals.grossAmount,
          vatAmount: totals.vatAmount,
          discountAmount: totals.discountAmount,
          philHealthAmount: totals.philHealthAmount,
          netAmount: totals.netAmount
        }
      });

      return invoiceItem;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Dispensing Error:", error);
    return NextResponse.json({ error: "Failed to dispense medication" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { 
        referenceId: id,
        type: "DISPENSE"
      },
      include: { medication: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch Dispensed Error:", error);
    return NextResponse.json({ error: "Failed to fetch dispensed medications" }, { status: 500 });
  }
}
