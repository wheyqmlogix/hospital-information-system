"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { PrescriptionFormContent } from "@/components/patients/prescription-form-content";

export default function NewPrescriptionPage() {
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

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Patient not found.</p>
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
          <h1 className="text-2xl font-bold text-slate-900">e-Prescription</h1>
          <p className="text-slate-500">Prescribing medications for {patient.firstName} {patient.lastName}.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="flex items-center text-purple-700">
            <Pill className="h-5 w-5 mr-2" />
            Medication List
          </CardTitle>
          <CardDescription>
            Add one or more medications, specifying dosage, frequency, and duration.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <PrescriptionFormContent 
            patient={patient} 
            onSuccess={() => router.push(`/patients/${id}`)}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
