import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const VitalsSchema = z.object({
  bpSystolic: z.number().int().optional().nullable(),
  bpDiastolic: z.number().int().optional().nullable(),
  temperature: z.number().optional().nullable(),
  pulseRate: z.number().int().optional().nullable(),
  respiratoryRate: z.number().int().optional().nullable(),
  o2Saturation: z.number().int().optional().nullable(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admissionId = params.id;
    const body = await req.json();
    const validated = VitalsSchema.parse(body);

    const vitals = await prisma.vitals.create({
      data: {
        ...validated,
        admissionId
      }
    });

    return NextResponse.json(vitals, { status: 201 });
  } catch (error) {
    console.error("Vitals Log Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to record vitals" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vitals = await prisma.vitals.findMany({
      where: { admissionId: params.id },
      orderBy: { recordedAt: "desc" }
    });

    return NextResponse.json(vitals);
  } catch (error) {
    console.error("Fetch Vitals Error:", error);
    return NextResponse.json({ error: "Failed to fetch vitals" }, { status: 500 });
  }
}
