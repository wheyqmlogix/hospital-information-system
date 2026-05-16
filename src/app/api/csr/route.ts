import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  try {
    const supplies = await prisma.supplyItem.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ]
      } : {},
      orderBy: { name: "asc" }
    });

    // Seed if empty for demo
    if (supplies.length === 0 && !query) {
      const demoSupplies = [
        { code: "GLV-S-01", name: "Surgical Gloves (Small)", category: "PROTECTIVE", unit: "pair", price: 25, stock: 1000 },
        { code: "GLV-M-01", name: "Surgical Gloves (Medium)", category: "PROTECTIVE", unit: "pair", price: 25, stock: 1200 },
        { code: "SYR-5CC", name: "Disposable Syringe (5cc)", category: "CONSUMABLE", unit: "pc", price: 15, stock: 500 },
        { code: "GAZ-4X4", name: "Sterile Gauze (4x4)", category: "CONSUMABLE", unit: "pad", price: 10, stock: 2000 },
      ];

      for (const item of demoSupplies) {
        await prisma.supplyItem.upsert({
          where: { code: item.code },
          update: {},
          create: item
        });
      }
      return NextResponse.json(await prisma.supplyItem.findMany());
    }

    return NextResponse.json(supplies);
  } catch (error) {
    console.error("CSR API Error:", error);
    return NextResponse.json({ error: "Failed to fetch supplies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supply = await prisma.supplyItem.create({
      data: {
        code: body.code,
        name: body.name,
        category: body.category,
        unit: body.unit,
        price: body.price,
        reorderLevel: body.reorderLevel,
        stock: 0
      }
    });
    return NextResponse.json(supply, { status: 201 });
  } catch (error) {
    console.error("Create Supply Error:", error);
    return NextResponse.json({ error: "Failed to create supply item" }, { status: 500 });
  }
}
