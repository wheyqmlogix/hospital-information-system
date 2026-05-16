"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Building, 
  Tag, 
  FileText, 
  MapPin 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  code: z.string().min(2, "Code is required").max(10).toUpperCase(),
  description: z.string().optional(),
  location: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function DepartmentForm({ onSuccess, onCancel }: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
  });

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
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <Building className="h-3 w-3 mr-2" />
            Department Name
          </Label>
          <Input {...register("name")} placeholder="e.g. Cardiology Unit" className="h-9 text-[11px] font-bold uppercase" />
          {errors.name && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <Tag className="h-3 w-3 mr-2" />
            Short Code
          </Label>
          <Input {...register("code")} placeholder="e.g. CARD" className="h-9 text-[11px] font-bold uppercase" />
          {errors.code && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.code.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <MapPin className="h-3 w-3 mr-2" />
            Location
          </Label>
          <Input {...register("location")} placeholder="e.g. 3rd Floor, Bldg B" className="h-9 text-[11px] font-bold uppercase" />
          {errors.location && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.location.message}</p>}
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <FileText className="h-3 w-3 mr-2" />
            Description (Optional)
          </Label>
          <textarea 
            {...register("description")} 
            placeholder="Briefly describe the department's function..."
            className="w-full min-h-[100px] p-4 rounded-sm border border-slate-200 bg-slate-50/30 focus:border-[#0f172a] focus:ring-0 text-[11px] font-bold uppercase tracking-tight transition-all outline-none"
          />
          {errors.description && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.description.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="text-[10px] font-black uppercase tracking-widest">
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-[#0f172a] text-white px-8 text-[10px] font-black uppercase tracking-widest h-10 shadow-sm" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Create Department"}
        </Button>
      </div>
    </form>
  );
}
