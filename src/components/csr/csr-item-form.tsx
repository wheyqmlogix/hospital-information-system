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

interface CSRItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CSRItemForm({ onSuccess, onCancel }: CSRItemFormProps) {
  const [newItem, setNewItem] = useState({
    code: "",
    name: "",
    category: "CONSUMABLE",
    unit: "pc",
    price: 0,
    reorderLevel: 50
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/csr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleAddItem} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional SKU</Label>
          <Input 
            required 
            placeholder="CSR-XXX-000" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newItem.code}
            onChange={e => setNewItem({...newItem, code: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Nomenclature</Label>
          <Input 
            required 
            placeholder="e.g. Disposable Syringe" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newItem.name}
            onChange={e => setNewItem({...newItem, name: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</Label>
          <Select onValueChange={v => setNewItem({...newItem, category: v})} defaultValue={newItem.category}>
             <SelectTrigger className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase">
                <SelectValue placeholder="Select Category" />
             </SelectTrigger>
             <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                <SelectItem value="CONSUMABLE" className="text-[10px] font-bold uppercase">Consumable</SelectItem>
                <SelectItem value="PROTECTIVE" className="text-[10px] font-bold uppercase">Protective Gear</SelectItem>
                <SelectItem value="SURGICAL" className="text-[10px] font-bold uppercase">Surgical Instrument</SelectItem>
                <SelectItem value="EQUIPMENT" className="text-[10px] font-bold uppercase">Equipment</SelectItem>
             </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issuance Unit</Label>
          <Input 
            required 
            placeholder="pc, pair, pad..." 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newItem.unit}
            onChange={e => setNewItem({...newItem, unit: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Price (PHP)</Label>
          <Input 
            required 
            type="number" 
            step="0.01"
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newItem.price}
            onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical Threshold</Label>
          <Input 
            required 
            type="number" 
            className="h-10 rounded-sm bg-slate-50 focus:bg-white text-[11px] font-bold uppercase"
            value={newItem.reorderLevel}
            onChange={e => setNewItem({...newItem, reorderLevel: Number(e.target.value)})}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-6 border-t border-slate-100">
         <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-10 rounded-sm text-[10px] font-black uppercase tracking-widest border-slate-300">
            Abort
         </Button>
         <Button type="submit" className="flex-1 h-10 rounded-sm bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
            Commit Asset to Registry
         </Button>
      </div>
    </form>
  );
}
