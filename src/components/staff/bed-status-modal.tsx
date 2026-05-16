"use client";

import React, { useState, useEffect } from "react";
import { X, Settings2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BedStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bed: {
    id: string;
    name: string;
    status: string;
  } | null;
}

export function BedStatusModal({ isOpen, onClose, onSuccess, bed }: BedStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    if (bed) {
      setSelectedStatus(bed.status);
    }
  }, [bed]);

  if (!isOpen || !bed) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/beds/${bed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus })
      });

      if (res.ok) {
        toast.success(`Bed ${bed.name} status updated to ${selectedStatus}`);
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "VACANT", label: "Available / Vacant", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
    { value: "MAINTENANCE", label: "Under Maintenance", color: "text-amber-600", bg: "bg-amber-50", icon: Settings2 },
    { value: "CLEANING", label: "Sanitization Pending", color: "text-blue-600", bg: "bg-blue-50", icon: AlertTriangle },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-[#0f172a]/10 text-[#0f172a] flex items-center justify-center">
              <Settings2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">Bed Status Override</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Facility Unit: {bed.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Operational Status</p>
          <div className="space-y-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-sm border transition-all text-left group",
                    isSelected 
                      ? "bg-[#0f172a] border-[#0f172a] text-white shadow-md" 
                      : "bg-white border-slate-100 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-sm flex items-center justify-center",
                      isSelected ? "bg-white/10" : option.bg,
                      isSelected ? "text-white" : option.color
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-sm flex gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider leading-relaxed">
              Caution: Changing a bed's status to Maintenance or Cleaning will prevent new clinical admissions to this unit.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50/30 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="text-[10px] font-black uppercase tracking-widest">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || selectedStatus === bed.status}
            className="bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest px-8 shadow-sm"
          >
            {loading ? "Syncing..." : "Update Facility Status"}
          </Button>
        </div>
      </div>
    </div>
  );
}
