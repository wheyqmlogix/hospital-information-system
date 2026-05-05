"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Stethoscope, Activity, Loader2, Save } from "lucide-react";

export function ClinicalNoteForm({ 
  open, 
  onOpenChange, 
  patient 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  patient: any 
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      doctorName: "Dr. Wilson", // Mock current user
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
    // In a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Clinical note and vitals saved successfully.");
    onOpenChange(false);
    reset();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-2xl">New Clinical Progress Note</DialogTitle>
          </div>
          <DialogDescription>
            Record medical observations and vitals for {patient.firstName} {patient.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {/* Vitals Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-red-500" />
                  Patient Vitals
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation">O2 Sat (%)</Label>
                    <Input id="oxygenSaturation" type="number" {...register("oxygenSaturation")} placeholder="98" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" type="number" step="0.1" {...register("weight")} placeholder="70.0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" type="number" step="0.1" {...register("height")} placeholder="170.0" />
                  </div>
                </div>
              </div>

              {/* SOAP Section */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">SOAP Note</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="subjective">Subjective (Symptoms, patient history)</Label>
                  <Textarea id="subjective" {...register("subjective")} className="min-h-[80px]" placeholder="Patient complains of..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">Objective (Physical exam, lab findings)</Label>
                  <Textarea id="objective" {...register("objective")} className="min-h-[80px]" placeholder="Clear breath sounds..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assessment">Assessment (Diagnosis, medical opinion)</Label>
                  <Textarea id="assessment" {...register("assessment")} className="min-h-[80px]" placeholder="Acute bronchitis..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plan (Treatment, medications, follow-up)</Label>
                  <Textarea id="plan" {...register("plan")} className="min-h-[80px]" placeholder="Continue hydration..." />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Note
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
