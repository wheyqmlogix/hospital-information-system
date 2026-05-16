"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CSRItemForm } from "@/components/csr/csr-item-form";

export default function NewCSRItemPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link 
          href="/csr" 
          className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Registry Return
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Initialize Supply Asset</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institutional Asset Control & Inventory Master Index</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="h-6 w-6 bg-[#0f172a]/10 rounded-sm flex items-center justify-center">
            <Package className="h-3.5 w-3.5 text-[#0f172a]" />
          </div>
          <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">Asset Specification</h2>
        </div>
        <CardContent className="p-8">
          <CSRItemForm 
            onSuccess={() => router.push("/csr")} 
            onCancel={() => router.push("/csr")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
