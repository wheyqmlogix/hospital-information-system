import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { authorize } from "@/lib/auth-server";

const OrderSchema = z.object({
  type: z.enum(["MEDICATION", "LABORATORY", "DIAGNOSTIC", "PROCEDURE", "DIET", "ACTIVITY", "DISPOSITION", "OTHER"]),
  description: z.string().min(1, "Order description is required"),
  instructions: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authorize("create_admissions"); // Assuming doctors can create admissions/orders
    const body = await req.json();
    const validated = OrderSchema.parse(body);

    // Get the staff record for the current user
    const staff = await prisma.staff.findFirst({
      where: { user: { id: user.id } }
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff record not found for this user" }, { status: 404 });
    }

    const doctorOrder = await prisma.doctorOrder.create({
      data: {
        admissionId: id,
        ...validated,
        status: "PENDING",
        orderedById: staff.id
      },
      include: {
        orderedBy: true
      }
    });

    return NextResponse.json(doctorOrder, { status: 201 });
  } catch (error: any) {
    console.error("Doctor Order Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create doctor order" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authorize("view_admissions");
    const orders = await prisma.doctorOrder.findMany({
      where: { admissionId: id },
      include: {
        orderedBy: true,
        executedBy: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Fetch Doctor Orders Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch doctor orders" }, { status: 500 });
  }
}
