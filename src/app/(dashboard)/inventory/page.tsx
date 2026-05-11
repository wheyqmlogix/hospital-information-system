"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  History, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Pill,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Medication {
  id: string;
  code: string;
  name: string;
  genericName: string;
  form: string;
  strength: string;
  unit: string;
  price: number;
  stock: number;
  reorderLevel: number;
}

export default function InventoryPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInventory = async (q: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pharmacy?query=${q}`);
      if (res.ok) setMeds(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchInventory(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Inventory</h1>
          <p className="text-slate-500 mt-1">Manage medication stock and dispensing audit logs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
             <History className="h-5 w-5 mr-2" />
             Transaction Log
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 font-bold">
            <Plus className="h-5 w-5 mr-2" />
            Stock In
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total SKUs", value: meds.length, icon: Package, color: "text-blue-600" },
           { label: "Low Stock Items", value: meds.filter(m => m.stock <= m.reorderLevel).length, icon: AlertTriangle, color: "text-amber-600" },
           { label: "Out of Stock", value: meds.filter(m => m.stock === 0).length, icon: AlertTriangle, color: "text-red-600" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden">
             <CardContent className="p-6 flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className={cn("p-4 rounded-2xl bg-slate-50", stat.color)}>
                   <stat.icon className="h-6 w-6" />
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-300" />
              <Input 
                placeholder="Search medication name or generic..." 
                className="pl-12 h-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medication</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {meds.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Pill className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 leading-tight">{med.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{med.genericName} • {med.strength}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-lg">{med.stock} <span className="text-[10px] text-slate-400 font-bold uppercase">{med.unit}</span></span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                           <div 
                             className={cn(
                               "h-full rounded-full transition-all",
                               med.stock > med.reorderLevel ? "bg-green-500" : "bg-red-500"
                             )} 
                             style={{ width: `${Math.min((med.stock / (med.reorderLevel * 2)) * 100, 100)}%` }}
                           />
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900">PHP {med.price}</p>
                  </td>
                  <td className="px-8 py-6">
                     <span className={cn(
                       "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                       med.stock > med.reorderLevel ? "bg-green-100 text-green-600" : 
                       med.stock > 0 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                     )}>
                       {med.stock > med.reorderLevel ? "Healthy" : med.stock > 0 ? "Low Stock" : "Out of Stock"}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <Button variant="ghost" size="sm" className="rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold">
                        Manage
                        <ChevronRight className="h-4 w-4 ml-1" />
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
