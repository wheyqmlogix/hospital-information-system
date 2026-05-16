"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PharmacyRestockForm } from "@/components/inventory/pharmacy-restock-form";

interface Medication {
  id: string;
  name: string;
  genericName: string;
  strength: string;
}

export default function PharmacyRestockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pharmacy")
      .then(res => res.json())
      .then(data => {
        const found = data.find((m: Medication) => m.id === id);
        setMedication(found);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Medication Records...</div>;
  if (!medication) return <div className="p-20 text-center">Institutional Medication Registry: No Record Found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link 
          href="/inventory" 
          className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Inventory Return
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Inventory Reconciliation</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Stock Level Adjustment & Audit Authorization</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="h-6 w-6 bg-[#0f172a]/10 rounded-sm flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-[#0f172a]" />
          </div>
          <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">Restock Authorization</h2>
        </div>
        <CardContent className="p-8">
          <PharmacyRestockForm 
            medication={medication}
            onSuccess={() => router.push("/inventory")} 
            onCancel={() => router.push("/inventory")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
