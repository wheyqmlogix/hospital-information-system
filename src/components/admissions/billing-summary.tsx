"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  CreditCard, 
  UserCheck, 
  Calculator, 
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileSignature
} from "lucide-react";
import { toast } from "sonner";
import { PaymentForm } from "./payment-form";
import { PromissoryNoteForm } from "./promissory-note-form";

interface BillingSummaryProps {
  admissionId: string;
  patientId: string;
}

interface BillData {
  billingRecordId: string;
  GrossAmount: string;
  PhilHealthDeduction: string;
  VATExemption: string;
  DiscountAmount: string;
  NetAmountDue: string;
  PaidAmount: string;
  BalanceAmount: string;
  Status: string;
  Metadata: {
    isPhilHealthApplied: boolean;
    isDiscountApplied: boolean;
    hospitalLevel: number;
  };
}

export function BillingSummary({ admissionId, patientId }: BillingSummaryProps) {
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isPromissoryFormOpen, setIsPromissoryFormOpen] = useState(false);

  const fetchBill = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admissions/${admissionId}/bill?level=${level}`);
      const data = await response.json();
      setBill(data);
    } catch (error) {
      toast.error("Failed to load billing calculation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [admissionId, level, isPaymentFormOpen, isPromissoryFormOpen]); // Refresh when forms close

  if (loading) return (
    <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
      <div className="text-center">
        <Calculator className="h-8 w-8 mx-auto text-slate-300 animate-pulse" />
        <p className="text-sm text-slate-500 mt-2">Calculating net amount...</p>
      </div>
    </div>
  );

  if (!bill) return null;

  const statusStyles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700 border-green-200",
    PARTIAL: "bg-blue-100 text-blue-700 border-blue-200",
    PROMISSORY: "bg-amber-100 text-amber-700 border-amber-200",
    UNPAID: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <>
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-900 text-white pb-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-blue-400" />
                Billing Breakdown
              </CardTitle>
              <Badge variant="outline" className={`${statusStyles[bill.Status] || statusStyles.UNPAID} border-none`}>
                {bill.Status}
              </Badge>
            </div>
            <Badge variant="outline" className="text-blue-200 border-blue-200/30">
              ID: {admissionId.slice(-6).toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-slate-600">
              <span>Gross Hospital Charges</span>
              <span className="font-mono font-medium">₱{bill.GrossAmount}</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-green-600 text-sm">
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  PhilHealth Case Rate Deduction
                </span>
                <span className="font-mono font-medium">- ₱{bill.PhilHealthDeduction}</span>
              </div>

              {bill.Metadata.isDiscountApplied && (
                <>
                  <div className="flex justify-between items-center text-green-600 text-sm">
                    <span className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Senior/PWD VAT Exemption
                    </span>
                    <span className="font-mono font-medium">- ₱{bill.VATExemption}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600 text-sm">
                    <span className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Senior/PWD 20% Discount
                    </span>
                    <span className="font-mono font-medium">- ₱{bill.DiscountAmount}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Net Amount</p>
                  <p className="font-mono font-bold text-blue-900">₱{bill.NetAmountDue}</p>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-mono text-green-600">₱{bill.PaidAmount}</span>
                </div>

                <div className="pt-2 border-t border-blue-100 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Remaining Balance</p>
                    <h3 className="text-2xl font-black text-blue-900 font-mono">₱{bill.BalanceAmount}</h3>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {Number(bill.BalanceAmount) > 0 && (
                      <>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => setIsPaymentFormOpen(true)}>
                          Pay Now
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-50 h-7 text-[9px] font-bold uppercase" onClick={() => setIsPromissoryFormOpen(true)}>
                          <FileSignature className="h-3 w-3 mr-1" />
                          Promissory
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setLevel(level === 1 ? 2 : 1)}>
                {level === 1 ? "Switch to Level 2" : "Switch to Level 1"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print SOA
              </Button>
            </div>
            {!bill.Metadata.isPhilHealthApplied && (
              <div className="flex items-center text-[10px] text-amber-600 font-bold uppercase">
                <AlertCircle className="h-3 w-3 mr-1" />
                Case Rate Not Found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {bill.billingRecordId && (
        <>
          <PaymentForm
            open={isPaymentFormOpen}
            onOpenChange={setIsPaymentFormOpen}
            billingRecordId={bill.billingRecordId}
            maxAmount={Number(bill.NetAmountDue)}
          />
          <PromissoryNoteForm
            open={isPromissoryFormOpen}
            onOpenChange={setIsPromissoryFormOpen}
            billingRecordId={bill.billingRecordId}
            totalBalance={Number(bill.NetAmountDue)}
          />
        </>
      )}
    </>
  );
}
