"use client";

import { useState } from "react";
import { philhealthMock, EligibilityResponse } from "@/lib/philhealth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export function EligibilityChecker({ philhealthId }: { philhealthId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResponse | null>(null);

  const checkEligibility = async () => {
    if (!philhealthId) return;
    setLoading(true);
    try {
      const res = await philhealthMock.checkEligibility(philhealthId);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center">
          <ShieldCheck className="h-4 w-4 mr-2 text-blue-600" />
          PhilHealth Benefit Eligibility
        </CardTitle>
        <CardDescription>Verify member status and benefit eligibility in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.status === "ELIGIBLE" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {result.status === "INELIGIBLE" && <XCircle className="h-5 w-5 text-red-500" />}
                {result.status === "PENDING" && <AlertCircle className="h-5 w-5 text-amber-500" />}
                <span className="font-bold text-slate-900">{result.status}</span>
              </div>
              <Badge variant="outline">{result.memberCategory}</Badge>
            </div>
            
            {result.reason && (
              <p className="text-sm text-slate-500 bg-white p-2 rounded border border-slate-100">
                {result.reason}
              </p>
            )}
            
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Tracking No: {result.trackingNumber}</span>
              <span>Checked: {new Date().toLocaleTimeString()}</span>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={() => setResult(null)}>
              Check Another ID
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="p-3 bg-white rounded border border-slate-200 text-sm">
              <span className="text-slate-500">Member ID:</span>
              <span className="ml-2 font-mono font-bold text-slate-900">{philhealthId || "Not Provided"}</span>
            </div>
            <Button 
              disabled={!philhealthId || loading} 
              onClick={checkEligibility}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Eligibility"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
