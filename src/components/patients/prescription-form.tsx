"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { commonMedications } from "@/lib/clinical/medications";
import { toast } from "sonner";
import { Pill, Plus, Trash2, Loader2, FileCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PrescriptionForm({ 
  open, 
  onOpenChange, 
  patient 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  patient: any 
}) {
  const [loading, setLoading] = useState(false);
  const { register, control, handleSubmit, reset } = useForm({
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("e-Prescription issued successfully.");
    onOpenChange(false);
    reset();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center space-x-2">
            <Pill className="h-6 w-6 text-purple-600" />
            <DialogTitle className="text-2xl">Issue e-Prescription</DialogTitle>
          </div>
          <DialogDescription>
            Prescribe medications for {patient.firstName} {patient.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Medication Name</Label>
                      <Select 
                        onValueChange={(val) => {
                          const med = commonMedications.find(m => m.name === val);
                          // We could auto-fill dosage if needed
                        }}
                        {...register(`items.${index}.medicationName` as const)}
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
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage</Label>
                      <Input {...register(`items.${index}.dosage` as const)} placeholder="e.g. 500mg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Input {...register(`items.${index}.frequency` as const)} placeholder="e.g. 3x a day" />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input {...register(`items.${index}.duration` as const)} placeholder="e.g. 7 days" />
                    </div>
                  </div>
                  {index > 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-slate-200 text-red-500 hover:text-red-700 hover:bg-red-50"
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
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
