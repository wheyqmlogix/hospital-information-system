import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorize } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    await authorize("system_admin"); // Regulatory reports usually require admin access

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // 1. Patient Statistics
    const totalAdmissions = await prisma.admission.count({
      where: { admittedAt: { gte: startDate, lte: endDate } }
    });

    const totalDischarges = await prisma.admission.count({
      where: { 
        status: "DISCHARGED",
        dischargedAt: { gte: startDate, lte: endDate }
      }
    });

    // 2. Mortality (Sample - actually needs a PatientStatus.DECEASED or similar)
    // For now, let's assume we can count admissions with a specific outcome note or just mock it
    const deaths = await prisma.admission.count({
      where: { 
        patient: { status: "DECEASED" },
        dischargedAt: { gte: startDate, lte: endDate }
      }
    });

    // 3. Bed Statistics
    const totalBeds = await prisma.bed.count();
    
    // Total Patient Days (Sum of duration of stay for all admissions in the period)
    const admissionsInPeriod = await prisma.admission.findMany({
      where: {
        OR: [
          { admittedAt: { gte: startDate, lte: endDate } },
          { dischargedAt: { gte: startDate, lte: endDate } },
          { status: "ACTIVE" }
        ]
      },
      select: { admittedAt: true, dischargedAt: true }
    });

    let totalPatientDays = 0;
    admissionsInPeriod.forEach(adm => {
      const start = adm.admittedAt > startDate ? adm.admittedAt : startDate;
      const end = (adm.dischargedAt && adm.dischargedAt < endDate) ? adm.dischargedAt : (adm.dischargedAt ? adm.dischargedAt : new Date());
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalPatientDays += diffDays || 1; // Minimum 1 day
    });

    const alos = totalAdmissions > 0 ? (totalPatientDays / totalAdmissions) : 0;
    const occupancyRate = (totalBeds > 0) ? (totalPatientDays / (totalBeds * 365)) * 100 : 0;

    // 4. Top Morbidity (Cases)
    const topMorbidity = await prisma.caseRate.findMany({
      where: {
        admissions: {
          some: { admittedAt: { gte: startDate, lte: endDate } }
        }
      },
      select: {
        code: true,
        description: true,
        _count: {
          select: { admissions: { where: { admittedAt: { gte: startDate, lte: endDate } } } }
        }
      },
      orderBy: {
        admissions: { _count: "desc" }
      },
      take: 10
    });

    return NextResponse.json({
      year,
      hospitalInfo: {
        totalBeds,
        totalPatientDays,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        alos: Math.round(alos * 10) / 10
      },
      volume: {
        admissions: totalAdmissions,
        discharges: totalDischarges,
        deaths
      },
      morbidity: topMorbidity.map(m => ({
        code: m.code,
        description: m.description,
        count: m._count.admissions
      }))
    });
  } catch (error: any) {
    console.error("AHSR API Error:", error);
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to generate AHSR data" }, { status: 500 });
  }
}
