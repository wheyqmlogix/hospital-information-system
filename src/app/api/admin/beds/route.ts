import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const BedSchema = z.object({
  name: z.string().min(1),
  roomId: z.string().min(1),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE", "CLEANING"]).default("VACANT"),
});

export async function POST(req: Request) {
  try {
    await authorize("system_admin");
    const body = await req.json();
    const validated = BedSchema.parse(body);

    const bed = await prisma.bed.create({
      data: validated
    });

    return NextResponse.json(bed, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create bed" }, { status: 500 });
  }
}
