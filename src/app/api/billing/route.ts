import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    await authorize("view_billing");
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const status = searchParams.get("status");

    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { invoiceNumber: { contains: query, mode: "insensitive" } },
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
              }
            ]
          } : {},
          status ? { status: status as any } : {}
        ]
      },
      include: {
        admission: {
          include: {
            patient: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("Fetch Invoices Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
