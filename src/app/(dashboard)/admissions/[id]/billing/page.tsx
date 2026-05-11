"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Receipt, 
  Plus, 
  Trash2, 
  CreditCard, 
  Printer, 
  Tag,
  Stethoscope,
  Pill,
  Microscope,
  Info,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isVatable: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  discountType: string;
  grossAmount: number;
  vatAmount: number;
  discountAmount: number;
  netAmount: number;
  items: InvoiceItem[];
  admission: {
    patient: {
      firstName: string;
      lastName: string;
      seniorId?: string;
      pwdId?: string;
    }
  }
}

interface CaseRate {
  id: string;
  code: string;
  description: string;
  hciAmount: number;
  hcpAmount: number;
  totalAmount: number;
}

export default function BillingPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [caseRates, setCaseRates] = useState<CaseRate[]>([]);
  const [selectedCaseRate, setSelectedCaseRate] = useState<string | null>(null);
  
  // New Item Form
  const [newItem, setNewItem] = useState({
    category: "MEDICATION",
    description: "",
    quantity: 1,
    unitPrice: 0,
    isVatable: true
  });

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/admissions/${params.id}/invoice`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
        if (data.admission?.primaryCaseRateId) {
          setSelectedCaseRate(data.admission.primaryCaseRateId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseRates = async (q: string = "") => {
    try {
      const res = await fetch(`/api/reference/case-rates?query=${q}`);
      if (res.ok) setCaseRates(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoice();
    fetchCaseRates();
  }, [params.id]);

  const handleUpdateCaseRate = async (rateId: string) => {
    try {
      const res = await fetch(`/api/admissions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryCaseRateId: rateId }),
      });
      if (res.ok) {
        setSelectedCaseRate(rateId);
        fetchInvoice();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    try {
      const res = await fetch(`/api/admissions/${params.id}/invoice/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        fetchInvoice();
        setIsAddingItem(false);
        setNewItem({
          category: "MEDICATION",
          description: "",
          quantity: 1,
          unitPrice: 0,
          isVatable: true
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDiscount = async (discountType: string) => {
    try {
      const res = await fetch(`/api/admissions/${params.id}/invoice`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountType }),
      });
      if (res.ok) fetchInvoice();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Generating Bill...</div>;
  if (!invoice) return <div className="p-20 text-center">Invoice not found.</div>;

  const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href={`/admissions/${params.id}`} 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Clinical Record
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Invoicing</h1>
             <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
               {invoice.status}
             </span>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{invoice.invoiceNumber}</p>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-2xl border-slate-200 font-bold px-6">
              <Printer className="h-5 w-5 mr-2" />
              Print SOA
           </Button>
           <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-lg shadow-green-100 font-bold px-8">
              <CreditCard className="h-5 w-5 mr-2" />
              Finalize & Pay
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Left Column: Items */}
         <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                     <Receipt className="h-5 w-5 text-blue-600" />
                     Statement of Account
                  </CardTitle>
                  <Button 
                    onClick={() => setIsAddingItem(!isAddingItem)}
                    size="sm" 
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
               </CardHeader>
               <CardContent className="p-0">
                  {isAddingItem && (
                    <div className="p-8 bg-blue-50/50 border-b border-blue-100 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase tracking-widest">Category</Label>
                             <Select onValueChange={(val) => setNewItem({...newItem, category: val})} defaultValue={newItem.category}>
                                <SelectTrigger className="rounded-xl bg-white border-none">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                   <SelectItem value="MEDICATION">Medication</SelectItem>
                                   <SelectItem value="LABORATORY">Laboratory</SelectItem>
                                   <SelectItem value="PROCEDURE">Procedure</SelectItem>
                                   <SelectItem value="PF">Professional Fee</SelectItem>
                                   <SelectItem value="ROOM">Room / Board</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase tracking-widest">Description</Label>
                             <Input 
                               className="rounded-xl bg-white border-none" 
                               value={newItem.description}
                               onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                             />
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase tracking-widest">Unit Price</Label>
                             <Input 
                               type="number" 
                               className="rounded-xl bg-white border-none" 
                               value={newItem.unitPrice}
                               onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase tracking-widest">Qty</Label>
                             <Input 
                               type="number" 
                               className="rounded-xl bg-white border-none" 
                               value={newItem.quantity}
                               onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                             />
                          </div>
                          <div className="flex items-end pb-1">
                             <Button onClick={handleAddItem} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                                Save Item
                             </Button>
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-slate-50">
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {invoice.items.map((item) => (
                             <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-2">
                                      {item.category === 'MEDICATION' && <Pill className="h-3 w-3 text-purple-500" />}
                                      {item.category === 'PF' && <Stethoscope className="h-3 w-3 text-blue-500" />}
                                      {item.category === 'LABORATORY' && <Microscope className="h-3 w-3 text-green-500" />}
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.category}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-5 font-bold text-slate-900">{item.description}</td>
                                <td className="px-8 py-5 font-bold text-slate-500">{item.quantity}</td>
                                <td className="px-8 py-5 font-black text-slate-900 text-right">
                                   {currencyFormatter.format(Number(item.totalPrice))}
                                </td>
                             </tr>
                           ))}
                           {invoice.items.length === 0 && (
                             <tr>
                                <td colSpan={4} className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                                   No items added to this bill.
                                </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Right Column: Totals & Discounts */}
         <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-slate-900 text-white">
               <CardContent className="p-8 space-y-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</p>
                     <p className="text-4xl font-black">{currencyFormatter.format(Number(invoice.netAmount))}</p>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10 space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">Gross Amount</span>
                        <span className="font-bold">{currencyFormatter.format(Number(invoice.grossAmount))}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold">VAT (12%)</span>
                        <span className="font-bold">{currencyFormatter.format(Number(invoice.vatAmount))}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm text-green-400">
                        <span className="font-bold">Total Discounts</span>
                        <span className="font-black">-{currencyFormatter.format(Number(invoice.discountAmount))}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm text-blue-400">
                        <span className="font-bold">PhilHealth Benefit</span>
                        <span className="font-black">-{currencyFormatter.format(Number(invoice.philHealthAmount))}</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                     <ShieldCheck className="h-5 w-5 text-blue-600" />
                     PhilHealth Case Rate
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase tracking-widest">Primary Diagnosis (ICD-10)</Label>
                     <Select onValueChange={handleUpdateCaseRate} value={selectedCaseRate || ""}>
                        <SelectTrigger className="rounded-xl border-2 border-slate-100 h-14">
                           <SelectValue placeholder="Select Case Rate" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-[300px]">
                           {caseRates.map((rate) => (
                             <SelectItem key={rate.id} value={rate.id} className="focus:bg-slate-50 rounded-xl">
                                <div className="flex flex-col text-left py-1">
                                   <span className="font-bold text-slate-900">{rate.code}: {rate.description}</span>
                                   <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Benefit: {currencyFormatter.format(Number(rate.totalAmount))}</span>
                                </div>
                             </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  {selectedCaseRate && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                       <Info className="h-5 w-5 text-blue-600 shrink-0" />
                       <div>
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">PhilHealth Deducted</p>
                          <p className="text-[10px] text-blue-600 leading-relaxed mt-1">
                             The benefit amount is automatically deducted from the patient&apos;s net bill according to the All-Case-Rate policy.
                          </p>
                       </div>
                    </div>
                  )}
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                     <Tag className="h-5 w-5 text-blue-600" />
                     PH Mandated Discounts
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase tracking-widest">Applied Discount</Label>
                     <Select onValueChange={handleUpdateDiscount} defaultValue={invoice.discountType}>
                        <SelectTrigger className="rounded-xl border-2 border-slate-100 h-12">
                           <SelectValue placeholder="No Discount" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="NONE">No Discount</SelectItem>
                           <SelectItem value="SENIOR_CITIZEN">Senior Citizen (20%)</SelectItem>
                           <SelectItem value="PWD">PWD (20%)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  {invoice.discountType !== 'NONE' && (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex gap-3">
                       <Info className="h-5 w-5 text-green-600 shrink-0" />
                       <div>
                          <p className="text-xs font-bold text-green-800 uppercase tracking-wide">PH Standard Applied</p>
                          <p className="text-[10px] text-green-600 leading-relaxed mt-1">
                             Bill is calculated as VAT-Exempt (12%) followed by a 20% discount on the net-of-VAT amount.
                          </p>
                       </div>
                    </div>
                  )}
               </CardContent>
            </Card>

            <div className="bg-slate-100 rounded-[2rem] p-8 space-y-4">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Financial Info</p>
               <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{invoice.admission.patient.lastName}, {invoice.admission.patient.firstName}</p>
                  <div className="flex flex-wrap gap-2">
                     {invoice.admission.patient.seniorId && (
                       <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">SENIOR: {invoice.admission.patient.seniorId}</span>
                     )}
                     {invoice.admission.patient.pwdId && (
                       <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">PWD: {invoice.admission.patient.pwdId}</span>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
