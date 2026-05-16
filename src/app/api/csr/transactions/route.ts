import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function GET() {
  try {
    await authorize("manage_inventory");
    const transactions = await prisma.supplyTransaction.findMany({
      include: {
        supplyItem: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Fetch Supply Transactions Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch supply transactions" }, { status: 500 });
  }
}
