import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        beds: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        roomNumber: "asc",
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomNumber, type, floor, bedsCount } = body;

    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({
        data: {
          roomNumber,
          type,
          floor,
        },
      });

      if (bedsCount && bedsCount > 0) {
        const bedsData = Array.from({ length: bedsCount }).map((_, i) => ({
          bedNumber: `${roomNumber}-${String.fromCharCode(65 + i)}`,
          roomId: newRoom.id,
          status: "AVAILABLE",
        }));

        await tx.bed.createMany({
          data: bedsData,
        });
      }

      return await tx.room.findUnique({
        where: { id: newRoom.id },
        include: { beds: true },
      });
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
