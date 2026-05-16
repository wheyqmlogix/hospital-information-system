"use client";

import React from "react";
import { 
  X, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm Action", 
  cancelText = "Cancel",
  variant = "primary"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-sm flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#0f172a]/10 text-[#0f172a]'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">{title}</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">System Confirmation Required</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50/30 border-t border-slate-100">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest h-9 px-6"
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0f172a] hover:bg-black'} text-white text-[10px] font-black uppercase tracking-widest h-9 px-8 rounded-sm shadow-sm transition-all`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
