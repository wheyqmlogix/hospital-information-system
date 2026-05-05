"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { PatientForm } from "@/components/patients/patient-form";

export default function EditPatientPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) throw new Error("Failed to fetch patient");
      return res.json();
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Patient record updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["patient", id] });
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        router.push(`/patients/${id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update patient.");
      }
    } catch {
      toast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading patient record...</p>
      </div>
    );
  }

  // Format date for the input type="date"
  const initialData = patient ? {
    ...patient,
    dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
  } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UIButton variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </UIButton>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Patient Record</h1>
            <p className="text-slate-500">Updating Master Patient Index (MPI) for {patient?.firstName} {patient?.lastName}.</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-8">
          <PatientForm 
            initialData={initialData}
            onSubmit={onSubmit} 
            loading={loading} 
            onCancel={() => router.back()} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
