import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const WardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");
    
    const ward = await prisma.ward.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            beds: true
          }
        }
      }
    });

    if (!ward) {
      return NextResponse.json({ error: "Ward not found" }, { status: 404 });
    }

    return NextResponse.json(ward);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch ward" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");
    const body = await req.json();
    const validated = WardSchema.parse(body);

    const ward = await prisma.ward.update({
      where: { id },
      data: validated
    });

    return NextResponse.json(ward);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update ward" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("system_admin");

    // Check if ward has rooms
    const ward = await prisma.ward.findUnique({
      where: { id },
      include: { _count: { select: { rooms: true } } }
    });

    if (ward && ward._count.rooms > 0) {
      return NextResponse.json(
        { error: "Cannot delete ward with existing rooms. Please remove rooms first." },
        { status: 400 }
      );
    }

    await prisma.ward.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete ward" }, { status: 500 });
  }
}
