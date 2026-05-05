"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { hospitalServices } from "@/lib/billing/utils";
import { toast } from "sonner";
import { Plus, Receipt, Loader2 } from "lucide-react";
import { recordCharge } from "@/app/api/billing/charge-actions";

export function ChargeForm({ 
  open, 
  onOpenChange, 
  patient 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  patient: any 
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      serviceName: "",
      quantity: 1,
    }
  });

  const selectedServiceName = watch("serviceName");
  const selectedService = hospitalServices.find(s => s.name === selectedServiceName);
  const quantity = watch("quantity");

  const onSubmit = async (data: any) => {
    if (!selectedService) return;
    
    setLoading(true);
    try {
      const result = await recordCharge({
        patientId: patient.id,
        serviceName: selectedService.name,
        category: selectedService.category,
        quantity: data.quantity,
        unitPrice: selectedService.price,
        isVatable: true, // Defaulting for now
      });

      if (result.success) {
        toast.success(`Charged ${data.quantity}x ${selectedService.name} to patient.`);
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "Failed to add charge.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Receipt className="h-6 w-6 text-teal-600" />
            <DialogTitle>Add Hospital Charge</DialogTitle>
          </div>
          <DialogDescription>
            Capture a new charge for {patient.firstName} {patient.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service / Item</Label>
              <Select onValueChange={(val) => setValue("serviceName", val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {hospitalServices.map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} (₱{service.price.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  {...register("quantity", { valueAsNumber: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-900 flex items-center">
                  ₱{((selectedService?.price || 0) * (quantity || 1)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-teal-600 hover:bg-teal-700"
              disabled={loading || !selectedServiceName}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charge
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
