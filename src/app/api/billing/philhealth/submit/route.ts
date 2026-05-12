import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    await authorize("manage_billing");
    const { invoiceId } = await req.json();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { admission: { include: { patient: true } } }
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // 1. Create or update PhilHealth Claim record
    const claim = await prisma.philHealthClaim.upsert({
      where: { invoiceId },
      update: {
        status: "SUBMITTED",
        claimSeriesLnk: `SERIES-${Date.now()}`,
        dateSubmitted: new Date(),
        totalAmountClaimed: invoice.philHealthAmount
      },
      create: {
        invoiceId,
        status: "SUBMITTED",
        claimSeriesLnk: `SERIES-${Date.now()}`,
        dateSubmitted: new Date(),
        totalAmountClaimed: invoice.philHealthAmount
      }
    });

    return NextResponse.json({
      success: true,
      claim,
      message: "Claim submitted successfully to PhilHealth e-Claims portal (Mock)."
    });
  } catch (error: any) {
    console.error("PhilHealth Submission Error:", error);
    return NextResponse.json({ error: "Failed to submit e-Claim" }, { status: 500 });
  }
}
