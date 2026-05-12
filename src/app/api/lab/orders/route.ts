import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    await authorize("view_lab_orders");
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    const orders = await prisma.labOrder.findMany({
      where: {
        AND: [
          status && status !== "ALL" ? { status } : {},
          query ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              {
                admission: {
                  patient: {
                    OR: [
                      { firstName: { contains: query, mode: "insensitive" } },
                      { lastName: { contains: query, mode: "insensitive" } },
                      { patientId: { contains: query, mode: "insensitive" } },
                    ]
                  }
                }
              },
              {
                test: {
                  name: { contains: query, mode: "insensitive" }
                }
              }
            ]
          } : {}
        ]
      },
      include: {
        test: true,
        admission: {
          include: {
            patient: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Fetch All Lab Orders Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch lab orders" }, { status: 500 });
  }
}
