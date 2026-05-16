"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Building, 
  Stethoscope 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "BILLING", "PHARMACY", "LABORATORY"]),
  departmentId: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  departments: any[];
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    specialization?: string | null;
    departmentId?: string | null;
    user?: {
      email: string;
    } | null;
  };
}

export function StaffForm({ onSuccess, onCancel, departments, initialData }: StaffFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.user?.email || "",
      role: initialData.role as any,
      departmentId: initialData.departmentId || undefined,
      specialization: initialData.specialization || "",
      password: "",
    } : {
      role: "NURSE"
    }
  });

  const onSubmit = async (data: StaffFormValues) => {
    try {
      const url = initialData 
        ? `/api/admin/staff/${initialData.id}`
        : "/api/admin/staff";
      
      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${initialData ? "update" : "create"} staff member`);
      }

      toast.success(`Staff member ${initialData ? "updated" : "created"} successfully`);
      if (!initialData) reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <User className="h-3 w-3 mr-2" />
            First Name
          </Label>
          <Input {...register("firstName")} placeholder="e.g. Juan" className="h-9 text-[11px] font-bold uppercase" />
          {errors.firstName && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <User className="h-3 w-3 mr-2" />
            Last Name
          </Label>
          <Input {...register("lastName")} placeholder="e.g. Dela Cruz" className="h-9 text-[11px] font-bold uppercase" />
          {errors.lastName && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.lastName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <Mail className="h-3 w-3 mr-2" />
            Email Address
          </Label>
          <Input {...register("email")} type="email" placeholder="juan.dc@hospital.com" className="h-9 text-[11px] font-bold" />
          {errors.email && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <Lock className="h-3 w-3 mr-2" />
            {initialData ? "New Password (Leave blank to keep current)" : "Password"}
          </Label>
          <Input {...register("password")} type="password" placeholder="••••••••" className="h-9 text-[11px] font-bold" />
          {errors.password && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <Shield className="h-3 w-3 mr-2" />
            System Role
          </Label>
          <Select onValueChange={(val: any) => setValue("role", val)} defaultValue={initialData?.role || "NURSE"}>
            <SelectTrigger className="h-9 text-[11px] font-bold uppercase">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="rounded-sm shadow-xl border-slate-200">
              <SelectItem value="ADMIN" className="text-[10px] font-bold uppercase">Administrator</SelectItem>
              <SelectItem value="DOCTOR" className="text-[10px] font-bold uppercase">Doctor</SelectItem>
              <SelectItem value="NURSE" className="text-[10px] font-bold uppercase">Nurse</SelectItem>
              <SelectItem value="BILLING" className="text-[10px] font-bold uppercase">Billing Clerk</SelectItem>
              <SelectItem value="PHARMACY" className="text-[10px] font-bold uppercase">Pharmacist</SelectItem>
              <SelectItem value="LABORATORY" className="text-[10px] font-bold uppercase">Lab Technician</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <Building className="h-3 w-3 mr-2" />
            Department
          </Label>
          <Select onValueChange={(val) => setValue("departmentId", val)} defaultValue={initialData?.departmentId || undefined}>
            <SelectTrigger className="h-9 text-[11px] font-bold uppercase">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="rounded-sm shadow-xl border-slate-200">
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id} className="text-[10px] font-bold uppercase">
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
            <Stethoscope className="h-3 w-3 mr-2" />
            Specialization (Optional)
          </Label>
          <Input {...register("specialization")} placeholder="e.g. Pediatrics, Cardiology, ER Medicine" className="h-9 text-[11px] font-bold uppercase" />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="text-[10px] font-black uppercase tracking-widest">
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-[#0f172a] text-white px-8 text-[10px] font-black uppercase tracking-widest h-10 shadow-sm" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : initialData ? "Update Staff Profile" : "Register Staff Member"}
        </Button>
      </div>
    </form>
  );
}
