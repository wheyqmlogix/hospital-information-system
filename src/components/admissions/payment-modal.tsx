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
      <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-slate-200 shadow-2xl rounded-sm overflow-hidden bg-white animate-in zoom-in-95 duration-300">
           <CardContent className="p-12 text-center space-y-8">
              <div className="h-16 w-16 bg-slate-50 text-[#166534] border border-green-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-widest">Transaction Finalized</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed px-8">Payment successfully validated and recorded in the institutional ledger.</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-sm border border-slate-100">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Institutional Receipt Identifier</p>
                 <p className="font-mono text-sm font-black text-[#0f172a]">OR-{Date.now().toString().slice(-8)}</p>
              </div>
           </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border border-slate-200 shadow-2xl rounded-sm overflow-hidden bg-white animate-in zoom-in-95 duration-200">
        <div className="bg-[#0f172a] p-8 text-white relative border-b border-white/10">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={onCancel}
             className="absolute right-6 top-6 text-white/40 hover:text-white hover:bg-white/10 rounded-sm"
           >
              <X className="h-4 w-4" />
           </Button>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Accounting Protocol: Collection</p>
              <h3 className="text-xl font-black uppercase tracking-tight">{invoiceNumber}</h3>
           </div>
           <div className="mt-8 flex items-baseline gap-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding Liability</span>
              <span className="text-4xl font-black tracking-tighter">₱{balance.toLocaleString()}</span>
           </div>
        </div>
        
        <CardContent className="p-8">
           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Payment Quantum (PHP)</Label>
                    <div className="relative">
                       <span className="absolute left-4 top-3.5 font-black text-slate-300 text-lg">₱</span>
                       <Input 
                         type="number"
                         step="0.01"
                         required
                         value={amount}
                         onChange={(e) => setAmount(Number(e.target.value))}
                         className="pl-10 h-14 rounded-sm border border-slate-200 bg-slate-50/30 focus:border-[#0f172a] focus:bg-white transition-all text-2xl font-black tracking-tighter"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Settlement Method</Label>
                       <Select onValueChange={setMethod} defaultValue={method}>
                          <SelectTrigger className="h-10 rounded-sm border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                             <SelectItem value="CASH" className="focus:bg-slate-50">
                                <div className="flex items-center gap-2">
                                   <Banknote className="h-3 w-3 text-slate-400" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Cash Currency</span>
                                </div>
                             </SelectItem>
                             <SelectItem value="CARD" className="focus:bg-slate-50">
                                <div className="flex items-center gap-2">
                                   <CreditCard className="h-3 w-3 text-slate-400" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Credit / Debit Card</span>
                                </div>
                             </SelectItem>
                             <SelectItem value="GCASH" className="focus:bg-slate-50">
                                <div className="flex items-center gap-2">
                                   <Smartphone className="h-3 w-3 text-slate-400" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Digital E-Wallet</span>
                                </div>
                             </SelectItem>
                             <SelectItem value="CHECK" className="focus:bg-slate-50">
                                <div className="flex items-center gap-2">
                                   <ShieldCheck className="h-3 w-3 text-slate-400" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Institutional Check</span>
                                </div>
                             </SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Audit Reference ID</Label>
                       <Input 
                         placeholder="OR / TRANSACTION ID"
                         value={ref}
                         onChange={(e) => setRef(e.target.value)}
                         className="h-10 rounded-sm border border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex gap-2 pt-4">
                 <Button 
                   type="button" 
                   variant="outline" 
                   onClick={onCancel}
                   className="flex-1 h-10 rounded-sm font-black text-[9px] uppercase tracking-widest border-slate-300"
                 >
                    Abort
                 </Button>
                 <Button 
                   type="submit" 
                   disabled={isSubmitting || amount <= 0}
                   className="flex-[2] h-10 rounded-sm bg-[#0f172a] text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-sm"
                 >
                    {isSubmitting ? "Processing..." : "Validate & Authorize Payment"}
                 </Button>
              </div>
           </form>
        </CardContent>
      </Card>
    </div>
  );
}
