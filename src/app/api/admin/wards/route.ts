import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";
import { z } from "zod";

const WardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  try {
    await authorize("view_admissions");

    const wards = await prisma.ward.findMany({
      include: {
        rooms: {
          include: {
            beds: {
              include: {
                currentAdmission: {
                  include: {
                    patient: {
                      select: {
                        firstName: true,
                        lastName: true,
                        gender: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    // If no wards exist, seed some demo data for the UI to be visible
    if (wards.length === 0) {
      const demoWards = [
        { name: "Emergency Room", description: "Immediate care and triage." },
        { name: "Male Ward", description: "General admission for male patients." },
        { name: "Female Ward", description: "General admission for female patients." },
        { name: "ICU", description: "Intensive Care Unit." }
      ];

      for (const w of demoWards) {
        await prisma.ward.create({
          data: {
            ...w,
            rooms: {
              create: [
                {
                  name: "Room A",
                  beds: {
                    create: [
                      { name: "Bed 1", status: "VACANT" },
                      { name: "Bed 2", status: "VACANT" }
                    ]
                  }
                },
                {
                  name: "Room B",
                  beds: {
                    create: [
                      { name: "Bed 1", status: "VACANT" },
                      { name: "Bed 2", status: "VACANT" }
                    ]
                  }
                }
              ]
            }
          }
        });
      }
      
      const seededWards = await prisma.ward.findMany({
        include: {
          rooms: {
            include: {
              beds: {
                include: {
                  currentAdmission: {
                    include: {
                      patient: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      return NextResponse.json(seededWards);
    }

    return NextResponse.json(wards);
  } catch (error: any) {
    console.error("Ward Map Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch ward map" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await authorize("system_admin");
    const body = await req.json();
    const validated = WardSchema.parse(body);

    const ward = await prisma.ward.create({
      data: validated
    });

    return NextResponse.json(ward, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create ward" }, { status: 500 });
  }
}
