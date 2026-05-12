import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    await authorize("view_billing");
    const { patientId } = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // Mock PhilHealth PBEF (PhilHealth Benefit Eligibility Form) logic
    const hasPIN = !!patient.philHealthPIN;
    const isEligible = hasPIN && Math.random() > 0.1; // 90% chance if they have a PIN

    return NextResponse.json({
      eligible: isEligible,
      trackingNumber: isEligible ? `PBEF-${Date.now()}` : null,
      message: isEligible ? "Patient is eligible for benefits." : "Eligibility check failed. Please verify PIN and contributions.",
      details: {
        fullName: `${patient.lastName}, ${patient.firstName}`,
        pin: patient.philHealthPIN || "NOT_PROVIDED",
        asOf: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("PhilHealth Eligibility Error:", error);
    return NextResponse.json({ error: "Failed to check eligibility" }, { status: 500 });
  }
}
