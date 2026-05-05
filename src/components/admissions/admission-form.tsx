"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createAdmission } from "@/app/api/admissions/actions";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";

const AdmissionSchema = z.object({
  admittingDiagnosis: z.string().min(3, "Diagnosis is too short"),
  roomNumber: z.string().min(1, "Room number is required"),
  ward: z.string().optional(),
  isPhilHealthMember: z.boolean().default(false),
  philHealthPIN: z.string().optional(),
  dpaConsent: z.boolean().refine(val => val === true, {
    message: "Data Privacy Act consent is mandatory."
  })
});

type AdmissionFormValues = z.infer<typeof AdmissionSchema>;

interface AdmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export function AdmissionForm({ open, onOpenChange, patient }: AdmissionFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(AdmissionSchema),
    defaultValues: {
      isPhilHealthMember: false,
      dpaConsent: false,
    },
  });

  const isPhilHealthMember = watch("isPhilHealthMember");

  const onSubmit = async (data: AdmissionFormValues) => {
    setLoading(true);
    try {
      const result = await createAdmission({
        ...data,
        patientId: patient.id,
      });

      if (result.success) {
        toast.success("Patient admitted successfully.");
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "Failed to admit patient.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Admit Patient</DialogTitle>
          <DialogDescription>
            Registering {patient.firstName} {patient.lastName} for inpatient care.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admittingDiagnosis">Admitting Diagnosis</Label>
              <Textarea
                id="admittingDiagnosis"
                placeholder="Initial clinical impression..."
                {...register("admittingDiagnosis")}
                className={errors.admittingDiagnosis ? "border-red-500" : ""}
              />
              {errors.admittingDiagnosis && (
                <p className="text-xs text-red-500">{errors.admittingDiagnosis.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g. 401"
                  {...register("roomNumber")}
                  className={errors.roomNumber ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Ward (Optional)</Label>
                <Input id="ward" placeholder="e.g. Medical-Surgical" {...register("ward")} />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPhilHealthMember"
                  checked={isPhilHealthMember}
                  onCheckedChange={(checked) => setValue("isPhilHealthMember", checked as boolean)}
                />
                <Label htmlFor="isPhilHealthMember" className="flex items-center cursor-pointer">
                  <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                  PhilHealth Member
                </Label>
              </div>

              {isPhilHealthMember && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="philHealthPIN">PhilHealth PIN</Label>
                  <Input id="philHealthPIN" placeholder="XX-XXXXXXXXX-X" {...register("philHealthPIN")} />
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dpaConsent"
                  onCheckedChange={(checked) => setValue("dpaConsent", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="dpaConsent" className="flex items-center cursor-pointer text-sm font-medium">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                    Data Privacy Consent
                  </Label>
                  <p className="text-xs text-slate-500">
                    The patient agrees to the processing of medical data for treatment and billing purposes.
                  </p>
                </div>
              </div>
              {errors.dpaConsent && (
                <p className="text-xs text-red-500 pl-6">{errors.dpaConsent.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Admitting...
                </>
              ) : (
                "Complete Admission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
