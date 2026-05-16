"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Receipt, 
  Search, 
  Filter, 
  ArrowRight, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  History,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: "DRAFT" | "PAID" | "CANCELLED" | "PARTIAL";
  netAmount: number;
  grossAmount: number;
  createdAt: string;
  admission: {
    id: string;
    patient: {
      firstName: string;
      lastName: string;
      patientId: string;
    }
  }
}

export default function BillingDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/billing", window.location.origin);
      if (search) url.searchParams.set("query", search);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      
      const res = await fetch(url.toString());
      if (res.ok) {
        setInvoices(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const stats = {
    totalRevenue: invoices.reduce((acc, inv) => acc + (inv.status === 'PAID' ? Number(inv.netAmount) : 0), 0),
    pendingAmount: invoices.reduce((acc, inv) => acc + (inv.status === 'DRAFT' ? Number(inv.netAmount) : 0), 0),
    paidCount: invoices.filter(inv => inv.status === 'PAID').length,
    draftCount: invoices.filter(inv => inv.status === 'DRAFT').length,
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#0f172a] transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tighter flex items-center gap-3 uppercase">
             <Receipt className="h-8 w-8 text-[#0f172a]" />
             Billing & Collections
          </h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Manage patient invoices, PhilHealth claims, and hospital revenue.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-sm border border-slate-200">
           {["ALL", "DRAFT", "PAID", "CANCELLED"].map((status) => (
             <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={cn(
                 "px-4 py-2 rounded-[1px] text-[10px] font-black uppercase tracking-widest transition-all",
                 statusFilter === status 
                  ? "bg-[#0f172a] text-white" 
                  : "text-slate-400 hover:text-slate-600"
               )}
             >
               {status}
             </button>
           ))}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Collection (Paid)", value: `₱${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Receivables (Draft)", value: `₱${stats.pendingAmount.toLocaleString()}`, icon: Clock, color: "text-[#0f172a]", bg: "bg-slate-50" },
          { label: "Invoices Paid", value: stats.paidCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Billers", value: stats.draftCount, icon: History, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <Card key={i} className="border border-slate-200 rounded-sm overflow-hidden">
            <CardContent className="p-6">
              <div className={cn("h-8 w-8 rounded-sm flex items-center justify-center mb-4 border", stat.bg, stat.color)}>
                  <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <span className="text-2xl font-black text-[#0f172a] tracking-tight">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 rounded-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-[#0f172a]">Revenue Ledger</CardTitle>
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-3 h-4 w-4 text-slate-300" />
                 <Input 
                   placeholder="Search invoice or patient..." 
                   className="pl-12 h-10 rounded-sm border border-slate-200 bg-white"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Amount</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="h-7 w-7 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center">
                                 <Receipt className="h-3.5 w-3.5 text-[#0f172a]" />
                              </div>
                              <span className="font-bold text-[#0f172a] font-mono text-xs uppercase">{inv.invoiceNumber}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex flex-col">
                              <span className="font-black text-[#0f172a] uppercase tracking-tight text-xs">{inv.admission.patient.lastName}, {inv.admission.patient.firstName}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inv.admission.patient.patientId}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-[10px] font-bold text-slate-600 uppercase">
                           {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={cn(
                             "inline-flex items-center px-2 py-0.5 rounded-[1px] text-[9px] font-black uppercase tracking-widest border",
                             inv.status === 'PAID' ? "bg-green-50 text-green-600 border-green-100" :
                             inv.status === 'DRAFT' ? "bg-slate-50 text-[#0f172a] border-slate-200" :
                             "bg-slate-50 text-slate-600 border-slate-200"
                           )}>
                              {inv.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-[#0f172a] text-xs">
                           ₱{Number(inv.netAmount).toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                           <Link href={`/admissions/${inv.admission.id}/billing`}>
                              <Button size="sm" variant="outline" className="rounded-sm border-slate-200 text-[#0f172a] font-black uppercase tracking-widest text-[9px] h-7 group">
                                 Open Account
                                 <ArrowRight className="h-3 w-3 ml-2 transition-transform group-hover:translate-x-1" />
                              </Button>
                           </Link>
                        </td>
                      </tr>
                    ))}
                    {!loading && invoices.length === 0 && (
                      <tr>
                         <td colSpan={6} className="py-20 text-center">
                            <div className="max-w-xs mx-auto opacity-20">
                               <Receipt className="h-12 w-12 mx-auto mb-4" />
                               <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">No billing records found.</p>
                            </div>
                         </td>
                      </tr>
                    )}
                    {loading && (
                      <tr>
                         <td colSpan={6} className="py-20 text-center animate-pulse text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                            Fetching Ledger...
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
