"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, LogOut, FileText, Save } from "lucide-react";
import { useRouter } from "next/navigation";

const DischargeSchema = z.object({
  finalDiagnosis: z.string().min(3, "Final diagnosis is required"),
  homeMedications: z.string().min(1, "Home medications are required"),
  followUpInstructions: z.string().min(1, "Follow-up instructions are required"),
});

type DischargeFormValues = z.infer<typeof DischargeSchema>;

interface DischargeFormContentProps {
  admissionId: string;
  patientName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DischargeFormContent({ admissionId, patientName, onSuccess, onCancel }: DischargeFormContentProps) {
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
        if (onSuccess) onSuccess();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="finalDiagnosis" className="flex items-center text-sm font-medium">
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
          <Label htmlFor="homeMedications" className="text-sm font-medium">Home Medications</Label>
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
          <Label htmlFor="followUpInstructions" className="text-sm font-medium">Follow-up Instructions</Label>
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

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Authorize Discharge
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
