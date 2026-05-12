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
        primaryCaseRate: true,
        vitals: {
          orderBy: { recordedAt: "desc" }
        },
        nursingNotes: {
          orderBy: { createdAt: "asc" }
        },
        labOrders: {
          include: { test: true },
          orderBy: { createdAt: "asc" }
        },
        doctorOrders: {
          include: { 
            orderedBy: true,
            executedBy: true 
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!admission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json(admission);
  } catch (error: any) {
    console.error("Discharge Summary Data Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch summary data" }, { status: 500 });
  }
}
