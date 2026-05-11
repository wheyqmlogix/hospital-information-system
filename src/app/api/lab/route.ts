import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  try {
    const tests = await prisma.labTest.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ]
      } : {},
      orderBy: { category: "asc" }
    });

    // Seed if empty for demo
    if (tests.length === 0 && !query) {
      const demoTests = [
        { code: "CBC", name: "Complete Blood Count", category: "HEMATOLOGY", price: 250 },
        { code: "UA", name: "Urinalysis", category: "CLINICAL_MICROSCOPY", price: 150 },
        { code: "FBS", name: "Fasting Blood Sugar", category: "CHEMISTRY", price: 200 },
        { code: "CHOL", name: "Cholesterol", category: "CHEMISTRY", price: 300 },
      ];

      for (const test of demoTests) {
        await prisma.labTest.upsert({
          where: { code: test.code },
          update: {},
          create: test
        });
      }
      return NextResponse.json(await prisma.labTest.findMany());
    }

    return NextResponse.json(tests);
  } catch (error) {
    console.error("Lab API Error:", error);
    return NextResponse.json({ error: "Failed to fetch lab tests" }, { status: 500 });
  }
}
