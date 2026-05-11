import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        primaryCaseRate: true
      }
    });

    if (!admission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json(admission);
  } catch (error) {
    console.error("Fetch Admission Error:", error);
    return NextResponse.json({ error: "Failed to fetch admission" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { finalDiagnosis, primaryCaseRateId, status } = body;

    const updated = await prisma.admission.update({
      where: { id: params.id },
      data: {
        finalDiagnosis,
        primaryCaseRateId,
        status,
        dischargedAt: status === "DISCHARGED" ? new Date() : undefined
      },
      include: {
        primaryCaseRate: true
      }
    });

    // If case rate is updated, we need to update the invoice PhilHealth amount
    if (primaryCaseRateId) {
      const caseRate = await prisma.caseRate.findUnique({ where: { id: primaryCaseRateId } });
      if (caseRate) {
        await prisma.invoice.update({
          where: { admissionId: params.id },
          data: {
            philHealthAmount: caseRate.totalAmount
          }
        });
        
        // Trigger recalculation of netAmount
        const invoice = await prisma.invoice.findUnique({
          where: { admissionId: params.id },
          include: { items: true }
        });
        
        if (invoice) {
          const isSeniorOrPWD = invoice.discountType === "SENIOR_CITIZEN" || invoice.discountType === "PWD";
          const { calculatePHBilling } = await import("@/lib/billing");
          const billingItems = invoice.items.map(item => ({
            unitPrice: Number(item.unitPrice),
            quantity: item.quantity,
            isVatable: item.isVatable
          }));
          
          const totals = calculatePHBilling(billingItems, isSeniorOrPWD);
          
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              netAmount: Number(totals.netAmount) - Number(caseRate.totalAmount)
            }
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Admission Error:", error);
    return NextResponse.json({ error: "Failed to update admission" }, { status: 500 });
  }
}
