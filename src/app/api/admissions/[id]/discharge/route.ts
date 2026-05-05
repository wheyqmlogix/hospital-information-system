import { processDischarge } from "@/lib/clinical/discharge";
import { NextResponse } from "next/server";
import { z } from "zod";

const DischargeSchema = z.object({
  finalDiagnosis: z.string().min(3),
  homeMedications: z.string().min(1),
  followUpInstructions: z.string().min(1)
});

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Validate input
    const validated = DischargeSchema.parse(body);
    
    const result = await processDischarge({
      admissionId: id,
      ...validated
    });
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Discharge Failed" }, { status: 500 });
  }
}
