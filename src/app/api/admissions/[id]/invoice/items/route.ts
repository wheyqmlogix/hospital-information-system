import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePHBilling } from "@/lib/billing";
import { z } from "zod";

const ItemSchema = z.object({
  category: z.string(),
  description: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  isVatable: z.boolean().default(true),
  staffId: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admissionId = params.id;
    const body = await req.json();
    const validated = ItemSchema.parse(body);

    // 1. Get or create invoice
    let invoice = await prisma.invoice.findUnique({
      where: { admissionId },
      include: { items: true }
    });

    if (!invoice) {
      const year = new Date().getFullYear();
      const count = await prisma.invoice.count();
      const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(5, "0")}`;
      invoice = await prisma.invoice.create({
        data: { admissionId, invoiceNumber },
        include: { items: true }
      });
    }

    // 2. Add the item
    const totalPrice = validated.unitPrice * validated.quantity;
    
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        ...validated,
        totalPrice
      }
    });

    // 3. Recalculate totals
    const allItems = await prisma.invoiceItem.findMany({
      where: { invoiceId: invoice.id }
    });

    const isSeniorOrPWD = invoice.discountType === "SENIOR_CITIZEN" || invoice.discountType === "PWD";
    const billingItems = allItems.map(item => ({
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      isVatable: item.isVatable
    }));

    const totals = calculatePHBilling(billingItems, isSeniorOrPWD, Number(invoice.philHealthAmount));

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        grossAmount: totals.grossAmount,
        vatAmount: totals.vatAmount,
        discountAmount: totals.discountAmount,
        philHealthAmount: totals.philHealthAmount,
        netAmount: totals.netAmount
      },
      include: { items: true }
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Add Invoice Item Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
