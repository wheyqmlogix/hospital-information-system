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
import { commonICD10, commonRVS } from "@/lib/philhealth/codes";
import { philhealthMock } from "@/lib/philhealth/client";
import { aiAuditor, AuditResult } from "@/lib/intelligence/auditor";
import { toast } from "sonner";
import { Check, ClipboardList, Loader2, ShieldCheck, AlertTriangle, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ClaimForm({ 
  open, 
  onOpenChange, 
  patient 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  patient: any 
}) {
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
        onOpenChange(false);
        setStep(1);
        setAuditResult(null);
      }
    } catch (error) {
      toast.error("Failed to submit claim to PhilHealth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <DialogTitle>PhilHealth eClaims Submission</DialogTitle>
          </div>
          <DialogDescription>
            {step === 1 ? `Prepare claim for ${patient.firstName} ${patient.lastName}.` : "AI Compliance Audit Results"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <Select onValueChange={(val) => setValue("diagnosis", val as any)}>
                    <SelectTrigger>
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
                  <Select onValueChange={(val) => setValue("procedure", val as any)}>
                    <SelectTrigger>
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
            ) : (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg border flex items-center justify-between ${
                  auditResult?.status === "PASSED" ? "bg-green-50 border-green-200" :
                  auditResult?.status === "WARNING" ? "bg-amber-50 border-amber-200" :
                  "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      auditResult?.status === "PASSED" ? "bg-green-100 text-green-600" :
                      auditResult?.status === "WARNING" ? "bg-amber-100 text-amber-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">AI Compliance Score</p>
                      <h3 className="text-2xl font-black">{auditResult?.score}%</h3>
                    </div>
                  </div>
                  <Badge className={
                    auditResult?.status === "PASSED" ? "bg-green-600" :
                    auditResult?.status === "WARNING" ? "bg-amber-600" :
                    "bg-red-600"
                  }>
                    {auditResult?.status}
                  </Badge>
                </div>

                {auditResult?.findings && auditResult.findings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Major Findings</h4>
                    <div className="space-y-2">
                      {auditResult.findings.map((finding, i) => (
                        <div key={i} className="flex items-start space-x-2 text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {auditResult?.recommendations && auditResult.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendations</h4>
                    <div className="space-y-2">
                      {auditResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start space-x-2 text-sm text-blue-700 bg-blue-50/50 p-2 rounded border border-blue-100">
                          <Check className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-slate-900 text-white p-4 rounded-lg space-y-2">
                    <p className="text-xs text-slate-400 flex items-center">
                      <ClipboardList className="h-3 w-3 mr-2" />
                      Claim Summary
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Diagnosis:</span>
                      <span className="font-medium">{selectedDiagnosis}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Procedure:</span>
                      <span className="font-medium">{selectedProcedure}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-slate-100">
            {step === 1 ? (
              <Button 
                type="button" 
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                onClick={handleSubmit(runAudit)}
                disabled={!selectedDiagnosis || !selectedProcedure}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Run AI Compliance Audit
              </Button>
            ) : (
              <div className="flex space-x-2 w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back to Edit
                </Button>
                <Button 
                  type="submit" 
                  className={`flex-1 font-bold ${
                    auditResult?.status === "FAILED" ? "bg-slate-400" : "bg-green-600 hover:bg-green-700"
                  }`}
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
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
