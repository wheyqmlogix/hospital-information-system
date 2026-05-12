import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  try {
    const medications = await prisma.medication.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { genericName: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ]
      } : {},
      orderBy: { name: "asc" }
    });

    // Seed if empty for demo
    if (medications.length === 0 && !query) {
      const demoMeds = [
        { code: "PAR-500", name: "Biogesic", genericName: "Paracetamol", form: "TABLET", strength: "500mg", unit: "pc", price: 5, stock: 500 },
        { code: "AMO-500", name: "Amoxicillin", genericName: "Amoxicillin", form: "CAPSULE", strength: "500mg", unit: "pc", price: 12, stock: 200 },
        { code: "MET-500", name: "Metformin", genericName: "Metformin", form: "TABLET", strength: "500mg", unit: "pc", price: 8, stock: 300 },
        { code: "LOS-50", name: "Losartan", genericName: "Losartan Potassium", form: "TABLET", strength: "50mg", unit: "pc", price: 15, stock: 150 },
      ];

      for (const med of demoMeds) {
        await prisma.medication.upsert({
          where: { code: med.code },
          update: {},
          create: med
        });
      }
      return NextResponse.json(await prisma.medication.findMany());
    }

    return NextResponse.json(medications);
  } catch (error) {
    console.error("Pharmacy API Error:", error);
    return NextResponse.json({ error: "Failed to fetch medications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const medication = await prisma.medication.create({
      data: {
        code: body.code,
        name: body.name,
        genericName: body.genericName,
        form: body.form,
        strength: body.strength,
        unit: body.unit,
        price: body.price,
        reorderLevel: body.reorderLevel,
        stock: 0
      }
    });
    return NextResponse.json(medication, { status: 201 });
  } catch (error) {
    console.error("Create Medication Error:", error);
    return NextResponse.json({ error: "Failed to create medication" }, { status: 500 });
  }
}
