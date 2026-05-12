import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ERAdmissionForm } from "@/components/admissions/er-admission-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdmitPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id }
  });

  if (!patient) {
    notFound();
  }

  const patientName = `${patient.lastName}, ${patient.firstName} ${patient.middleName || ""}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            href={`/patients/${patient.id}`} 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ER Check-in</h1>
          <p className="text-slate-500">Initiate an emergency encounter for this patient.</p>
        </div>
      </div>

      <ERAdmissionForm patientId={patient.id} patientName={patientName} />
    </div>
  );
}
