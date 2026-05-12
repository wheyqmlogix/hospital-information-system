import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const PaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "CARD", "GCASH", "CHECK", "BANK_TRANSFER"]),
  referenceNumber: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await authorize("manage_billing");
    const body = await req.json();
    const validated = PaymentSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record the payment
      const payment = await tx.payment.create({
        data: {
          invoiceId: validated.invoiceId,
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          referenceNumber: validated.referenceNumber,
          recordedByUserId: user.id
        }
      });

      // 2. Update Invoice totals and status
      const invoice = await tx.invoice.findUnique({
        where: { id: validated.invoiceId },
        include: { payments: true }
      });

      if (!invoice) throw new Error("Invoice not found");

      const totalPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const netAmount = Number(invoice.netAmount);
      const newBalance = netAmount - totalPaid;
      
      let status: "PAID" | "PARTIALLY_PAID" | "UNPAID" = "UNPAID";
      if (newBalance <= 0) {
        status = "PAID";
      } else if (totalPaid > 0) {
        status = "PARTIALLY_PAID";
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: validated.invoiceId },
        data: {
          paidAmount: totalPaid,
          balance: newBalance,
          status: status as any
        }
      });

      return { payment, updatedInvoice };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Payment Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to process payment" }, { status: 500 });
  }
}
