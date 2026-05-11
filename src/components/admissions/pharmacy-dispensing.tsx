"use client";

import { useState, useEffect } from "react";
import { 
  Pill, 
  Plus, 
  Clock, 
  Trash2, 
  AlertCircle,
  Package,
  ArrowDownToLine,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Medication {
  id: string;
  code: string;
  name: string;
  genericName: string;
  strength: string;
  price: number;
  stock: number;
  unit: string;
}

interface DispenseTransaction {
  id: string;
  medication: Medication;
  quantity: number;
  createdAt: string;
}

interface PharmacyDispensingProps {
  admissionId: string;
}

export function PharmacyDispensing({ admissionId }: PharmacyDispensingProps) {
  const [dispensed, setDispensed] = useState<DispenseTransaction[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedId, setSelectedMedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isDispensing, setIsDispensing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [dispRes, medsRes] = await Promise.all([
        fetch(`/api/admissions/${admissionId}/pharmacy`),
        fetch("/api/pharmacy")
      ]);
      if (dispRes.ok) setDispensed(await dispRes.json());
      if (medsRes.ok) setMedications(await medsRes.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [admissionId]);

  const handleDispense = async () => {
    if (!selectedMedId || quantity <= 0) return;
    setIsDispensing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admissions/${admissionId}/pharmacy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId: selectedMedId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Dispensing failed");
      }

      setSelectedMedId("");
      setQuantity(1);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDispensing(false);
    }
  };

  const selectedMed = medications.find(m => m.id === selectedMedId);

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6">
             <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="flex-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Medication</label>
                   <Select onValueChange={setSelectedMedId} value={selectedMedId}>
                      <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:border-blue-500 transition-all">
                         <SelectValue placeholder="Search from inventory..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl max-h-[300px]">
                         {medications.map((med) => (
                           <SelectItem key={med.id} value={med.id} className="focus:bg-slate-50 rounded-xl" disabled={med.stock <= 0}>
                              <div className="flex flex-col text-left py-1">
                                 <span className="font-bold text-slate-900">{med.name} <span className="text-slate-400 font-medium">({med.genericName})</span></span>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{med.strength} • PHP {med.price}</span>
                                    <span className={cn(
                                       "text-[10px] font-bold uppercase tracking-widest",
                                       med.stock > 10 ? "text-green-500" : "text-red-500"
                                    )}>Stock: {med.stock}</span>
                                 </div>
                              </div>
                           </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
                <div className="w-full md:w-32 space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                   <Input 
                     type="number" 
                     value={quantity} 
                     onChange={(e) => setQuantity(Number(e.target.value))}
                     className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-center font-bold"
                   />
                </div>
                <Button 
                  onClick={handleDispense}
                  disabled={isDispensing || !selectedMedId || (selectedMed && selectedMed.stock < quantity)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-bold shadow-lg shadow-blue-100"
                >
                   Dispense
                   <ArrowDownToLine className="h-5 w-5 ml-2" />
                </Button>
             </div>
             
             {error && (
               <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold">
                  <AlertCircle className="h-5 w-5" />
                  {error}
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dispensed.map((item) => (
          <Card key={item.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white group hover:border-blue-100 border border-transparent transition-all">
             <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                   <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Pill className="h-6 w-6" />
                   </div>
                   <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Qty: {Math.abs(item.quantity)}
                   </div>
                </div>
                <div>
                   <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">{item.medication.name}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {item.medication.genericName} • {item.medication.strength}
                   </p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(item.createdAt).toLocaleString()}</span>
                   </div>
                   <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-widest">Added to Bill</span>
                </div>
             </CardContent>
          </Card>
        ))}

        {dispensed.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
             <div className="max-w-xs mx-auto opacity-20">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">No medications dispensed yet.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
