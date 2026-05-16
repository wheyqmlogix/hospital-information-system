"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  X,
  HeartPulse,
  Thermometer,
  Wind,
  Scale,
  Ruler,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const vitalsSchema = z.object({
  bpSystolic: z.number().nullable().optional(),
  bpDiastolic: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  pulseRate: z.number().nullable().optional(),
  respiratoryRate: z.number().nullable().optional(),
  o2Saturation: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

type VitalsFormValues = z.infer<typeof vitalsSchema>;

interface VitalsFormProps {
  admissionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VitalsForm({ admissionId, onSuccess, onCancel }: VitalsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      bpSystolic: null,
      bpDiastolic: null,
      temperature: null,
      pulseRate: null,
      respiratoryRate: null,
      o2Saturation: null,
      weight: null,
      height: null,
    }
  });

  const onSubmit = async (data: VitalsFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admissions/${admissionId}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-sm rounded-md bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-clinical-primary rounded-sm flex items-center justify-center text-white">
                 <HeartPulse className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Record Patient Vitals</h3>
           </div>
           <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded">
              <X className="h-4 w-4" />
           </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Pressure (S/D)</Label>
              <div className="flex items-center gap-1.5">
                <Input placeholder="Sys" {...form.register("bpSystolic")} className="h-9 rounded-sm text-center font-bold bg-slate-50 focus:bg-white" />
                <span className="text-slate-300 font-bold">/</span>
                <Input placeholder="Dia" {...form.register("bpDiastolic")} className="h-9 rounded-sm text-center font-bold bg-slate-50 focus:bg-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temperature (°C)</Label>
              <div className="relative">
                 <Input {...form.register("temperature")} className="h-9 rounded-sm pl-8 font-bold bg-slate-50 focus:bg-white" />
                 <Thermometer className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pulse Rate (bpm)</Label>
              <div className="relative">
                 <Input {...form.register("pulseRate")} className="h-9 rounded-sm pl-8 font-bold bg-slate-50 focus:bg-white" />
                 <Activity className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Oxygen Sat (SpO2 %)</Label>
              <div className="relative">
                 <Input {...form.register("o2Saturation")} className="h-9 rounded-sm pl-8 font-bold bg-slate-50 focus:bg-white" />
                 <Wind className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Respiratory (bpm)</Label>
              <Input {...form.register("respiratoryRate")} className="h-9 rounded-sm font-bold bg-slate-50 focus:bg-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weight (kg)</Label>
              <div className="relative">
                 <Input {...form.register("weight")} className="h-9 rounded-sm pl-8 font-bold bg-slate-50 focus:bg-white" />
                 <Scale className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Height (cm)</Label>
              <div className="relative">
                 <Input {...form.register("height")} className="h-9 rounded-sm pl-8 font-bold bg-slate-50 focus:bg-white" />
                 <Ruler className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
             <Button type="button" variant="ghost" onClick={onCancel} className="text-xs font-bold text-slate-500 uppercase tracking-wider h-9 px-6">
                Cancel
             </Button>
             <Button 
               type="submit" 
               disabled={isSubmitting}
               className="bg-clinical-primary hover:bg-clinical-primary-dark text-white rounded-sm h-9 px-8 font-bold uppercase tracking-wider shadow-sm"
             >
                {isSubmitting ? "Saving..." : "Record Vitals"}
             </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
