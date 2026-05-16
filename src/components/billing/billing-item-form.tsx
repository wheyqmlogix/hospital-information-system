"use client";

import { useState } from "react";
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

interface BillingItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  admissionId: string;
}

export function BillingItemForm({ onSuccess, onCancel, admissionId }: BillingItemFormProps) {
  const [newItem, setNewItem] = useState({
    category: "MEDICATION",
    description: "",
    quantity: 1,
    unitPrice: 0,
    isVatable: true
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admissions/${admissionId}/invoice/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleAddItem} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Category</Label>
           <Select onValueChange={(val) => setNewItem({...newItem, category: val})} defaultValue={newItem.category}>
              <SelectTrigger className="h-10 rounded-sm bg-slate-50 border-slate-200 text-[11px] font-bold uppercase tracking-tight">
                 <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                 <SelectItem value="MEDICATION" className="text-[10px] font-bold uppercase">Medication</SelectItem>
                 <SelectItem value="CSR" className="text-[10px] font-bold uppercase">Central Supply (CSR)</SelectItem>
                 <SelectItem value="LABORATORY" className="text-[10px] font-bold uppercase">Laboratory</SelectItem>
                 <SelectItem value="PROCEDURE" className="text-[10px] font-bold uppercase">Procedure</SelectItem>
                 <SelectItem value="PF" className="text-[10px] font-bold uppercase">Professional Fee</SelectItem>
                 <SelectItem value="ROOM" className="text-[10px] font-bold uppercase">Room / Board</SelectItem>
              </SelectContent>
           </Select>
        </div>
        <div className="space-y-1.5">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Descriptor</Label>
           <Input 
             className="h-10 rounded-sm bg-slate-50 border-slate-200 text-[11px] font-bold uppercase" 
             value={newItem.description}
             onChange={(e) => setNewItem({...newItem, description: e.target.value})}
             placeholder="e.g. Consultation Fee, Ward Room Day 1"
           />
        </div>
        <div className="space-y-1.5">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Quantum (PHP)</Label>
           <Input 
             type="number" 
             step="0.01"
             className="h-10 rounded-sm bg-slate-50 border-slate-200 text-[11px] font-bold uppercase" 
             value={newItem.unitPrice}
             onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
           />
        </div>
        <div className="space-y-1.5">
           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Units / Qty</Label>
           <Input 
             type="number" 
             className="h-10 rounded-sm bg-slate-50 border-slate-200 text-[11px] font-bold uppercase" 
             value={newItem.quantity}
             onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
           />
        </div>
      </div>
      <div className="flex gap-2 pt-6 border-t border-slate-100">
         <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-10 rounded-sm text-[10px] font-black uppercase tracking-widest border-slate-300">
            Abort
         </Button>
         <Button type="submit" className="flex-1 h-10 rounded-sm bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
            Authorize Provisioning
         </Button>
      </div>
    </form>
  );
}
