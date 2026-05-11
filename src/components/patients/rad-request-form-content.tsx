"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Radius, Loader2, Send } from "lucide-react";

const radProcedures = [
  { name: "Chest X-Ray (PA View)", type: "XRAY" },
  { name: "Abdominal Ultrasound", type: "ULTRASOUND" },
  { name: "CT Scan (Head)", type: "CT" },
  { name: "MRI (Spine)", type: "MRI" },
  { name: "Pelvic X-Ray", type: "XRAY" },
];

interface RadRequestFormContentProps {
  patient: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RadRequestFormContent({ patient, onSuccess, onCancel }: RadRequestFormContentProps) {
  const [loading, setLoading] = useState(false);
  const { handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      procedureName: "",
    }
  });

  const selectedProcedure = watch("procedureName");

  const onSubmit = async (data: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    toast.success(`Radiology request for ${data.procedureName} submitted.`);
    if (onSuccess) onSuccess();
    reset();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="procedure" className="text-sm font-medium">Procedure Name</Label>
        <Select onValueChange={(val) => setValue("procedureName", val as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a procedure" />
          </SelectTrigger>
          <SelectContent>
            {radProcedures.map((proc) => (
              <SelectItem key={proc.name} value={proc.name}>
                {proc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          disabled={loading || !selectedProcedure}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
