"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Clock, 
  AlertCircle,
  ArrowDownToLine,
  History,
  CheckCircle2,
  TrendingDown
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

interface SupplyItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
}

interface IssuanceTransaction {
  id: string;
  supplyItem: SupplyItem;
  quantity: number;
  createdAt: string;
}

interface CSRIssuanceProps {
  admissionId: string;
}

export function CSRIssuance({ admissionId }: CSRIssuanceProps) {
  const [issued, setIssued] = useState<IssuanceTransaction[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [issuedRes, suppRes] = await Promise.all([
        fetch(`/api/admissions/${admissionId}/csr`),
        fetch("/api/csr")
      ]);
      if (issuedRes.ok) setIssued(await issuedRes.json());
      if (suppRes.ok) setSupplies(await suppRes.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [admissionId]);

  const handleIssue = async () => {
    if (!selectedItemId || quantity <= 0) return;
    setIsIssuing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admissions/${admissionId}/csr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplyItemId: selectedItemId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Issuance failed");
      }

      setSelectedItemId("");
      setQuantity(1);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsIssuing(false);
    }
  };

  const selectedItem = supplies.find(s => s.id === selectedItemId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search & Issuance Control */}
      <Card className="border-slate-200 rounded-sm bg-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5">
             <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-4 bg-[#0f172a] rounded-[1px] flex items-center justify-center">
                   <Package className="h-2.5 w-2.5 text-white" />
                </div>
                <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.2em]">Institutional Asset Issuance</h3>
             </div>

             <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1 space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Asset Registry Selection</label>
                   <Select onValueChange={setSelectedItemId} value={selectedItemId}>
                      <SelectTrigger className="h-9 rounded-sm border-slate-200 bg-slate-50 focus:border-[#0f172a] transition-all text-[10px] font-bold uppercase">
                         <SelectValue placeholder="Search CSR Registry..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm border-slate-200 shadow-xl max-h-[300px]">
                         {supplies.map((item) => (
                           <SelectItem key={item.id} value={item.id} className="focus:bg-slate-50 rounded-sm" disabled={item.stock <= 0}>
                              <div className="flex flex-col text-left py-1">
                                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                                 <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{item.code} • PHP {Number(item.price).toFixed(2)}</span>
                                    <span className={cn(
                                       "text-[8px] font-black uppercase tracking-tighter",
                                       item.stock > 20 ? "text-green-600" : "text-red-600"
                                    )}>INST. STOCK: {item.stock}</span>
                                 </div>
                              </div>
                           </SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
                <div className="w-full md:w-24 space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Units</label>
                   <Input 
                     type="number" 
                     value={quantity} 
                     onChange={(e) => setQuantity(Number(e.target.value))}
                     className="h-9 rounded-sm border-slate-200 bg-slate-50 text-center text-[10px] font-black focus:border-[#0f172a] focus:bg-white transition-all"
                   />
                </div>
                <Button 
                  onClick={handleIssue}
                  disabled={isIssuing || !selectedItemId || (selectedItem && selectedItem.stock < quantity)}
                  className="bg-[#0f172a] text-white hover:bg-black rounded-sm h-9 px-8 text-[9px] font-black uppercase tracking-widest shadow-sm"
                >
                   {isIssuing ? "Authorizing..." : "Charge to Admission"}
                   <ArrowDownToLine className="h-3 w-3 ml-2" />
                </Button>
             </div>
             
             {error && (
               <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-sm flex items-center gap-3 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Registry Error: {error}
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Issuance History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <History className="h-3 w-3" />
              Patient Issuance Audit
           </h4>
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{issued.length} Recorded Items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {issued.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-sm flex flex-col gap-3 group hover:border-[#0f172a]/20 transition-all">
               <div className="flex items-start justify-between">
                  <div className="h-8 w-8 rounded-sm bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-[#0f172a] group-hover:text-white transition-colors">
                     <TrendingDown className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                     <div className="text-[14px] font-black text-[#0f172a] tracking-tighter leading-none">{Math.abs(item.quantity)}</div>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Units issued</p>
                  </div>
               </div>
               <div>
                  <h4 className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight leading-tight">{item.supplyItem.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {item.supplyItem.code} • Institutional Asset
                  </p>
               </div>
               
               <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                     <Clock className="h-3 w-3" />
                     <span className="text-[8px] font-black uppercase tracking-tighter">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-[1px] uppercase tracking-tighter border border-green-100">
                     <CheckCircle2 className="h-2.5 w-2.5" />
                     Billed
                  </div>
               </div>
            </div>
          ))}

          {issued.length === 0 && (
            <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-sm border border-dashed border-slate-200">
               <div className="max-w-xs mx-auto opacity-20">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em]">No CSR assets issued to this admission.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
