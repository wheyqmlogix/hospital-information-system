import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";
import { z } from "zod";

const UpdateLabOrderSchema = z.object({
  status: z.enum(["PENDING", "COLLECTED", "PROCESSING", "COMPLETED", "CANCELLED"]),
  result: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("manage_lab_results");
    const body = await req.json();
    const validated = UpdateLabOrderSchema.parse(body);

    const updated = await prisma.labOrder.update({
      where: { id },
      data: {
        status: validated.status,
        result: validated.result,
      },
      include: { test: true }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Lab Order Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update lab order" }, { status: 500 });
  }
}
