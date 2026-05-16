"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PharmacyRestockFormProps {
  medication: {
    id: string;
    name: string;
    genericName: string;
    strength: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function PharmacyRestockForm({ medication, onSuccess, onCancel }: PharmacyRestockFormProps) {
  const [restockForm, setRestockForm] = useState({
    batchNumber: "",
    expiryDate: "",
    quantity: 1
  });

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pharmacy/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId: medication.id,
          ...restockForm
        }),
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Target Medication Specification</p>
        <p className="text-sm font-black text-[#0f172a] uppercase">{medication.name}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{medication.genericName} • {medication.strength}</p>
      </div>
      
      <form onSubmit={handleRestock} className="space-y-6">
        <div className="space-y-1.5">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch / Lot Control Number</Label>
           <Input 
             required 
             className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
             value={restockForm.batchNumber}
             onChange={e => setRestockForm({...restockForm, batchNumber: e.target.value})}
           />
        </div>
        <div className="space-y-1.5">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medication Expiration Date</Label>
           <Input 
             required 
             type="date"
             className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
             value={restockForm.expiryDate}
             onChange={e => setRestockForm({...restockForm, expiryDate: e.target.value})}
           />
        </div>
        <div className="space-y-1.5">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Quantity Incoming</Label>
           <Input 
             required 
             type="number" 
             className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
             value={restockForm.quantity}
             onChange={e => setRestockForm({...restockForm, quantity: Number(e.target.value)})}
           />
        </div>
        <div className="flex gap-2 pt-6 border-t border-slate-100">
           <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-10 rounded-sm text-[10px] font-black uppercase tracking-widest border-slate-300">
              Abort
           </Button>
           <Button type="submit" className="flex-1 h-10 rounded-sm bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
              Authorize Restock
           </Button>
        </div>
      </form>
    </div>
  );
}
