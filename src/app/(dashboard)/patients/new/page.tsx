import { PatientForm } from "@/components/patients/patient-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPatientPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            href="/patients" 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Registration</h1>
          <p className="text-slate-500">Create a new Master Patient Index record.</p>
        </div>
      </div>

      <PatientForm />
    </div>
  );
}
