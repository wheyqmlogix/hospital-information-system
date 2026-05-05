"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader, 
} from "@/components/ui/card";
import { addToSyncQueue } from "@/lib/offline/sync-queue";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { PatientForm } from "@/components/patients/patient-form";

export default function NewPatientPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const onSubmit = async (data: any) => {
    setLoading(true);
    const patientData = {
      ...data,
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "OUTPATIENT",
    };

    if (!navigator.onLine) {
      await addToSyncQueue("CREATE_PATIENT", patientData);
      toast.success("Saved locally. Will sync when online.");
      router.push("/patients");
      return;
    }

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        body: JSON.stringify(patientData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Patient record created successfully.");
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        router.push("/patients");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create patient.");
      }
    } catch {
      toast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UIButton variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </UIButton>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Register New Patient</h1>
            <p className="text-slate-500">Create a new Master Patient Index (MPI) record.</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-8">
          <PatientForm 
            onSubmit={onSubmit} 
            loading={loading} 
            onCancel={() => router.back()} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
