"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  FlaskConical, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  History,
  ArrowLeft,
  Beaker,
  TestTube2,
  Dna,
  FileEdit,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Protected } from "@/components/auth/protected";

interface LabOrder {
  id: string;
  orderNumber: string;
  status: string;
  result?: string;
  createdAt: string;
  test: {
    name: string;
    category: string;
    price: number;
  };
  admission: {
    id: string;
    patient: {
      firstName: string;
      lastName: string;
      patientId: string;
    }
  }
}

export default function LabDashboard() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingResult, setEditingResult] = useState<{ id: string, text: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/lab/orders", window.location.origin);
      if (search) url.searchParams.set("query", search);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      
      const res = await fetch(url.toString());
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string, result?: string) => {
    try {
      const res = await fetch(`/api/lab/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, result }),
      });
      if (res.ok) {
        setEditingResult(null);
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING' || o.status === 'COLLECTED').length,
    completedToday: orders.filter(o => o.status === 'COMPLETED' && new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
    totalToday: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
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
             <FlaskConical className="h-8 w-8 text-blue-600" />
             Laboratory Command Center
          </h1>
          <p className="text-slate-500 font-medium">Monitor diagnostic requests, sample collection, and result releasing.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
           {["ALL", "PENDING", "COLLECTED", "PROCESSING", "COMPLETED"].map((status) => (
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

      {/* Lab Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Pending Collection", value: stats.pending, icon: Beaker, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "In-Progress Tests", value: stats.processing, icon: Dna, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completed Today", value: stats.completedToday, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Load Today", value: stats.totalToday, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
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
              <CardTitle className="text-lg font-bold">Diagnostic Ledger</CardTitle>
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-300" />
                 <Input 
                   placeholder="Search order #, patient, or test..." 
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
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Info</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Test Name</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-900 font-mono text-sm">{order.orderNumber}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleTimeString()}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                 <User className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-bold text-slate-900">{order.admission.patient.lastName}, {order.admission.patient.firstName}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.admission.patient.patientId}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{order.test.name}</span>
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{order.test.category}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={cn(
                             "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             order.status === 'PENDING' ? "bg-amber-100 text-amber-600" : 
                             order.status === 'COLLECTED' ? "bg-blue-100 text-blue-600" : 
                             order.status === 'PROCESSING' ? "bg-purple-100 text-purple-600" : 
                             order.status === 'COMPLETED' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                           )}>
                              {order.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <Protected permission="manage_lab_results">
                                 {order.status === 'PENDING' && (
                                   <Button 
                                     size="sm" 
                                     onClick={() => updateStatus(order.id, 'COLLECTED')}
                                     className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-none rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                                   >
                                      <TestTube2 className="h-3 w-3 mr-1.5" />
                                      Collect
                                   </Button>
                                 )}
                                 {order.status === 'COLLECTED' && (
                                   <Button 
                                     size="sm" 
                                     onClick={() => updateStatus(order.id, 'PROCESSING')}
                                     className="bg-purple-50 hover:bg-purple-100 text-purple-600 border-none rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                                   >
                                      <Dna className="h-3 w-3 mr-1.5" />
                                      Process
                                   </Button>
                                 )}
                                 {order.status === 'PROCESSING' && !editingResult && (
                                   <Button 
                                     size="sm" 
                                     onClick={() => setEditingResult({ id: order.id, text: '' })}
                                     className="bg-green-50 hover:bg-green-100 text-green-600 border-none rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                                   >
                                      <FileEdit className="h-3 w-3 mr-1.5" />
                                      Result
                                   </Button>
                                 )}
                              </Protected>
                              <Link href={`/admissions/${order.admission.id}`}>
                                 <Button size="sm" variant="ghost" className="rounded-xl hover:bg-blue-50 hover:text-blue-600 font-bold">
                                    <ArrowRight className="h-4 w-4" />
                                 </Button>
                              </Link>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && orders.length === 0 && (
                      <tr>
                         <td colSpan={5} className="py-20 text-center">
                            <div className="max-w-xs mx-auto opacity-20">
                               <FlaskConical className="h-12 w-12 mx-auto mb-4" />
                               <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">No diagnostic orders found.</p>
                            </div>
                         </td>
                      </tr>
                    )}
                    {loading && (
                      <tr>
                         <td colSpan={5} className="py-20 text-center animate-pulse text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                            Scanning Clinical Pipeline...
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>

      {editingResult && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <Card className="w-full max-w-xl border-none shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <FileEdit className="h-5 w-5 text-green-600" />
                    Enter Test Result
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Observations & Findings</label>
                    <textarea
                      className="w-full h-48 rounded-2xl border-2 border-slate-100 p-4 focus:border-blue-500 focus:ring-0 font-medium transition-all"
                      placeholder="Enter quantitative values (e.g. Hemoglobin: 14.5 g/dL) or qualitative findings..."
                      value={editingResult.text}
                      onChange={(e) => setEditingResult({ ...editingResult, text: e.target.value })}
                    />
                 </div>
                 <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setEditingResult(null)}
                      className="flex-1 h-12 rounded-xl font-bold"
                    >
                       Cancel
                    </Button>
                    <Button 
                      onClick={() => updateStatus(editingResult.id, 'COMPLETED', editingResult.text)}
                      disabled={!editingResult.text}
                      className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-100"
                    >
                       Release Result
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
