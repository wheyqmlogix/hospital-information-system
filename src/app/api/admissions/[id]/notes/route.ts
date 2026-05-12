import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const NoteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty"),
  type: z.enum(["PROGRESS", "SHIFT_REPORT", "INCIDENT"]).default("PROGRESS"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authorize("add_clinical_notes");
    const body = await req.json();
    const validated = NoteSchema.parse(body);

    const nursingNote = await prisma.nursingNote.create({
      data: {
        admissionId: id,
        ...validated,
        recordedByUserId: user.id
      }
    });

    return NextResponse.json(nursingNote, { status: 201 });
  } catch (error: any) {
    console.error("Nursing Note Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to record nursing note" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("view_clinical_notes");
    const notes = await prisma.nursingNote.findMany({
      where: { admissionId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(notes);
  } catch (error: any) {
    console.error("Fetch Nursing Notes Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch nursing notes" }, { status: 500 });
  }
}
