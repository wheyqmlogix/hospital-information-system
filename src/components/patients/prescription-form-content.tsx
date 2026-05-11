"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { commonMedications } from "@/lib/clinical/medications";
import { toast } from "sonner";
import { Pill, Plus, Trash2, Loader2, FileCheck } from "lucide-react";

interface PrescriptionFormContentProps {
  patient: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PrescriptionFormContent({ patient, onSuccess, onCancel }: PrescriptionFormContentProps) {
  const [loading, setLoading] = useState(false);
  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      items: [{ medicationName: "", dosage: "", frequency: "", duration: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("e-Prescription issued successfully.");
    if (onSuccess) onSuccess();
    reset();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Medication Name</Label>
                <Select 
                  onValueChange={(val) => {
                    // Logic to handle selection if needed
                    setValue(`items.${index}.medicationName` as any, val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Search medication..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonMedications.map((med) => (
                      <SelectItem key={med.name} value={med.name}>
                        {med.name} ({med.genericName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Hidden input to register the value from Select */}
                <input type="hidden" {...register(`items.${index}.medicationName` as const)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dosage</Label>
                <Input {...register(`items.${index}.dosage` as const)} placeholder="e.g. 500mg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Frequency</Label>
                <Input {...register(`items.${index}.frequency` as const)} placeholder="e.g. 3x a day" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration</Label>
                <Input {...register(`items.${index}.duration` as const)} placeholder="e.g. 7 days" />
              </div>
            </div>
            {index > 0 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-slate-200 text-red-500 hover:text-red-700 hover:bg-red-50 shadow-sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-dashed"
          onClick={() => append({ medicationName: "", dosage: "", frequency: "", duration: "" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Medication
        </Button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={loading} 
          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Issuing...
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              Issue Prescription
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
