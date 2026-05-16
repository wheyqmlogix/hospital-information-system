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
  ArrowLeft
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

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  createdAt: string;
  medication: {
    name: string;
  };
}

export default function PharmacyInventoryPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [medsRes, transRes] = await Promise.all([
        fetch("/api/pharmacy"),
        fetch("/api/pharmacy/transactions")
      ]);
      if (medsRes.ok) setMedications(await medsRes.json());
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

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Inventory...</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/admissions" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#0f172a] transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tighter uppercase">Pharmacy Command Center</h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Manage hospital medication inventory and stock levels.</p>
        </div>

        <Link href="/inventory/new">
          <Button 
            className="bg-[#0f172a] hover:bg-black text-white rounded-sm font-bold uppercase tracking-widest px-8 h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Items", value: medications.length, icon: Package, color: "text-[#0f172a]", bg: "bg-slate-50" },
          { label: "Low Stock Alert", value: medications.filter(m => m.stock <= m.reorderLevel).length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Stock In (24h)", value: "12", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Stock Out (24h)", value: "48", icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <Card key={i} className="border border-slate-200 rounded-sm overflow-hidden">
            <CardContent className="p-6">
              <div className={cn("h-8 w-8 rounded-sm flex items-center justify-center mb-4", stat.bg, stat.color)}>
                  <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <span className="text-2xl font-black text-[#0f172a]">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200 rounded-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-[#0f172a]">
                <Activity className="h-5 w-5 text-[#0f172a]" />
                Live Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generic</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medications.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0f172a] uppercase tracking-tight text-xs">{m.name}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.strength} • {m.form}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{m.genericName}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={cn(
                             "inline-flex items-center px-2 py-0.5 rounded-[1px] text-[9px] font-black uppercase tracking-widest border",
                             m.stock <= m.reorderLevel ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                           )}>
                              {m.stock} {m.unit}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <span className="font-black text-[#0f172a] mr-4 text-xs">₱{Number(m.price).toLocaleString()}</span>
                              <Link href={`/inventory/restock/${m.id}`}>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-sm border-slate-200 text-[#0f172a] font-black uppercase tracking-widest h-7 text-[9px]"
                                >
                                   <Plus className="h-3 w-3 mr-1" />
                                   Restock
                                </Button>
                              </Link>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions / Activity Feed */}
        <div className="space-y-6">
          <Card className="border border-slate-200 rounded-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-[#0f172a]">
                <History className="h-5 w-5 text-[#0f172a]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-start gap-4">
                  <div className={cn(
                    "h-8 w-8 rounded-sm flex items-center justify-center shrink-0 border",
                    t.type === 'DISPENSE' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-green-50 text-green-600 border-green-100"
                  )}>
                    {t.type === 'DISPENSE' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-[#0f172a] leading-none uppercase tracking-widest">
                      {t.type === 'DISPENSE' ? 'Dispensed' : 'Stock In'} {Math.abs(t.quantity)} units
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.medication.name}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{new Date(t.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] py-10">No recent transactions</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
