import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("view_admissions");
    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        patient: true,
        primaryCaseRate: true
      }
    });

    if (!admission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json(admission);
  } catch (error: any) {
    console.error("Fetch Admission Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch admission" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("create_admissions");
    const body = await req.json();
    const { finalDiagnosis, primaryCaseRateId, secondaryCaseRateId, status } = body;

    const updated = await prisma.admission.update({
      where: { id },
      data: {
        finalDiagnosis,
        primaryCaseRateId,
        secondaryCaseRateId,
        status,
        dischargedAt: status === "DISCHARGED" ? new Date() : undefined
      },
      include: {
        primaryCaseRate: true,
        secondaryCaseRate: true
      }
    });

    // If case rate is updated, we need to update the invoice PhilHealth amount
    if (primaryCaseRateId || secondaryCaseRateId) {
      const primaryRate = primaryCaseRateId ? await prisma.caseRate.findUnique({ where: { id: primaryCaseRateId } }) : null;
      const secondaryRate = secondaryCaseRateId ? await prisma.caseRate.findUnique({ where: { id: secondaryCaseRateId } }) : null;
      
      let totalPhilHealth = 0;
      if (primaryRate) {
        totalPhilHealth += Number(primaryRate.totalAmount);
      }
      if (secondaryRate) {
        // PhilHealth rule: Second case rate is 50%
        totalPhilHealth += Number(secondaryRate.totalAmount) * 0.5;
      }

      await prisma.invoice.update({
        where: { admissionId: id },
        data: {
          philHealthAmount: totalPhilHealth
        }
      });
      
      // Trigger recalculation of netAmount
      const invoice = await prisma.invoice.findUnique({
        where: { admissionId: id },
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
        
        const totals = calculatePHBilling(billingItems, isSeniorOrPWD, totalPhilHealth);
        
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            netAmount: totals.netAmount,
            grossAmount: totals.grossAmount,
            vatAmount: totals.vatAmount,
            discountAmount: totals.discountAmount,
            balance: Number(totals.netAmount) - Number(invoice.paidAmount)
          }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Admission Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update admission" }, { status: 500 });
  }
}
