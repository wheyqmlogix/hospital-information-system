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
import { Radius, Loader2, Send } from "lucide-react";

const radProcedures = [
  { name: "Chest X-Ray (PA View)", type: "XRAY" },
  { name: "Abdominal Ultrasound", type: "ULTRASOUND" },
  { name: "CT Scan (Head)", type: "CT" },
  { name: "MRI (Spine)", type: "MRI" },
  { name: "Pelvic X-Ray", type: "XRAY" },
];

export function RadRequestForm({ 
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
      procedureName: "",
    }
  });

  const selectedProcedure = watch("procedureName");

  const onSubmit = async (data: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    toast.success(`Radiology request for ${data.procedureName} submitted.`);
    onOpenChange(false);
    reset();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Radius className="h-6 w-6 text-indigo-600" />
            <DialogTitle>Radiology Request</DialogTitle>
          </div>
          <DialogDescription>
            Order an imaging procedure for {patient.firstName} {patient.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="procedure">Procedure Name</Label>
            <Select onValueChange={(val) => setValue("procedureName", val)}>
              <SelectTrigger>
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
              className="bg-indigo-600 hover:bg-indigo-700"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
