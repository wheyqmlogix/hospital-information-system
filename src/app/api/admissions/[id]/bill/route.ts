import { calculateAdmissionBill } from "@/lib/billing/engine";
import { NextResponse } from "next/server";

export async function GET(
  req: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const hospitalLevel = parseInt(searchParams.get("level") || "1") as 1 | 2;
    
    const result = await calculateAdmissionBill(id, hospitalLevel);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Billing Calculation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
