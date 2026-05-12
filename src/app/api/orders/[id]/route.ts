import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";
import { z } from "zod";

const UpdateOrderSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISCONTINUED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authorize("add_clinical_notes"); // Assuming nurses/staff who can add notes can execute orders
    const body = await req.json();
    const validated = UpdateOrderSchema.parse(body);

    const staff = await prisma.staff.findFirst({
      where: { user: { id: user.id } }
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff record not found for this user" }, { status: 404 });
    }

    const data: any = { status: validated.status };
    
    if (validated.status === "COMPLETED") {
      data.executedById = staff.id;
      data.executedAt = new Date();
    }

    const updated = await prisma.doctorOrder.update({
      where: { id },
      data,
      include: {
        orderedBy: true,
        executedBy: true
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Doctor Order Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update doctor order" }, { status: 500 });
  }
}
