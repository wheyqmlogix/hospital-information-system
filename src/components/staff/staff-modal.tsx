"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  X, 
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
import { toast } from "sonner";

const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "BILLING", "PHARMACY", "LABORATORY"]),
  departmentId: z.string().optional(),
  specialization: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: any[];
}

export function StaffModal({ isOpen, onClose, onSuccess, departments }: StaffModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: "NURSE"
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: StaffFormValues) => {
    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create staff member");
      }

      toast.success("Staff member created successfully");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Staff Member</h2>
            <p className="text-xs text-slate-500 font-medium">Register a new personnel and create their system account.</p>
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
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <User className="h-4 w-4 mr-2 text-slate-400" />
                First Name
              </label>
              <Input {...register("firstName")} placeholder="e.g. Juan" />
              {errors.firstName && <p className="text-xs text-red-500 font-medium">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <User className="h-4 w-4 mr-2 text-slate-400" />
                Last Name
              </label>
              <Input {...register("lastName")} placeholder="e.g. Dela Cruz" />
              {errors.lastName && <p className="text-xs text-red-500 font-medium">{errors.lastName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                Email Address
              </label>
              <Input {...register("email")} type="email" placeholder="juan.dc@hospital.com" />
              {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-slate-400" />
                Password
              </label>
              <Input {...register("password")} type="password" placeholder="••••••••" />
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-slate-400" />
                System Role
              </label>
              <Select onValueChange={(val: any) => setValue("role", val)} defaultValue="NURSE">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="NURSE">Nurse</SelectItem>
                  <SelectItem value="BILLING">Billing Clerk</SelectItem>
                  <SelectItem value="PHARMACY">Pharmacist</SelectItem>
                  <SelectItem value="LABORATORY">Lab Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Building className="h-4 w-4 mr-2 text-slate-400" />
                Department
              </label>
              <Select onValueChange={(val) => setValue("departmentId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <Stethoscope className="h-4 w-4 mr-2 text-slate-400" />
                Specialization (Optional)
              </label>
              <Input {...register("specialization")} placeholder="e.g. Pediatrics, Cardiology, ER Medicine" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Register Staff Member"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
