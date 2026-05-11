import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const NoteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty"),
  type: z.enum(["PROGRESS", "SHIFT_REPORT", "INCIDENT"]).default("PROGRESS"),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = NoteSchema.parse(body);

    const nursingNote = await prisma.nursingNote.create({
      data: {
        admissionId: params.id,
        ...validated
      }
    });

    return NextResponse.json(nursingNote, { status: 201 });
  } catch (error) {
    console.error("Nursing Note Error:", error);
    return NextResponse.json({ error: "Failed to record nursing note" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notes = await prisma.nursingNote.findMany({
      where: { admissionId: params.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Fetch Nursing Notes Error:", error);
    return NextResponse.json({ error: "Failed to fetch nursing notes" }, { status: 500 });
  }
}
