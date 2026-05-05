"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

export function LabRequestForm({ 
  open, 
  onOpenChange, 
  patient 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  patient: any 
}) {
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
    onOpenChange(false);
    reset();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Microscope className="h-6 w-6 text-blue-600" />
            <DialogTitle>Laboratory Request</DialogTitle>
          </div>
          <DialogDescription>
            Order a laboratory test for {patient.firstName} {patient.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="test">Test Name</Label>
            <Select onValueChange={(val) => setValue("testName", val)}>
              <SelectTrigger>
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
              className="bg-blue-600 hover:bg-blue-700"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
