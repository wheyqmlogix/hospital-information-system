import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePHBilling } from "@/lib/billing";
import { authorize } from "@/lib/auth-server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("view_billing");
    const admissionId = id;

    let invoice = await prisma.invoice.findUnique({
      where: { admissionId },
      include: {
        items: {
          include: { staff: true }
        },
        admission: {
          include: { patient: true }
        }
      }
    });

    // If no invoice exists, create a draft one
    if (!invoice) {
      const year = new Date().getFullYear();
      const count = await prisma.invoice.count();
      const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(5, "0")}`;

      invoice = await prisma.invoice.create({
        data: {
          admissionId,
          invoiceNumber,
          status: "DRAFT"
        },
        include: {
          items: {
            include: { staff: true }
          },
          admission: {
            include: { patient: true }
          }
        }
      });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error("Fetch Invoice Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("manage_billing");
    const admissionId = id;
    const { status, discountType } = await req.json();

    const invoice = await prisma.invoice.findUnique({
      where: { admissionId },
      include: {
        items: true,
        admission: { include: { patient: true } }
      }
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // Re-calculate totals if discount type changed
    const isSeniorOrPWD = discountType === "SENIOR_CITIZEN" || discountType === "PWD";
    const billingItems = invoice.items.map(item => ({
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      isVatable: item.isVatable
    }));

    const totals = calculatePHBilling(billingItems, isSeniorOrPWD, Number(invoice.philHealthAmount));
    const paidAmount = Number(invoice.paidAmount);
    const balance = totals.netAmount - paidAmount;

    const updated = await prisma.invoice.update({
      where: { admissionId },
      data: {
        status: status || (balance <= 0 ? "PAID" : (paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID")),
        discountType,
        grossAmount: totals.grossAmount,
        vatAmount: totals.vatAmount,
        discountAmount: totals.discountAmount,
        philHealthAmount: totals.philHealthAmount,
        netAmount: totals.netAmount,
        balance: balance
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Invoice Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
