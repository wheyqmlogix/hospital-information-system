"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  MapPin,
  User,
  Fingerprint,
  Save,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const patientSchema = z.object({
  // Identifiers
  philHealthPIN: z.string().optional().refine(val => !val || /^\d{2}-\d{9}-\d{1}$/.test(val), {
    message: "Format must be XX-XXXXXXXXX-X"
  }),
  nationalId: z.string().optional(),
  seniorId: z.string().optional(),
  pwdId: z.string().optional(),
  
  // Demographics
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  extensionName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  
  // Address
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City/Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  zipCode: z.string().optional(),
  
  // Consent
  dpaConsent: z.boolean().refine(val => val === true, {
    message: "DPA consent is mandatory"
  })
});

type PatientFormValues = z.infer<typeof patientSchema>;

export function PatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "MALE",
      dpaConsent: false,
    },
    mode: "onChange"
  });

  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register patient");
      }

      const patient = await response.json();
      router.push(`/patients/${patient.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Demographics */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                 <User className="h-5 w-5 text-blue-600" />
                 <h2 className="font-bold text-slate-900 dark:text-white">Patient Demographics</h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</Label>
                    <Input id="firstName" {...form.register("firstName")} className="h-10 rounded-lg" />
                    {form.formState.errors.firstName && (
                      <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</Label>
                    <Input id="lastName" {...form.register("lastName")} className="h-10 rounded-lg" />
                    {form.formState.errors.lastName && (
                      <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="middleName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Middle Name</Label>
                    <Input id="middleName" {...form.register("middleName")} className="h-10 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="extensionName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Extension</Label>
                    <Input id="extensionName" {...form.register("extensionName")} className="h-10 rounded-lg" placeholder="Jr, III, etc." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} className="h-10 rounded-lg" />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</Label>
                    <Select onValueChange={(val) => form.setValue("gender", val as "MALE" | "FEMALE" | "OTHER")} defaultValue={form.getValues("gender")}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Address */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                 <MapPin className="h-5 w-5 text-emerald-600" />
                 <h2 className="font-bold text-slate-900 dark:text-white">Residential Address</h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="province" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Province</Label>
                    <Input id="province" {...form.register("province")} className="h-10 rounded-lg" />
                    {form.formState.errors.province && (
                      <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.province.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-slate-400">City / Municipality</Label>
                    <Input id="city" {...form.register("city")} className="h-10 rounded-lg" />
                    {form.formState.errors.city && (
                      <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="barangay" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Barangay</Label>
                    <Input id="barangay" {...form.register("barangay")} className="h-10 rounded-lg" />
                    {form.formState.errors.barangay && (
                      <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.barangay.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zipCode" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zip Code</Label>
                    <Input id="zipCode" {...form.register("zipCode")} className="h-10 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Identifiers & Consent */}
          <div className="space-y-8">
            {/* Section 3: Identifiers */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                 <Fingerprint className="h-5 w-5 text-amber-600" />
                 <h2 className="font-bold text-slate-900 dark:text-white">Identifiers</h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="philHealthPIN" className="text-[10px] font-black uppercase tracking-widest text-slate-400">PhilHealth PIN</Label>
                  <Input id="philHealthPIN" placeholder="XX-XXXXXXXXX-X" {...form.register("philHealthPIN")} className="h-10 rounded-lg" />
                  {form.formState.errors.philHealthPIN && (
                    <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.philHealthPIN.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nationalId" className="text-[10px] font-black uppercase tracking-widest text-slate-400">National ID</Label>
                  <Input id="nationalId" {...form.register("nationalId")} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seniorId" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senior ID</Label>
                  <Input id="seniorId" {...form.register("seniorId")} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pwdId" className="text-[10px] font-black uppercase tracking-widest text-slate-400">PWD ID</Label>
                  <Input id="pwdId" {...form.register("pwdId")} className="h-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Consent & Save */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-blue-600 text-white">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-5 w-5" />
                      <h3 className="font-bold">Data Consent</h3>
                   </div>
                   <p className="text-[11px] leading-relaxed opacity-90">
                     Confirm patient consent for processing medical data under RA 10173.
                   </p>
                </div>
                
                <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-xl border border-white/20">
                  <Checkbox 
                    id="dpaConsent" 
                    className="mt-1 border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                    onCheckedChange={(checked) => form.setValue("dpaConsent", checked === true)}
                    checked={form.watch("dpaConsent")}
                  />
                  <Label htmlFor="dpaConsent" className="text-[11px] font-bold cursor-pointer leading-tight">
                    Informed consent obtained.
                  </Label>
                </div>
                {form.formState.errors.dpaConsent && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 animate-pulse">Consent required</p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-900/20"
                >
                  {isSubmitting ? "Saving..." : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Register Patient
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Tip</span>
               </div>
               <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Fields with labels are mandatory. Pressing <kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm font-mono">Enter</kbd> will submit the form if all required fields are filled.
               </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
