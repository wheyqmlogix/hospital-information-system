"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PhilHealthClaimsProps {
  invoiceId: string;
  patientId: string;
  philHealthAmount: number;
}

export function PhilHealthClaims({ invoiceId, patientId, philHealthAmount }: PhilHealthClaimsProps) {
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; trackingNumber: string | null; message: string } | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const checkEligibility = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/philhealth/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (res.ok) {
        setEligibility(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/philhealth/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setClaimStatus(data.claim.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
           <ShieldCheck className="h-5 w-5 text-blue-600" />
           PhilHealth e-Claims
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {!eligibility && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Verify patient eligibility before submitting a claim to PhilHealth.</p>
            <Button 
              onClick={checkEligibility} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Verify Eligibility (PBEF)
            </Button>
          </div>
        )}

        {eligibility && (
          <div className={cn(
            "p-6 rounded-2xl border-2 flex flex-col gap-4",
            eligibility.eligible ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
          )}>
            <div className="flex items-start gap-3">
               {eligibility.eligible ? (
                 <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
               ) : (
                 <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
               )}
               <div>
                  <p className={cn(
                    "font-bold text-sm",
                    eligibility.eligible ? "text-green-800" : "text-red-800"
                  )}>{eligibility.message}</p>
                  {eligibility.trackingNumber && (
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-1">
                       PBEF Tracking: {eligibility.trackingNumber}
                    </p>
                  )}
               </div>
            </div>

            {eligibility.eligible && !claimStatus && (
              <Button 
                onClick={submitClaim}
                disabled={loading || philHealthAmount <= 0}
                className="w-full bg-slate-900 text-white rounded-xl h-10 text-xs font-black uppercase tracking-widest mt-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit e-Claim (₱{philHealthAmount.toLocaleString()})
              </Button>
            )}

            {claimStatus && (
              <div className="bg-white p-4 rounded-xl border border-green-200 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Claim Status</span>
                 </div>
                 <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                    {claimStatus}
                 </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
