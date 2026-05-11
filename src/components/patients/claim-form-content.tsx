"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { commonICD10, commonRVS } from "@/lib/philhealth/codes";
import { philhealthMock } from "@/lib/philhealth/client";
import { aiAuditor, AuditResult } from "@/lib/intelligence/auditor";
import { toast } from "sonner";
import { Check, ClipboardList, Loader2, ShieldCheck, AlertTriangle, Sparkles, AlertCircle, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClaimFormContentProps {
  patient: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClaimFormContent({ patient, onSuccess, onCancel }: ClaimFormContentProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeDate: new Date().toISOString().split('T')[0],
      diagnosis: "",
      procedure: "",
    }
  });

  const selectedDiagnosis = watch("diagnosis");
  const selectedProcedure = watch("procedure");

  const runAudit = (data: any) => {
    const result = aiAuditor.auditClaimCompliance(patient, data);
    setAuditResult(result);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = await philhealthMock.submitClaim({
        patientId: patient.patientId,
        philhealthId: patient.philHealthId,
        ...data
      });
      
      if (result.success) {
        toast.success(`Claim submitted! TCN: ${result.tcn}`);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("Failed to submit claim to PhilHealth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <form onSubmit={handleSubmit(runAudit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admissionDate">Date of Admission</Label>
                <Input id="admissionDate" type="date" {...register("admissionDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dischargeDate">Date of Discharge</Label>
                <Input id="dischargeDate" type="date" {...register("dischargeDate")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Principal Diagnosis (ICD-10)</Label>
              <Select onValueChange={(val: string | null) => val && setValue("diagnosis", val as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ICD-10 Code" />
                </SelectTrigger>
                <SelectContent>
                  {commonICD10.map((code) => (
                    <SelectItem key={code.code} value={code.code}>
                      {code.code} - {code.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure">Primary Procedure (RVS)</Label>
              <Select onValueChange={(val: string | null) => val && setValue("procedure", val as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select RVS Code" />
                </SelectTrigger>
                <SelectContent>
                  {commonRVS.map((code) => (
                    <SelectItem key={code.code} value={code.code}>
                      {code.code} - {code.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 font-bold w-full sm:w-auto"
              disabled={!selectedDiagnosis || !selectedProcedure}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Run AI Compliance Audit
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className={`p-4 md:p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            auditResult?.status === "PASSED" ? "bg-green-50 border-green-200" :
            auditResult?.status === "WARNING" ? "bg-amber-50 border-amber-200" :
            "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                auditResult?.status === "PASSED" ? "bg-green-100 text-green-600" :
                auditResult?.status === "WARNING" ? "bg-amber-100 text-amber-600" :
                "bg-red-100 text-red-600"
              }`}>
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tight text-slate-500">AI Compliance Score</p>
                <h3 className="text-3xl font-black">{auditResult?.score}%</h3>
              </div>
            </div>
            <Badge className={cn(
              "w-fit text-sm px-3 py-1",
              auditResult?.status === "PASSED" ? "bg-green-600 hover:bg-green-600" :
              auditResult?.status === "WARNING" ? "bg-amber-600 hover:bg-amber-600" :
              "bg-red-600 hover:bg-red-600"
            )}>
              {auditResult?.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Major Findings</h4>
              {auditResult?.findings && auditResult.findings.length > 0 ? (
                <div className="space-y-2">
                  {auditResult.findings.map((finding, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No issues found.</p>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendations</h4>
              {auditResult?.recommendations && auditResult.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {auditResult.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm text-blue-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No recommendations.</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <div className="bg-slate-900 text-white p-6 rounded-xl space-y-4">
              <p className="text-xs text-slate-400 flex items-center font-bold uppercase tracking-wider">
                <ClipboardList className="h-4 w-4 mr-2" />
                Claim Summary
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between sm:flex-col sm:justify-start sm:gap-1">
                  <span className="text-slate-400 text-xs">Diagnosis:</span>
                  <span className="font-bold text-sm">{selectedDiagnosis}</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:justify-start sm:gap-1">
                  <span className="text-slate-400 text-xs">Procedure:</span>
                  <span className="font-bold text-sm">{selectedProcedure}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Edit
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit(onSubmit)}
              className={cn(
                "flex-1 sm:flex-none font-bold text-white",
                auditResult?.status === "FAILED" ? "bg-slate-400" : "bg-green-600 hover:bg-green-700"
              )}
              disabled={loading || auditResult?.status === "FAILED"}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit eClaim
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
