"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BillingItemForm } from "@/components/billing/billing-item-form";

export default function NewBillingItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link 
          href={`/admissions/${id}/billing`} 
          className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Billing Return
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Provision Ledger Item</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institutional Financial Control & Billing Registry</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="h-6 w-6 bg-[#0f172a]/10 rounded-sm flex items-center justify-center">
            <Receipt className="h-3.5 w-3.5 text-[#0f172a]" />
          </div>
          <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">Item Specification</h2>
        </div>
        <CardContent className="p-8">
          <BillingItemForm 
            admissionId={id}
            onSuccess={() => router.push(`/admissions/${id}/billing`)} 
            onCancel={() => router.push(`/admissions/${id}/billing`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
