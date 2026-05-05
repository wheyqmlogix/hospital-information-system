import { createAdmission } from "./actions";
import { NextResponse } from "next/server";

/**
 * FHIR-aligned Admission (Encounter) endpoint.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createAdmission(data);
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }
}
