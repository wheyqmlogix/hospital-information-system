import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const LabOrderSchema = z.object({
  testId: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = LabOrderSchema.parse(body);

    const year = new Date().getFullYear();
    const count = await prisma.labOrder.count();
    const orderNumber = `LAB-${year}-${(count + 1).toString().padStart(5, "0")}`;

    const labOrder = await prisma.labOrder.create({
      data: {
        admissionId: params.id,
        testId: validated.testId,
        orderNumber,
        status: "PENDING"
      },
      include: { test: true }
    });

    return NextResponse.json(labOrder, { status: 201 });
  } catch (error) {
    console.error("Lab Order Error:", error);
    return NextResponse.json({ error: "Failed to place lab order" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orders = await prisma.labOrder.findMany({
      where: { admissionId: params.id },
      include: { test: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch Lab Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch lab orders" }, { status: 500 });
  }
}
