"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdmissionFormContent } from "./admission-form-content";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl">Patient Admission</DialogTitle>
            <DialogDescription>
              Registering <span className="font-bold text-slate-900">{patient.firstName} {patient.lastName}</span> for inpatient care.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2">
          <AdmissionFormContent 
            patient={patient} 
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
