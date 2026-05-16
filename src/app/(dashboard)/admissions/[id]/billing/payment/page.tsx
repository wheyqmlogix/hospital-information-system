"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentForm } from "@/components/admissions/payment-form";

interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  balance: number;
}

export default function NewPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/admissions/${id}/invoice`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);
  
  if (loading) return <div className="p-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Financial Records...</div>;
  if (!invoice) return <div className="p-20 text-center">Institutional Invoice Registry: No Record Found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link 
          href={`/admissions/${id}/billing`} 
          className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Billing Return
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Execute Collection</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Financial Settlement & Receipt Generation</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <PaymentForm 
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
            balance={Number(invoice.balance)}
            onSuccess={() => router.push(`/admissions/${id}/billing`)} 
            onCancel={() => router.push(`/admissions/${id}/billing`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
