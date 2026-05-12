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

  // If selectedId changes, we might want to fetch it, but for now we assume it's handled by parent
  // In a real app, we'd fetch the initial selected rate details if only ID is provided

  const handleSelect = (rate: CaseRate) => {
    setSelectedRate(rate);
    onSelect(rate);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search ICD-10 or RVS code/description..."
          className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <Card className="border-slate-100 shadow-xl rounded-2xl overflow-hidden absolute z-50 w-full max-w-md mt-1">
          <CardContent className="p-0 max-h-[300px] overflow-y-auto">
            {results.map((rate) => (
              <button
                key={rate.id}
                onClick={() => handleSelect(rate)}
                className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-start justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] font-black px-1.5 py-0.5 rounded",
                      rate.itemType === "ICD" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {rate.itemType}
                    </span>
                    <span className="font-bold text-slate-900">{rate.code}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{rate.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs font-black text-slate-900">₱{Number(rate.totalAmount).toLocaleString()}</p>
                  <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 items-center justify-center hidden group-hover:flex mt-1">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedRate && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase">Selected Case Rate</span>
               <span className="font-bold text-blue-900">{selectedRate.code}</span>
            </div>
            <p className="text-sm font-medium text-blue-800 mb-3">{selectedRate.description}</p>
            
            <div className="grid grid-cols-3 gap-2">
               <div className="bg-white/50 p-2 rounded-lg">
                  <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">HCI Amount</p>
                  <p className="text-xs font-black text-blue-900">₱{Number(selectedRate.hciAmount).toLocaleString()}</p>
               </div>
               <div className="bg-white/50 p-2 rounded-lg">
                  <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">HCP Amount</p>
                  <p className="text-xs font-black text-blue-900">₱{Number(selectedRate.hcpAmount).toLocaleString()}</p>
               </div>
               <div className="bg-white/50 p-2 rounded-lg border border-blue-200">
                  <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">Total Benefit</p>
                  <p className="text-xs font-black text-blue-600">₱{Number(selectedRate.totalAmount).toLocaleString()}</p>
               </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-400 hover:text-blue-600"
            onClick={() => setSelectedRate(null)}
          >
            Change
          </Button>
        </div>
      )}
      
      {!selectedRate && !query && (
        <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
           <Info className="h-3 w-3" />
           PhilHealth benefits are calculated based on the primary diagnosis code.
        </div>
      )}
    </div>
  );
}
