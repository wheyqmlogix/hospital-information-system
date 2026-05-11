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
  bpSystolic: z.coerce.number().int().min(40).max(300).optional().nullable(),
  bpDiastolic: z.coerce.number().int().min(30).max(200).optional().nullable(),
  temperature: z.coerce.number().min(30).max(45).optional().nullable(),
  pulseRate: z.coerce.number().int().min(20).max(250).optional().nullable(),
  respiratoryRate: z.coerce.number().int().min(4).max(60).optional().nullable(),
  o2Saturation: z.coerce.number().int().min(50).max(100).optional().nullable(),
  weight: z.coerce.number().min(0.5).max(500).optional().nullable(),
  height: z.coerce.number().min(30).max(250).optional().nullable(),
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
    <Card className="border-none shadow-xl rounded-3xl bg-slate-50/50">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                 <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Record Vitals</h3>
           </div>
           <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
              <X className="h-5 w-5" />
           </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Blood Pressure (S/D)</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="Sys" {...form.register("bpSystolic")} className="h-12 rounded-xl text-center font-bold" />
                <span className="text-slate-300">/</span>
                <Input placeholder="Dia" {...form.register("bpDiastolic")} className="h-12 rounded-xl text-center font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Temp (°C)</Label>
              <div className="relative">
                 <Input {...form.register("temperature")} className="h-12 rounded-xl pl-10 font-bold" />
                 <Thermometer className="absolute left-3 top-3.5 h-5 w-5 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pulse (bpm)</Label>
              <div className="relative">
                 <Input {...form.register("pulseRate")} className="h-12 rounded-xl pl-10 font-bold" />
                 <Activity className="absolute left-3 top-3.5 h-5 w-5 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">SpO2 (%)</Label>
              <div className="relative">
                 <Input {...form.register("o2Saturation")} className="h-12 rounded-xl pl-10 font-bold" />
                 <Wind className="absolute left-3 top-3.5 h-5 w-5 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resp (bpm)</Label>
              <Input {...form.register("respiratoryRate")} className="h-12 rounded-xl font-bold" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weight (kg)</Label>
              <div className="relative">
                 <Input {...form.register("weight")} className="h-12 rounded-xl pl-10 font-bold" />
                 <Scale className="absolute left-3 top-3.5 h-5 w-5 text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Height (cm)</Label>
              <div className="relative">
                 <Input {...form.register("height")} className="h-12 rounded-xl pl-10 font-bold" />
                 <Ruler className="absolute left-3 top-3.5 h-5 w-5 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="ghost" onClick={onCancel} className="font-bold text-slate-500 rounded-xl px-6">
                Cancel
             </Button>
             <Button 
               type="submit" 
               disabled={isSubmitting}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold shadow-lg shadow-blue-100"
             >
                {isSubmitting ? "Saving..." : "Record Vitals"}
             </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
