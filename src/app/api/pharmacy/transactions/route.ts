import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function GET() {
  try {
    await authorize("manage_inventory");
    const transactions = await prisma.inventoryTransaction.findMany({
      include: {
        medication: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Fetch Inventory Transactions Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
