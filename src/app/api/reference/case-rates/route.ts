import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  try {
    const caseRates = await prisma.caseRate.findMany({
      where: query ? {
        OR: [
          { code: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ]
      } : {},
      take: 20,
    });

    // Seed if empty for demo
    if (caseRates.length === 0 && !query) {
      const demoRates = [
        { code: "A91", description: "Dengue Fever / Dengue Hemorrhagic Fever", itemType: "ICD", hciAmount: 5600, hcpAmount: 2400, totalAmount: 8000 },
        { code: "J18.9", description: "Pneumonia, unspecified organism (Moderate Risk)", itemType: "ICD", hciAmount: 10500, hcpAmount: 4500, totalAmount: 15000 },
        { code: "A09", description: "Diarrhea and gastroenteritis of infectious origin", itemType: "ICD", hciAmount: 4200, hcpAmount: 1800, totalAmount: 6000 },
        { code: "650", description: "Normal Spontaneous Delivery (NSD)", itemType: "RVS", hciAmount: 3500, hcpAmount: 1500, totalAmount: 5000 },
      ];

      for (const rate of demoRates) {
        await prisma.caseRate.upsert({
          where: { code: rate.code },
          update: {},
          create: rate
        });
      }
      
      const seeded = await prisma.caseRate.findMany({ take: 20 });
      return NextResponse.json(seeded);
    }

    return NextResponse.json(caseRates);
  } catch (error) {
    console.error("Case Rate Error:", error);
    return NextResponse.json({ error: "Failed to fetch case rates" }, { status: 500 });
  }
}
