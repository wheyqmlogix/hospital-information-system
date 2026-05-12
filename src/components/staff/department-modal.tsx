"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  X, 
  Building, 
  Tag, 
  FileText, 
  MapPin 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  code: z.string().min(2, "Code is required").max(10).toUpperCase(),
  description: z.string().optional(),
  location: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DepartmentModal({ isOpen, onClose, onSuccess }: DepartmentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      const response = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create department");
      }

      toast.success("Department created successfully");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Department</h2>
            <p className="text-xs text-slate-500 font-medium">Define a new hospital department or medical unit.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Building className="h-4 w-4 mr-2 text-slate-400" />
                Department Name
              </label>
              <Input {...register("name")} placeholder="e.g. Cardiology Unit" />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-slate-400" />
                Short Code
              </label>
              <Input {...register("code")} placeholder="e.g. CARD" />
              {errors.code && <p className="text-xs text-red-500 font-medium">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                Location
              </label>
              <Input {...register("location")} placeholder="e.g. 3rd Floor, Bldg B" />
              {errors.location && <p className="text-xs text-red-500 font-medium">{errors.location.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                Description (Optional)
              </label>
              <textarea 
                {...register("description")} 
                placeholder="Briefly describe the department's function..."
                className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Department"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
