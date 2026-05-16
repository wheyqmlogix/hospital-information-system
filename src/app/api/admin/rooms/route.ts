import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const RoomSchema = z.object({
  name: z.string().min(1),
  wardId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await authorize("system_admin");
    const body = await req.json();
    const validated = RoomSchema.parse(body);

    const room = await prisma.room.create({
      data: validated
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
