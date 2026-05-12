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
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <Receipt className="h-8 w-8 text-blue-600" />
             Billing & Collections
          </h1>
          <p className="text-slate-500 font-medium">Manage patient invoices, PhilHealth claims, and hospital revenue.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
           {["ALL", "DRAFT", "PAID", "CANCELLED"].map((status) => (
             <button
               key={status}
               onClick={() => setStatusFilter(status)}
               className={cn(
                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 statusFilter === status 
                  ? "bg-white text-blue-600 shadow-sm" 
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
          { label: "Receivables (Draft)", value: `₱${stats.pendingAmount.toLocaleString()}`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Invoices Paid", value: stats.paidCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Billers", value: stats.draftCount, icon: History, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                  <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg font-bold">Revenue Ledger</CardTitle>
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-300" />
                 <Input 
                   placeholder="Search invoice or patient..." 
                   className="pl-12 h-12 rounded-2xl border-none bg-white shadow-inner"
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
                    <tr className="border-b border-slate-50">
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Net Amount</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                 <Receipt className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-bold text-slate-900 font-mono text-sm">{inv.invoiceNumber}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{inv.admission.patient.lastName}, {inv.admission.patient.firstName}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inv.admission.patient.patientId}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-600">
                           {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={cn(
                             "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             inv.status === 'PAID' ? "bg-green-100 text-green-600" :
                             inv.status === 'DRAFT' ? "bg-blue-100 text-blue-600" :
                             "bg-slate-100 text-slate-600"
                           )}>
                              {inv.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right font-black text-slate-900">
                           ₱{Number(inv.netAmount).toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                           <Link href={`/admissions/${inv.admission.id}/billing`}>
                              <Button size="sm" variant="ghost" className="rounded-xl hover:bg-blue-50 hover:text-blue-600 font-bold group">
                                 Open Account
                                 <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
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
