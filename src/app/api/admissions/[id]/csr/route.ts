import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const IssuanceSchema = z.object({
  supplyItemId: z.string(),
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
    const { supplyItemId, quantity } = IssuanceSchema.parse(body);

    // 1. Get supply item and check stock
    const supplyItem = await prisma.supplyItem.findUnique({
      where: { id: supplyItemId }
    });

    if (!supplyItem) {
      return NextResponse.json({ error: "Supply item not found" }, { status: 404 });
    }

    if (supplyItem.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // 2. Perform transaction: FEFO (First Expiry First Out)
    const result = await prisma.$transaction(async (tx) => {
      // a. Get active batches sorted by expiry date
      const activeBatches = await tx.supplyBatch.findMany({
        where: {
          supplyItemId,
          remainingQuantity: { gt: 0 },
          status: "ACTIVE"
        },
        orderBy: { expiryDate: "asc" }
      });

      let remainingToIssue = quantity;
      const transactions = [];

      for (const batch of activeBatches) {
        if (remainingToIssue <= 0) break;

        const issueFromBatch = Math.min(batch.remainingQuantity, remainingToIssue);
        
        // Update batch
        await tx.supplyBatch.update({
          where: { id: batch.id },
          data: {
            remainingQuantity: { decrement: issueFromBatch },
            status: batch.remainingQuantity - issueFromBatch === 0 ? "DEPLETED" : "ACTIVE"
          }
        });

        // Create transaction for this batch
        const trans = await tx.supplyTransaction.create({
          data: {
            supplyItemId,
            batchId: batch.id,
            type: "DISPENSE",
            quantity: -issueFromBatch,
            batchNumber: batch.batchNumber,
            referenceId: admissionId,
          }
        });

        transactions.push(trans);
        remainingToIssue -= issueFromBatch;
      }

      // If no batches but stock exists (initial seed case or stock without batches)
      if (remainingToIssue > 0 && activeBatches.length === 0) {
        const trans = await tx.supplyTransaction.create({
          data: {
            supplyItemId,
            type: "DISPENSE",
            quantity: -remainingToIssue,
            referenceId: admissionId,
          }
        });
        transactions.push(trans);
        remainingToIssue = 0;
      }

      if (remainingToIssue > 0) {
        throw new Error("Insufficient stock across all active batches");
      }

      // b. Update Supply Item Total Stock
      await tx.supplyItem.update({
        where: { id: supplyItemId },
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
      const totalPrice = Number(supplyItem.price) * quantity;
      const invoiceItem = await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          category: "CSR",
          description: `${supplyItem.name} (${supplyItem.code})`,
          quantity,
          unitPrice: supplyItem.price,
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
          netAmount: totals.netAmount,
          balance: totals.netAmount - Number(invoice.paidAmount)
        }
      });

      return invoiceItem;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("CSR Issuance Error:", error);
    return NextResponse.json({ error: error.message || "Failed to issue supply item" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transactions = await prisma.supplyTransaction.findMany({
      where: { 
        referenceId: id,
        type: "DISPENSE"
      },
      include: { supplyItem: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch Issued CSR Error:", error);
    return NextResponse.json({ error: "Failed to fetch issued CSR items" }, { status: 500 });
  }
}
