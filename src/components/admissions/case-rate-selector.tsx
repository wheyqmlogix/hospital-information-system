"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Check, ShieldCheck, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CaseRate {
  id: string;
  code: string;
  description: string;
  itemType: string;
  hciAmount: number;
  hcpAmount: number;
  totalAmount: number;
}

interface CaseRateSelectorProps {
  onSelect: (caseRate: CaseRate) => void;
  selectedId?: string;
}

export function CaseRateSelector({ onSelect, selectedId }: CaseRateSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CaseRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState<CaseRate | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/reference/case-rates?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRates, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (rate: CaseRate) => {
    setSelectedRate(rate);
    onSelect(rate);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Registry Search (ICD-10 / RVS Code or Descriptor)..."
          className="pl-10 h-10 border-slate-200 focus:border-[#0f172a] focus:bg-white bg-slate-50/50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0f172a]" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <Card className="border-slate-300 shadow-2xl rounded-sm overflow-hidden absolute z-50 w-full max-w-lg mt-1 bg-white">
          <CardContent className="p-0 max-h-[350px] overflow-y-auto">
            {results.map((rate) => (
              <button
                key={rate.id}
                onClick={() => handleSelect(rate)}
                className="w-full text-left p-4 hover:bg-[#fcfcfc] border-b border-slate-100 last:border-0 transition-colors flex items-start justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded-[1px] border uppercase tracking-widest",
                      rate.itemType === "ICD" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {rate.itemType}
                    </span>
                    <span className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{rate.code}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight line-clamp-2">{rate.description}</p>
                </div>
                <div className="text-right ml-6">
                  <p className="text-[11px] font-black text-[#0f172a] tracking-tighter">₱{Number(rate.totalAmount).toLocaleString()}</p>
                  <div className="h-6 w-6 rounded-[1px] bg-slate-900 text-white items-center justify-center hidden group-hover:flex mt-2">
                    <Check className="h-3 w-3" />
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedRate && (
        <div className="bg-white border border-slate-200 rounded-sm p-5 flex items-start gap-5 animate-in fade-in duration-300 shadow-sm">
          <div className="h-9 w-9 rounded-[1px] bg-slate-50 border border-slate-100 text-[#0f172a] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[8px] font-black bg-[#0f172a] text-white px-2 py-0.5 rounded-[1px] uppercase tracking-widest">Active Classification</span>
               <span className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{selectedRate.code}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight mb-4 leading-relaxed">{selectedRate.description}</p>
            
            <div className="grid grid-cols-3 gap-0 border border-slate-100 divide-x divide-slate-100 rounded-sm overflow-hidden">
               <div className="bg-slate-50/50 p-3 text-center">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">HCI Cap</p>
                  <p className="text-[10px] font-black text-[#0f172a] tracking-tighter">₱{Number(selectedRate.hciAmount).toLocaleString()}</p>
               </div>
               <div className="bg-slate-50/50 p-3 text-center">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">HCP Cap</p>
                  <p className="text-[10px] font-black text-[#0f172a] tracking-tighter">₱{Number(selectedRate.hcpAmount).toLocaleString()}</p>
               </div>
               <div className="bg-[#0f172a] p-3 text-center">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Institutional Benefit</p>
                  <p className="text-[10px] font-black text-white tracking-tighter">₱{Number(selectedRate.totalAmount).toLocaleString()}</p>
               </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-3 rounded-[1px] border border-slate-200 text-slate-400 hover:text-[#0f172a] text-[8px] font-black uppercase tracking-widest"
            onClick={() => setSelectedRate(null)}
          >
            Modify
          </Button>
        </div>
      )}
      
      {!selectedRate && !query && (
        <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest p-2">
           <Info className="h-3 w-3" />
           Benefit computation is dependent on official ICD-10/RVS categorization.
        </div>
      )}
    </div>
  );
}
