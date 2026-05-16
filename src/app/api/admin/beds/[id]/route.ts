import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const BedSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE", "CLEANING"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");
    const body = await req.json();
    const validated = BedSchema.parse(body);

    // If changing to MAINTENANCE or CLEANING, check if occupied
    if (validated.status && (validated.status === "MAINTENANCE" || validated.status === "CLEANING")) {
      const bed = await prisma.bed.findUnique({
        where: { id },
        select: { status: true }
      });
      
      if (bed?.status === "OCCUPIED") {
        return NextResponse.json(
          { error: "Cannot mark occupied bed for maintenance or cleaning." },
          { status: 400 }
        );
      }
    }

    const bed = await prisma.bed.update({
      where: { id },
      data: validated
    });

    return NextResponse.json(bed);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update bed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");

    // Check if bed is occupied
    const bed = await prisma.bed.findUnique({
      where: { id },
      select: { status: true }
    });

    if (bed?.status === "OCCUPIED") {
      return NextResponse.json(
        { error: "Cannot delete an occupied bed." },
        { status: 400 }
      );
    }

    await prisma.bed.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete bed" }, { status: 500 });
  }
}
