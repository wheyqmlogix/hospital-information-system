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
import { Microscope, Loader2, Send } from "lucide-react";

const labTests = [
  { name: "Complete Blood Count (CBC)", category: "HEMATOLOGY" },
  { name: "Blood Typing (ABO/Rh)", category: "HEMATOLOGY" },
  { name: "Fasting Blood Sugar (FBS)", category: "CHEMISTRY" },
  { name: "Lipid Profile", category: "CHEMISTRY" },
  { name: "Creatinine", category: "CHEMISTRY" },
  { name: "Urinalysis", category: "CLINICAL_MICROSCOPY" },
  { name: "Fecalysis", category: "CLINICAL_MICROSCOPY" },
  { name: "Dengue NS1 Antigen", category: "SEROLOGY" },
];

interface LabRequestFormContentProps {
  patient: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LabRequestFormContent({ patient, onSuccess, onCancel }: LabRequestFormContentProps) {
  const [loading, setLoading] = useState(false);
  const { handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      testName: "",
    }
  });

  const selectedTest = watch("testName");

  const onSubmit = async (data: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    toast.success(`Laboratory request for ${data.testName} submitted.`);
    if (onSuccess) onSuccess();
    reset();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="test" className="text-sm font-medium">Test Name</Label>
        <Select onValueChange={(val) => setValue("testName", val as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a test" />
          </SelectTrigger>
          <SelectContent>
            {labTests.map((test) => (
              <SelectItem key={test.name} value={test.name}>
                {test.name}
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
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          disabled={loading || !selectedTest}
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
