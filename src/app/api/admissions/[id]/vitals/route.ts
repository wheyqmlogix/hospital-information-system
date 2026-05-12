import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authorize("add_vitals");
    const admissionId = id;
    const body = await req.json();
    const validated = VitalsSchema.parse(body);

    const vitals = await prisma.vitals.create({
      data: {
        ...validated,
        admissionId,
        recordedByUserId: user.id
      }
    });

    return NextResponse.json(vitals, { status: 201 });
  } catch (error: any) {
    console.error("Vitals Log Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to record vitals" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("view_vitals");
    const vitals = await prisma.vitals.findMany({
      where: { admissionId: id },
      orderBy: { recordedAt: "desc" }
    });

    return NextResponse.json(vitals);
  } catch (error: any) {
    console.error("Fetch Vitals Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch vitals" }, { status: 500 });
  }
}
