"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  AlertCircle,
  History,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowLeft,
  Search,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SupplyItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  reorderLevel: number;
}

interface SupplyTransaction {
  id: string;
  type: string;
  quantity: number;
  batchNumber?: string;
  createdAt: string;
  supplyItem: {
    name: string;
  };
}

export default function CSRInventoryPage() {
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [transactions, setTransactions] = useState<SupplyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppRes, transRes] = await Promise.all([
        fetch("/api/csr"),
        fetch("/api/csr/transactions")
      ]);
      if (suppRes.ok) setSupplies(await suppRes.json());
      if (transRes.ok) setTransactions(await transRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSupplies = supplies.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-full space-y-8 pb-20 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Central Supply Registry</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institutional Asset Control & Distribution Monitoring</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchData}
            variant="outline"
            className="h-8 border-slate-300 text-[9px] font-black uppercase tracking-widest"
          >
            <RefreshCw className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
            Sync Registry
          </Button>
          <Link href="/csr/new">
            <Button 
              className="bg-[#0f172a] text-white h-8 px-6 text-[9px] font-black uppercase tracking-widest"
            >
              <Plus className="h-3 w-3 mr-2" />
              Register Asset
            </Button>
          </Link>
        </div>
      </div>

      {/* Registry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200 divide-x divide-slate-200 bg-white">
        {[
          { label: "Total Asset Types", value: supplies.length, icon: Package },
          { label: "Critical Stock Alerts", value: supplies.filter(s => s.stock <= s.reorderLevel).length, icon: AlertCircle, color: "text-[#991b1b]" },
          { label: "Daily Intake Vol.", value: "12", icon: TrendingUp },
          { label: "Daily Issuance Vol.", value: "48", icon: TrendingDown },
        ].map((stat, i) => (
          <div key={i} className="p-6">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className={cn("text-2xl font-black text-[#0f172a] tracking-tighter leading-none", stat.color)}>{stat.value}</span>
              <stat.icon className="h-4 w-4 text-slate-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Registry Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-sm shadow-sm">
            <div className="pl-2 text-slate-400">
               <Search className="h-3.5 w-3.5" />
            </div>
            <input 
              placeholder="Search registry by name, SKU, or category..."
              className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">SKU / Code</th>
                      <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100">Asset Specification</th>
                      <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100 text-center">Unit Stock</th>
                      <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100 text-right">Inst. Price</th>
                      <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Registry Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSupplies.map((s) => (
                      <tr key={s.id} className="hover:bg-[#fcfcfc] transition-colors group">
                        <td className="px-6 py-4 border-r border-slate-50">
                           <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-[1px] border border-slate-100">{s.code}</span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{s.name}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.category} • {s.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50 text-center">
                           <span className={cn(
                             "inline-flex items-center px-2 py-0.5 rounded-[1px] text-[9px] font-black uppercase tracking-tighter border",
                             s.stock <= s.reorderLevel ? "bg-red-50 text-[#991b1b] border-[#991b1b]/20" : "bg-slate-50 text-slate-600 border-slate-200"
                           )}>
                              {s.stock} {s.unit}
                           </span>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50 text-right">
                           <span className="text-[10px] font-black text-[#0f172a] tracking-tight">₱{Number(s.price).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Link href={`/csr/restock/${s.id}`}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 px-3 rounded-[1px] border-slate-200 text-[#0f172a] text-[8px] font-black uppercase tracking-[0.2em]"
                              >
                                 <TrendingUp className="h-3 w-3 mr-2" />
                                 Restock
                              </Button>
                           </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Activity Registry */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
               <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <History className="h-3 w-3" />
                  Registry Audit Log
               </h3>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {transactions.map((t) => (
                  <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-6 w-6 rounded-[1px] flex items-center justify-center shrink-0 border",
                        t.type === 'DISPENSE' ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-green-50 border-green-100 text-green-600"
                      )}>
                        {t.type === 'DISPENSE' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#0f172a] uppercase leading-none mb-1">
                          {t.type === 'DISPENSE' ? 'Issuance' : 'Intake'} • {Math.abs(t.quantity)} Units
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{t.supplyItem.name}</p>
                        <p className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-tighter">{new Date(t.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="py-20 text-center px-8">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">No Audit Records Found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
