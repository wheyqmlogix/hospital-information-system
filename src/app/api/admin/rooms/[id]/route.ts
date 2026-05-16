import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const RoomSchema = z.object({
  name: z.string().min(1),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");
    const body = await req.json();
    const validated = RoomSchema.parse(body);

    const room = await prisma.room.update({
      where: { id },
      data: validated
    });

    return NextResponse.json(room);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");

    // Check if room has beds
    const room = await prisma.room.findUnique({
      where: { id },
      include: { _count: { select: { beds: true } } }
    });

    if (room && room._count.beds > 0) {
      return NextResponse.json(
        { error: "Cannot delete room with existing beds. Please remove beds first." },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}
