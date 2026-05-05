"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { recordPayment } from "@/app/api/billing/actions";
import { Loader2, Banknote, CreditCard, Receipt } from "lucide-react";

const PaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "CARD", "CHEQUE", "ONLINE"]),
  referenceNumber: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof PaymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingRecordId: string;
  maxAmount: number;
}

export function PaymentForm({ open, onOpenChange, billingRecordId, maxAmount }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      method: "CASH",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    setLoading(true);
    try {
      const result = await recordPayment({
        ...data,
        billingRecordId,
      });

      if (result.success) {
        toast.success("Payment recorded successfully.");
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "Failed to record payment.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Banknote className="h-5 w-5 mr-2 text-green-600" />
            Process Payment
          </DialogTitle>
          <DialogDescription>
            Record a partial or full payment for this billing record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (PHP)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono">₱</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                className={`pl-7 ${errors.amount ? "border-red-500" : ""}`}
                placeholder={maxAmount.toFixed(2)}
                {...register("amount", { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
            <p className="text-[10px] text-slate-500">Max remaining balance: ₱{maxAmount.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select defaultValue="CASH" onValueChange={(value) => setValue("method", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Debit/Credit Card</SelectItem>
                <SelectItem value="CHEQUE">Check</SelectItem>
                <SelectItem value="ONLINE">Online Transfer / QR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference / Trace Number</Label>
            <Input
              id="referenceNumber"
              placeholder="e.g. Transaction ID, Check #"
              {...register("referenceNumber")}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
