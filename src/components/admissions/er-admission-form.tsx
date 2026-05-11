"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  AlertCircle,
  Activity,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const admissionSchema = z.object({
  type: z.enum(["ER", "INPATIENT", "OBSERVATION", "OUTPATIENT"]),
  triageLevel: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5"]),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  admittingDiagnosis: z.string().optional(),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

interface ERAdmissionFormProps {
  patientId: string;
  patientName: string;
}

const triageOptions = [
  { value: "LEVEL_1", label: "Level 1: Resuscitation", color: "text-red-600" },
  { value: "LEVEL_2", label: "Level 2: Emergent", color: "text-orange-600" },
  { value: "LEVEL_3", label: "Level 3: Urgent", color: "text-amber-600" },
  { value: "LEVEL_4", label: "Level 4: Less Urgent", color: "text-green-600" },
  { value: "LEVEL_5", label: "Level 5: Non-Urgent", color: "text-blue-600" },
];

export function ERAdmissionForm({ patientId, patientName }: ERAdmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      type: "ER",
      triageLevel: "LEVEL_3",
    }
  });

  const onSubmit = async (data: AdmissionFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, patientId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create admission");
      }

      router.push("/admissions");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                <Activity className="h-6 w-6" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-none mb-1">ER Admission</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{patientName}</p>
             </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="triageLevel">Triage Level</Label>
                <Select onValueChange={(val) => form.setValue("triageLevel", val as any)} defaultValue={form.getValues("triageLevel")}>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {triageOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="focus:bg-slate-50 rounded-xl">
                        <span className={cn("font-bold", opt.color)}>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                <textarea 
                  id="chiefComplaint"
                  {...form.register("chiefComplaint")}
                  className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 transition-all resize-none text-slate-900 placeholder:text-slate-300"
                  placeholder="Reason for visit (e.g., Chest pain, difficulty breathing...)"
                />
                {form.formState.errors.chiefComplaint && (
                  <p className="text-xs text-red-500 font-medium">{form.formState.errors.chiefComplaint.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admittingDiagnosis">Preliminary Diagnosis (Optional)</Label>
                <Input id="admittingDiagnosis" {...form.register("admittingDiagnosis")} className="h-14 rounded-2xl border-2 border-slate-100" />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Auto-Check: MPI Verified
               </p>
               <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-10 h-14 font-bold shadow-lg shadow-red-100"
                >
                  {isSubmitting ? "Checking in..." : "Check-in to ER"}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
