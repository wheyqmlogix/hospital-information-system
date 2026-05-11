"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { DischargeFormContent } from "@/components/admissions/discharge-form-content";

export default function DischargePatientPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) throw new Error("Failed to fetch patient");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading patient record...</p>
      </div>
    );
  }

  const activeAdmission = patient?.admissions?.find((a: any) => a.status === "ADMITTED");

  if (!patient || !activeAdmission) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">No active admission found for this patient.</p>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinical Discharge</h1>
          <p className="text-slate-500">Preparing discharge clearance for {patient.firstName} {patient.lastName}.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="flex items-center text-red-700">
            <LogOut className="h-5 w-5 mr-2" />
            Discharge Summary
          </CardTitle>
          <CardDescription>
            This action will mark the patient as medically cleared and release their assigned bed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <DischargeFormContent 
            admissionId={activeAdmission.id} 
            patientName={`${patient.firstName} ${patient.lastName}`}
            onSuccess={() => router.push(`/patients/${id}`)}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
