import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const admissions = await prisma.admission.findMany({
      where: {
        status: "ACTIVE",
        type: "ER"
      },
      include: {
        patient: true,
        vitals: {
          orderBy: { recordedAt: "desc" },
          take: 1
        }
      },
      orderBy: [
        { triageLevel: "asc" }, // LEVEL_1 comes first
        { admittedAt: "asc" }   // Then by longest wait time
      ]
    });

    return NextResponse.json(admissions);
  } catch (error) {
    console.error("ER Queue Error:", error);
    return NextResponse.json({ error: "Failed to fetch ER queue" }, { status: 500 });
  }
}
