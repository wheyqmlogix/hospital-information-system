"use client";

import { useState } from "react";
import { 
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  balance: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentModal({ invoiceId, invoiceNumber, balance, onSuccess, onCancel }: PaymentModalProps) {
  const [amount, setAmount] = useState(balance);
  const [method, setMethod] = useState("CASH");
  const [ref, setRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          amount,
          paymentMethod: method,
          referenceNumber: ref
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
           <CardContent className="p-12 text-center space-y-6">
              <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-slate-900">Payment Secured</h3>
                 <p className="text-slate-500 font-medium">Transaction has been recorded and the ledger has been updated.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt Generated</p>
                 <p className="font-mono text-sm font-bold text-slate-700">OR-{Date.now().toString().slice(-8)}</p>
              </div>
           </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-8 text-white relative">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={onCancel}
             className="absolute right-6 top-6 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
           >
              <X className="h-5 w-5" />
           </Button>
           <div className="space-y-1">
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Processing Collection</p>
              <h3 className="text-2xl font-bold">{invoiceNumber}</h3>
           </div>
           <div className="mt-8 flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-400 uppercase">Balance Due</span>
              <span className="text-4xl font-black text-blue-400">₱{balance.toLocaleString()}</span>
           </div>
        </div>
        
        <CardContent className="p-8">
           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Amount</Label>
                    <div className="relative">
                       <span className="absolute left-4 top-3.5 font-bold text-slate-400 text-lg">₱</span>
                       <Input 
                         type="number"
                         step="0.01"
                         required
                         value={amount}
                         onChange={(e) => setAmount(Number(e.target.value))}
                         className="pl-10 h-14 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all text-xl font-black"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Method</Label>
                       <Select onValueChange={setMethod} defaultValue={method}>
                          <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                             <SelectItem value="CASH" className="rounded-xl focus:bg-blue-50">
                                <div className="flex items-center gap-2">
                                   <Banknote className="h-4 w-4 text-green-500" />
                                   <span className="font-bold">Cash</span>
                                </div>
                             </SelectItem>
                             <SelectItem value="CARD" className="rounded-xl focus:bg-blue-50">
                                <div className="flex items-center gap-2">
                                   <CreditCard className="h-4 w-4 text-blue-500" />
                                   <span className="font-bold">Credit/Debit</span>
                                </div>
                             </SelectItem>
                             <SelectItem value="GCASH" className="rounded-xl focus:bg-blue-50">
                                <div className="flex items-center gap-2">
                                   <Smartphone className="h-4 w-4 text-blue-400" />
                                   <span className="font-bold">GCash / Maya</span>
                                </div>
                             </SelectItem>
                             <SelectItem value="CHECK" className="rounded-xl focus:bg-blue-50">
                                <div className="flex items-center gap-2">
                                   <ShieldCheck className="h-4 w-4 text-slate-500" />
                                   <span className="font-bold">Check</span>
                                </div>
                             </SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference #</Label>
                       <Input 
                         placeholder="OR or Txn ID"
                         value={ref}
                         onChange={(e) => setRef(e.target.value)}
                         className="h-14 rounded-2xl border-2 border-slate-100 font-bold"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <Button 
                   type="button" 
                   variant="ghost" 
                   onClick={onCancel}
                   className="flex-1 h-14 rounded-2xl font-bold text-slate-400"
                 >
                    Cancel
                 </Button>
                 <Button 
                   type="submit" 
                   disabled={isSubmitting || amount <= 0}
                   className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100"
                 >
                    {isSubmitting ? "Securing..." : "Complete Payment"}
                 </Button>
              </div>
           </form>
        </CardContent>
      </Card>
    </div>
  );
}
