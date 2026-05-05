"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, LogOut, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const DischargeSchema = z.object({
  finalDiagnosis: z.string().min(3, "Final diagnosis is required"),
  homeMedications: z.string().min(1, "Home medications are required"),
  followUpInstructions: z.string().min(1, "Follow-up instructions are required"),
});

type DischargeFormValues = z.infer<typeof DischargeSchema>;

interface DischargeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admissionId: string;
  patientName: string;
}

export function DischargeForm({ open, onOpenChange, admissionId, patientName }: DischargeFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DischargeFormValues>({
    resolver: zodResolver(DischargeSchema),
  });

  const onSubmit = async (data: DischargeFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admissions/${admissionId}/discharge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Patient clinical discharge completed.");
        onOpenChange(false);
        reset();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to discharge patient.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogOut className="h-5 w-5 mr-2 text-red-600" />
            Clinical Discharge Clearance
          </DialogTitle>
          <DialogDescription>
            Prepare clinical summary and release bed for {patientName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="finalDiagnosis" className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                Final Diagnosis
              </Label>
              <Textarea
                id="finalDiagnosis"
                placeholder="Confirmed medical diagnosis..."
                {...register("finalDiagnosis")}
                className={errors.finalDiagnosis ? "border-red-500" : ""}
              />
              {errors.finalDiagnosis && (
                <p className="text-xs text-red-500">{errors.finalDiagnosis.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeMedications">Home Medications</Label>
              <Textarea
                id="homeMedications"
                placeholder="List meds, dosage, and frequency..."
                {...register("homeMedications")}
                className={errors.homeMedications ? "border-red-500" : ""}
              />
              {errors.homeMedications && (
                <p className="text-xs text-red-500">{errors.homeMedications.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
              <Textarea
                id="followUpInstructions"
                placeholder="When and where to follow up, warning signs..."
                {...register("followUpInstructions")}
                className={errors.followUpInstructions ? "border-red-500" : ""}
              />
              {errors.followUpInstructions && (
                <p className="text-xs text-red-500">{errors.followUpInstructions.message}</p>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Note:</strong> This will transition the patient to <strong>Pending Billing</strong>. 
              The bed will be marked as available immediately, but the patient must settle the account 
              before physical exit.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Authorize Discharge"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
