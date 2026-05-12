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
  X
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
  const [isAdding, setIsAdding] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [selectedMedForRestock, setSelectedMedForRestock] = useState<Medication | null>(null);
  
  // New Med Form State
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

  // Restock Form State
  const [restockForm, setRestockForm] = useState({
    batchNumber: "",
    expiryDate: "",
    quantity: 1
  });

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

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pharmacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMed),
      });
      if (res.ok) {
        setIsAdding(false);
        setNewMed({
          code: "",
          name: "",
          genericName: "",
          form: "TABLET",
          strength: "",
          unit: "mg",
          price: 0,
          reorderLevel: 10
        });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForRestock) return;
    
    try {
      const res = await fetch("/api/pharmacy/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId: selectedMedForRestock.id,
          ...restockForm
        }),
      });
      if (res.ok) {
        setIsRestocking(false);
        setSelectedMedForRestock(null);
        setRestockForm({
          batchNumber: "",
          expiryDate: "",
          quantity: 1
        });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Inventory...</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 relative">
      {/* Add Medication Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <Card className="w-full max-w-2xl border-none shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    New Inventory Item
                 </CardTitle>
                 <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-full">
                    <X className="h-5 w-5" />
                 </Button>
              </CardHeader>
              <CardContent className="p-8">
                 <form onSubmit={handleAddMedication} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Code (SKU)</Label>
                          <Input 
                            required 
                            placeholder="e.g. MED-001" 
                            className="h-12 rounded-xl"
                            value={newMed.code}
                            onChange={e => setNewMed({...newMed, code: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Name</Label>
                          <Input 
                            required 
                            placeholder="e.g. Biogesic" 
                            className="h-12 rounded-xl"
                            value={newMed.name}
                            onChange={e => setNewMed({...newMed, name: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generic Name</Label>
                          <Input 
                            required 
                            placeholder="e.g. Paracetamol" 
                            className="h-12 rounded-xl"
                            value={newMed.genericName}
                            onChange={e => setNewMed({...newMed, genericName: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formulation</Label>
                          <Select onValueChange={v => setNewMed({...newMed, form: v})} defaultValue={newMed.form}>
                             <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue placeholder="Select form" />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="TABLET">Tablet</SelectItem>
                                <SelectItem value="CAPSULE">Capsule</SelectItem>
                                <SelectItem value="SYRUP">Syrup</SelectItem>
                                <SelectItem value="INJECTION">Injection</SelectItem>
                                <SelectItem value="SUSPENSION">Suspension</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strength</Label>
                          <Input 
                            required 
                            placeholder="e.g. 500" 
                            className="h-12 rounded-xl"
                            value={newMed.strength}
                            onChange={e => setNewMed({...newMed, strength: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</Label>
                          <Input 
                            required 
                            placeholder="e.g. mg" 
                            className="h-12 rounded-xl"
                            value={newMed.unit}
                            onChange={e => setNewMed({...newMed, unit: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price (PHP)</Label>
                          <Input 
                            required 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="h-12 rounded-xl"
                            value={newMed.price}
                            onChange={e => setNewMed({...newMed, price: Number(e.target.value)})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reorder Threshold</Label>
                          <Input 
                            required 
                            type="number" 
                            className="h-12 rounded-xl"
                            value={newMed.reorderLevel}
                            onChange={e => setNewMed({...newMed, reorderLevel: Number(e.target.value)})}
                          />
                       </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                       <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="flex-1 h-12 rounded-xl font-bold">
                          Cancel
                       </Button>
                       <Button type="submit" className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100">
                          Register Medication
                       </Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}

      {/* Restock Modal Overlay */}
      {isRestocking && selectedMedForRestock && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <Card className="w-full max-w-md border-none shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Restock Medication
                 </CardTitle>
                 <Button variant="ghost" size="icon" onClick={() => setIsRestocking(false)} className="rounded-full">
                    <X className="h-5 w-5" />
                 </Button>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Medication</p>
                    <p className="font-bold text-blue-900">{selectedMedForRestock.name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase">{selectedMedForRestock.genericName} • {selectedMedForRestock.strength}</p>
                 </div>
                 
                 <form onSubmit={handleRestock} className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch / Lot Number</Label>
                       <Input 
                         required 
                         className="h-12 rounded-xl"
                         value={restockForm.batchNumber}
                         onChange={e => setRestockForm({...restockForm, batchNumber: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry Date</Label>
                       <Input 
                         required 
                         type="date"
                         className="h-12 rounded-xl"
                         value={restockForm.expiryDate}
                         onChange={e => setRestockForm({...restockForm, expiryDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity to Add</Label>
                       <Input 
                         required 
                         type="number" 
                         className="h-12 rounded-xl"
                         value={restockForm.quantity}
                         onChange={e => setRestockForm({...restockForm, quantity: Number(e.target.value)})}
                       />
                    </div>
                    <div className="flex gap-4 pt-4">
                       <Button type="button" variant="ghost" onClick={() => setIsRestocking(false)} className="flex-1 h-12 rounded-xl font-bold">
                          Cancel
                       </Button>
                       <Button type="submit" className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-100">
                          Confirm Restock
                       </Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/admissions" 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Command Center</h1>
          <p className="text-slate-500 font-medium">Manage hospital medication inventory and stock levels.</p>
        </div>

        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 font-bold px-8 h-12"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Items", value: medications.length, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Low Stock Alert", value: medications.filter(m => m.stock <= m.reorderLevel).length, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Stock In (24h)", value: "12", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Stock Out (24h)", value: "48", icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Live Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medication</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generic</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stock</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {medications.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{m.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{m.strength} • {m.form}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-xs font-medium text-slate-600">{m.genericName}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={cn(
                             "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             m.stock <= m.reorderLevel ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                           )}>
                              {m.stock} {m.unit}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <span className="font-black text-slate-900 mr-4">₱{Number(m.price).toLocaleString()}</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedMedForRestock(m);
                                  setIsRestocking(true);
                                }}
                                className="rounded-xl border-slate-200 text-blue-600 font-bold h-8"
                              >
                                 <Plus className="h-3 w-3 mr-1" />
                                 Restock
                              </Button>
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
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-slate-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-start gap-4">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    t.type === 'DISPENSE' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                  )}>
                    {t.type === 'DISPENSE' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-slate-900 leading-none">
                      {t.type === 'DISPENSE' ? 'Dispensed' : 'Stock In'} {Math.abs(t.quantity)} units
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t.medication.name}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">{new Date(t.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-xs font-bold text-slate-300 uppercase tracking-widest py-10">No recent transactions</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
