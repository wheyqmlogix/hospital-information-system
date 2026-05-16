"use client";

import { useState, useEffect, useCallback, use } from "react";
import { 
  ArrowLeft, 
  Receipt, 
  Plus, 
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
import { PDFDownloadLink } from "@react-pdf/renderer";
import { BillingStatement } from "@/components/admissions/billing-statement";
import { PaymentModal } from "@/components/admissions/payment-modal";
import { PhilHealthClaims } from "@/components/admissions/philhealth-claims";
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
  philHealthAmount: number;
  netAmount: number;
  paidAmount: number;
  balance: number;
  items: InvoiceItem[];
  admission: {
    id: string;
    admissionId: string;
    primaryCaseRateId?: string;
    patient: {
      id: string;
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

export default function BillingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [caseRates, setCaseRates] = useState<CaseRate[]>([]);
  const [selectedCaseRate, setSelectedCaseRate] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // New Item Form
  const [newItem, setNewItem] = useState({
    category: "MEDICATION",
    description: "",
    quantity: 1,
    unitPrice: 0,
    isVatable: true
  });

  const fetchInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/admissions/${id}/invoice`);
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
  }, [id]);

  const fetchCaseRates = useCallback(async (q: string = "") => {
    try {
      const res = await fetch(`/api/reference/case-rates?query=${q}`);
      if (res.ok) setCaseRates(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsClient(true);
      fetchInvoice();
      fetchCaseRates();
    });
  }, [fetchInvoice, fetchCaseRates]);

  const handleUpdateCaseRate = async (rateId: string) => {
    try {
      const res = await fetch(`/api/admissions/${id}`, {
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
      const res = await fetch(`/api/admissions/${id}/invoice/items`, {
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
      const res = await fetch(`/api/admissions/${id}/invoice`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountType }),
      });
      if (res.ok) fetchInvoice();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Billing Records...</div>;
  if (!invoice) return <div className="p-20 text-center">Institutional Invoice Registry: No Record Found.</div>;

  const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  return (
    <div className="max-w-full space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <Link 
            href={`/admissions/${id}`} 
            className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="h-3 w-3 mr-2" />
            Clinical Return
          </Link>
          <div className="flex items-center gap-6">
             <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter leading-none">
               Financial Settlement
             </h1>
             <span className={cn(
               "text-[9px] font-black px-2 py-0.5 rounded-[1px] border uppercase tracking-widest",
               invoice.status === 'PAID' ? "bg-green-50 text-green-700 border-green-100" :
               invoice.status === 'PARTIALLY_PAID' ? "bg-slate-50 text-[#0f172a] border-slate-200" :
               "bg-slate-50 text-slate-400 border-slate-200"
             )}>
               Status: {invoice.status.replace("_", " ")}
             </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Invoice Registry: {invoice.invoiceNumber}</p>
        </div>

        <div className="flex items-center gap-2">
           {isClient && invoice && (
             <PDFDownloadLink 
               document={<BillingStatement invoice={invoice} />} 
               fileName={`SOA-${invoice.invoiceNumber}.pdf`}
             >
                {({ loading }) => (
                  <Button variant="outline" className="h-9 px-6 rounded-sm border-slate-300 text-[9px] font-black uppercase tracking-widest" disabled={loading}>
                     <Printer className="h-3.5 w-3.5 mr-2" />
                     {loading ? 'Processing...' : 'Export SOA'}
                  </Button>
                )}
             </PDFDownloadLink>
           )}
           <Button 
             onClick={() => setShowPaymentModal(true)}
             disabled={invoice.balance <= 0}
             className="bg-[#0f172a] text-white h-9 px-8 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-sm"
           >
              <CreditCard className="h-3.5 w-3.5 mr-2" />
              {invoice.status === 'PAID' ? 'Settlement Finalized' : 'Execute Collection'}
           </Button>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal 
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          balance={invoice.balance}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchInvoice();
          }}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Left Column: Items */}
         <div className="lg:col-span-3 space-y-6">
            <Card className="border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
               <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Receipt className="h-3.5 w-3.5 text-[#0f172a]" />
                     Statement of Account (SOA) Registry
                  </h2>
                  <Button 
                    onClick={() => setIsAddingItem(!isAddingItem)}
                    className="h-7 px-3 rounded-[1px] bg-[#0f172a] text-white text-[8px] font-black uppercase tracking-widest"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Provision Item
                  </Button>
               </div>
               <CardContent className="p-0">
                  {isAddingItem && (
                    <div className="p-8 bg-slate-50 border-b border-slate-200 space-y-5 animate-in slide-in-from-top-2 duration-300">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ledger Category</Label>
                             <Select onValueChange={(val) => setNewItem({...newItem, category: val})} defaultValue={newItem.category}>
                                <SelectTrigger className="h-8 rounded-sm bg-white border-slate-200 text-[10px] font-bold uppercase tracking-tight">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                                   <SelectItem value="MEDICATION" className="text-[10px] font-bold uppercase">Medication</SelectItem>
                                   <SelectItem value="CSR" className="text-[10px] font-bold uppercase">Central Supply (CSR)</SelectItem>
                                   <SelectItem value="LABORATORY" className="text-[10px] font-bold uppercase">Laboratory</SelectItem>
                                   <SelectItem value="PROCEDURE" className="text-[10px] font-bold uppercase">Procedure</SelectItem>
                                   <SelectItem value="PF" className="text-[10px] font-bold uppercase">Professional Fee</SelectItem>
                                   <SelectItem value="ROOM" className="text-[10px] font-bold uppercase">Room / Board</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Institutional Descriptor</Label>
                             <Input 
                               className="h-8 rounded-sm bg-white border-slate-200 text-[10px] font-bold uppercase" 
                               value={newItem.description}
                               onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                             />
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Unit Quantum (PHP)</Label>
                             <Input 
                               type="number" 
                               className="h-8 rounded-sm bg-white border-slate-200 text-[10px] font-bold uppercase" 
                               value={newItem.unitPrice}
                               onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                             />
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Units</Label>
                             <Input 
                               type="number" 
                               className="h-8 rounded-sm bg-white border-slate-200 text-[10px] font-bold uppercase" 
                               value={newItem.quantity}
                               onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                             />
                          </div>
                          <div className="flex items-end pb-0.5">
                             <Button onClick={handleAddItem} className="w-full bg-[#0f172a] text-white h-8 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-sm">
                                Authorize Addition
                             </Button>
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-white border-b border-slate-100">
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Category</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Descriptor</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50 text-center">Qty</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Line Total (PHP)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {invoice.items.map((item) => (
                             <tr key={item.id} className="hover:bg-[#fcfcfc] transition-colors group">
                                <td className="px-8 py-4 border-r border-slate-50">
                                   <div className="flex items-center gap-3">
                                      <div className="h-6 w-6 rounded-[1px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[#0f172a] group-hover:text-white transition-colors">
                                         {item.category === 'MEDICATION' && <Pill className="h-3 w-3" />}
                                         {item.category === 'PF' && <Stethoscope className="h-3 w-3" />}
                                         {item.category === 'LABORATORY' && <Microscope className="h-3 w-3" />}
                                         {(!['MEDICATION', 'PF', 'LABORATORY'].includes(item.category)) && <Info className="h-3 w-3" />}
                                      </div>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.category}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-4 border-r border-slate-50 font-black text-[#0f172a] text-[10px] uppercase tracking-tight">{item.description}</td>
                                <td className="px-8 py-4 border-r border-slate-50 text-center font-black text-slate-500 text-[10px]">{item.quantity}</td>
                                <td className="px-8 py-4 text-right font-black text-[#0f172a] text-[11px] tracking-tighter">
                                   {currencyFormatter.format(Number(item.totalPrice))}
                                </td>
                             </tr>
                           ))}
                           {invoice.items.length === 0 && (
                             <tr>
                                <td colSpan={4} className="py-24 text-center">
                                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Accounting State: No Charges Provisioned</p>
                                </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Right Column: Totals & PhilHealth */}
         <div className="space-y-6">
            <Card className="border-slate-900 bg-[#0f172a] text-white rounded-sm overflow-hidden shadow-xl">
               <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Liability</p>
                        <p className="text-4xl font-black tracking-tighter leading-none">{currencyFormatter.format(Number(invoice.balance))}</p>
                     </div>
                     <div className="bg-white/10 px-3 py-1.5 rounded-[1px] border border-white/5">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross SOA</p>
                        <p className="text-[10px] font-black text-white">{currencyFormatter.format(Number(invoice.netAmount))}</p>
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10 space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                        <span className="text-slate-400">Total Accrual</span>
                        <span className="text-white">{currencyFormatter.format(Number(invoice.grossAmount))}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                        <span className="text-slate-400">VAT Adjustment</span>
                        <span className="text-white">{currencyFormatter.format(Number(invoice.vatAmount))}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight text-green-400">
                        <span>Mandated Discounts</span>
                        <span className="tracking-tighter">-{currencyFormatter.format(Number(invoice.discountAmount))}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight text-white">
                        <span className="text-slate-400">PhilHealth Coverage</span>
                        <span className="tracking-tighter">-{currencyFormatter.format(Number(invoice.philHealthAmount))}</span>
                     </div>
                     {Number(invoice.paidAmount) > 0 && (
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight text-green-400 pt-3 border-t border-white/5">
                          <span>Total Collections</span>
                          <span className="tracking-tighter">-{currencyFormatter.format(Number(invoice.paidAmount))}</span>
                       </div>
                     )}
                  </div>
               </CardContent>
            </Card>

            <PhilHealthClaims 
              invoiceId={invoice.id}
              patientId={invoice.admission.patient.id}
              philHealthAmount={invoice.philHealthAmount}
            />

            <Card className="border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
               <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <ShieldCheck className="h-3.5 w-3.5 text-[#0f172a]" />
                     Coverage Classification
                  </h2>
               </div>
               <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">ICD-10 Primary Identifier</Label>
                     <Select onValueChange={handleUpdateCaseRate} value={selectedCaseRate || ""}>
                        <SelectTrigger className="rounded-sm border-slate-200 h-10 text-[10px] font-bold uppercase tracking-tight">
                           <SelectValue placeholder="Select Record Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm border-slate-200 shadow-xl max-h-[300px]">
                           {caseRates.map((rate) => (
                             <SelectItem key={rate.id} value={rate.id} className="focus:bg-slate-50 rounded-sm">
                                <div className="flex flex-col text-left py-1">
                                   <span className="text-[10px] font-black text-[#0f172a] uppercase">{rate.code}: {rate.description}</span>
                                   <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Coverage Cap: {currencyFormatter.format(Number(rate.totalAmount))}</span>
                                </div>
                             </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
               <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Tag className="h-3.5 w-3.5 text-[#0f172a]" />
                     Mandated Ledger Adjustments
                  </h2>
               </div>
               <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Regulatory Discount Class</Label>
                     <Select onValueChange={handleUpdateDiscount} defaultValue={invoice.discountType}>
                        <SelectTrigger className="rounded-sm border-slate-200 h-10 text-[10px] font-bold uppercase tracking-tight">
                           <SelectValue placeholder="Standard Billing" />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                           <SelectItem value="NONE" className="text-[10px] font-bold uppercase">Standard Billing</SelectItem>
                           <SelectItem value="SENIOR_CITIZEN" className="text-[10px] font-bold uppercase">Senior Citizen Protocol (20%)</SelectItem>
                           <SelectItem value="PWD" className="text-[10px] font-bold uppercase">PWD Protocol (20%)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </CardContent>
            </Card>

            <div className="bg-slate-50 border border-slate-200 rounded-sm p-6 space-y-4 shadow-sm">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Financial Dossier</p>
               <div className="space-y-1">
                  <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight leading-none">{invoice.admission.patient.lastName}, {invoice.admission.patient.firstName}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                     {invoice.admission.patient.seniorId && (
                       <span className="bg-slate-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-[1px] uppercase tracking-widest">SR: {invoice.admission.patient.seniorId}</span>
                     )}
                     {invoice.admission.patient.pwdId && (
                       <span className="bg-slate-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-[1px] uppercase tracking-widest">PWD: {invoice.admission.patient.pwdId}</span>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
