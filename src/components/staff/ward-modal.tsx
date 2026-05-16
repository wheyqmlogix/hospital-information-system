"use client";

import React, { useState, useEffect } from "react";
import { X, Map, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface WardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

export function WardModal({ isOpen, onClose, onSuccess, initialData }: WardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = initialData ? `/api/admin/wards/${initialData.id}` : "/api/admin/wards";
      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save ward");
      }

      toast.success(`Ward ${initialData ? "updated" : "provisioned"} successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-sm bg-[#0f172a] text-white flex items-center justify-center">
              <Map className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">
                {initialData ? "Modify Ward Specification" : "Provision New Ward"}
              </h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Facility Infrastructure Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
              <Map className="h-3 w-3 mr-2" />
              Ward Name
            </Label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Intensive Care Unit" 
              className="h-9 text-[11px] font-bold uppercase"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
              <FileText className="h-3 w-3 mr-2" />
              Description (Optional)
            </Label>
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Critical care and advanced monitoring." 
              className="h-9 text-[11px] font-bold uppercase"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="text-[10px] font-black uppercase tracking-widest">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#0f172a] text-white px-8 text-[10px] font-black uppercase tracking-widest h-10 shadow-sm"
            >
              {isSubmitting ? "Processing..." : initialData ? "Update Ward" : "Provision Ward"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
