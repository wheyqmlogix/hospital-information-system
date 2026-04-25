import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: { vitals: true },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vitals, ...patientData } = body;

    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        vitals: vitals ? { create: vitals } : undefined,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
