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

interface PharmacyItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PharmacyItemForm({ onSuccess, onCancel }: PharmacyItemFormProps) {
  const [newMed, setNewMed] = useState({
    code: "",
    name: "",
    genericName: "",
    form: "TABLET",
    strength: "",
    unit: "mg",
    price: 0,
    reorderLevel: 10
  });

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pharmacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMed),
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleAddMedication} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Code (SKU)</Label>
          <Input 
            required 
            placeholder="e.g. MED-001" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newMed.code}
            onChange={e => setNewMed({...newMed, code: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Name</Label>
          <Input 
            required 
            placeholder="e.g. Biogesic" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newMed.name}
            onChange={e => setNewMed({...newMed, name: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generic Name</Label>
          <Input 
            required 
            placeholder="e.g. Paracetamol" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newMed.genericName}
            onChange={e => setNewMed({...newMed, genericName: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formulation</Label>
          <Select onValueChange={v => setNewMed({...newMed, form: v})} defaultValue={newMed.form}>
             <SelectTrigger className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase">
                <SelectValue placeholder="Select form" />
             </SelectTrigger>
             <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                <SelectItem value="TABLET" className="text-[10px] font-bold uppercase">Tablet</SelectItem>
                <SelectItem value="CAPSULE" className="text-[10px] font-bold uppercase">Capsule</SelectItem>
                <SelectItem value="SYRUP" className="text-[10px] font-bold uppercase">Syrup</SelectItem>
                <SelectItem value="INJECTION" className="text-[10px] font-bold uppercase">Injection</SelectItem>
                <SelectItem value="SUSPENSION" className="text-[10px] font-bold uppercase">Suspension</SelectItem>
             </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strength</Label>
          <Input 
            required 
            placeholder="e.g. 500" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newMed.strength}
            onChange={e => setNewMed({...newMed, strength: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</Label>
          <Input 
            required 
            placeholder="e.g. mg" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newMed.unit}
            onChange={e => setNewMed({...newMed, unit: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price (PHP)</Label>
          <Input 
            required 
            type="number" 
            step="0.01"
            placeholder="0.00" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newMed.price}
            onChange={e => setNewMed({...newMed, price: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reorder Threshold</Label>
          <Input 
            required 
            type="number" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newMed.reorderLevel}
            onChange={e => setNewMed({...newMed, reorderLevel: Number(e.target.value)})}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-6 border-t border-slate-100">
         <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-10 rounded-sm text-[10px] font-black uppercase tracking-widest border-slate-300">
            Abort
         </Button>
         <Button type="submit" className="flex-1 h-10 rounded-sm bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
            Register Medication
         </Button>
      </div>
    </form>
  );
}
