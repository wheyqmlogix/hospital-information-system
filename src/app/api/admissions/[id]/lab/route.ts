import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const LabOrderSchema = z.object({
  testId: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authorize("create_lab_orders");
    const body = await req.json();
    const validated = LabOrderSchema.parse(body);

    const year = new Date().getFullYear();
    const count = await prisma.labOrder.count();
    const orderNumber = `LAB-${year}-${(count + 1).toString().padStart(5, "0")}`;

    const labOrder = await prisma.labOrder.create({
      data: {
        admissionId: id,
        testId: validated.testId,
        orderNumber,
        status: "PENDING",
        orderedByUserId: user.id
      },
      include: { test: true }
    });

    return NextResponse.json(labOrder, { status: 201 });
  } catch (error: any) {
    console.error("Lab Order Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to place lab order" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("view_lab_orders");
    const orders = await prisma.labOrder.findMany({
      where: { admissionId: id },
      include: { test: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Fetch Lab Orders Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch lab orders" }, { status: 500 });
  }
}
