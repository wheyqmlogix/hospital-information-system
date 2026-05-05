"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Stethoscope, Activity } from "lucide-react";

export default function NewClinicalNotePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: patient } = useQuery({
    queryKey: ["patient", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch patient");
      return res.json();
    },
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      doctorName: "Dr. Sarah Wilson",
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      bloodPressure: "",
      temperature: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // In a real app, this would be a POST to /api/patients/[id]/notes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Clinical note and vitals saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["patient", params.id] });
      router.push(`/patients/${params.id}`);
    } catch {
      toast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">New Clinical Progress Note</h1>
            <p className="text-slate-500">Recording for {patient.firstName} {patient.lastName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <CardTitle>SOAP Note & Vitals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Vitals Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Activity className="h-4 w-4 mr-2 text-red-500" />
                Patient Vitals
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">BP (mmHg)</Label>
                  <Input id="bloodPressure" {...register("bloodPressure")} placeholder="120/80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temp (°C)</Label>
                  <Input id="temperature" type="number" step="0.1" {...register("temperature")} placeholder="36.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate">HR (bpm)</Label>
                  <Input id="heartRate" type="number" {...register("heartRate")} placeholder="72" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">RR (cpm)</Label>
                  <Input id="respiratoryRate" type="number" {...register("respiratoryRate")} placeholder="18" />
                </div>
              </div>
            </div>

            {/* SOAP Section */}
            <div className="space-y-6 pt-8 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Clinical Observations</h4>
              
              <div className="space-y-2">
                <Label htmlFor="subjective">Subjective (Symptoms, patient history)</Label>
                <Textarea id="subjective" {...register("subjective")} className="min-h-[100px]" placeholder="Patient complains of..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective (Physical exam, lab findings)</Label>
                <Textarea id="objective" {...register("objective")} className="min-h-[100px]" placeholder="Clear breath sounds..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment (Diagnosis, medical opinion)</Label>
                <Textarea id="assessment" {...register("assessment")} className="min-h-[100px]" placeholder="Acute bronchitis..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plan (Treatment, medications, follow-up)</Label>
                <Textarea id="plan" {...register("plan")} className="min-h-[100px]" placeholder="Continue hydration..." />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8 pt-8 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[150px]" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Progress Note
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
