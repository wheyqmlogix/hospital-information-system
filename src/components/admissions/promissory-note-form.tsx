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
import { toast } from "sonner";
import { issuePromissoryNote } from "@/app/api/billing/actions";
import { Loader2, FileText, Scale, CalendarIcon } from "lucide-react";

const PromissorySchema = z.object({
  initialPayment: z.coerce.number().min(0, "Initial payment must be 0 or more"),
  dueDate: z.string().min(1, "Due date is required"),
  reason: z.string().min(5, "Reason is too short"),
  guarantorName: z.string().min(3, "Guarantor name is required"),
  guarantorContact: z.string().min(7, "Guarantor contact is required"),
});

type PromissoryFormValues = z.infer<typeof PromissorySchema>;

interface PromissoryNoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingRecordId: string;
  totalBalance: number;
}

export function PromissoryNoteForm({ open, onOpenChange, billingRecordId, totalBalance }: PromissoryNoteFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PromissoryFormValues>({
    resolver: zodResolver(PromissorySchema),
  });

  const onSubmit = async (data: PromissoryFormValues) => {
    setLoading(true);
    try {
      const result = await issuePromissoryNote({
        ...data,
        dueDate: new Date(data.dueDate),
        billingRecordId,
      });

      if (result.success) {
        toast.success("Promissory note issued successfully.");
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "Failed to issue promissory note.");
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
          <DialogTitle className="flex items-center text-amber-700">
            <FileText className="h-5 w-5 mr-2" />
            Issue Promissory Note
          </DialogTitle>
          <DialogDescription>
            Formalize an agreement for deferred payment of the remaining balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialPayment">Initial Payment (PHP)</Label>
              <Input
                id="initialPayment"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("initialPayment")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Promised Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Deferred Payment</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Awaiting insurance reimbursement, financial hardship..."
              {...register("reason")}
            />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guarantor Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guarantorName">Name</Label>
                <Input id="guarantorName" {...register("guarantorName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guarantorContact">Contact Number</Label>
                <Input id="guarantorContact" {...register("guarantorContact")} />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4">
            <div className="flex items-start">
              <Scale className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                I, the undersigned, acknowledge a remaining balance of <strong>₱{totalBalance.toLocaleString()}</strong> 
                and promise to settle this amount on or before the specified due date. This document 
                serves as a legal commitment to the hospital.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Issuing...
                </>
              ) : (
                "Issue Note & Release"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
