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
    <div className="max-w-5xl mx-auto pb-12">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-sm flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-widest">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Section 1: Demographics */}
            <Card className="border-slate-200 shadow-sm rounded-md overflow-hidden bg-white">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
                 <div className="h-6 w-6 bg-clinical-primary/10 rounded-sm flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-clinical-primary" />
                 </div>
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Patient Demographics</h2>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</Label>
                    <Input id="firstName" {...form.register("firstName")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                    {form.formState.errors.firstName && (
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</Label>
                    <Input id="lastName" {...form.register("lastName")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                    {form.formState.errors.lastName && (
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="middleName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Middle Name</Label>
                    <Input id="middleName" {...form.register("middleName")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="extensionName" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Extension</Label>
                    <Input id="extensionName" {...form.register("extensionName")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" placeholder="Jr, III, etc." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold uppercase" />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</Label>
                    <Select onValueChange={(val) => form.setValue("gender", val as "MALE" | "FEMALE" | "OTHER")} defaultValue={form.getValues("gender")}>
                      <SelectTrigger className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm shadow-lg border-slate-200">
                        <SelectItem value="MALE" className="text-xs font-bold uppercase">Male</SelectItem>
                        <SelectItem value="FEMALE" className="text-xs font-bold uppercase">Female</SelectItem>
                        <SelectItem value="OTHER" className="text-xs font-bold uppercase">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Address */}
            <Card className="border-slate-200 shadow-sm rounded-md overflow-hidden bg-white">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
                 <div className="h-6 w-6 bg-clinical-primary/10 rounded-sm flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-clinical-primary" />
                 </div>
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Residential Address</h2>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="province" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Province</Label>
                    <Input id="province" {...form.register("province")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                    {form.formState.errors.province && (
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{form.formState.errors.province.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-slate-400">City / Municipality</Label>
                    <Input id="city" {...form.register("city")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                    {form.formState.errors.city && (
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="barangay" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Barangay</Label>
                    <Input id="barangay" {...form.register("barangay")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                    {form.formState.errors.barangay && (
                      <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{form.formState.errors.barangay.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zipCode" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zip Code</Label>
                    <Input id="zipCode" {...form.register("zipCode")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Identifiers & Consent */}
          <div className="space-y-6">
            {/* Section 3: Identifiers */}
            <Card className="border-slate-200 shadow-sm rounded-md overflow-hidden bg-white">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
                 <div className="h-6 w-6 bg-clinical-primary/10 rounded-sm flex items-center justify-center">
                    <Fingerprint className="h-3.5 w-3.5 text-clinical-primary" />
                 </div>
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Identifiers</h2>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="philHealthPIN" className="text-[10px] font-black uppercase tracking-widest text-slate-400">PhilHealth PIN</Label>
                  <Input id="philHealthPIN" placeholder="XX-XXXXXXXXX-X" {...form.register("philHealthPIN")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                  {form.formState.errors.philHealthPIN && (
                    <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{form.formState.errors.philHealthPIN.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nationalId" className="text-[10px] font-black uppercase tracking-widest text-slate-400">National ID</Label>
                  <Input id="nationalId" {...form.register("nationalId")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seniorId" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senior ID</Label>
                  <Input id="seniorId" {...form.register("seniorId")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pwdId" className="text-[10px] font-black uppercase tracking-widest text-slate-400">PWD ID</Label>
                  <Input id="pwdId" {...form.register("pwdId")} className="h-9 rounded-sm bg-slate-50 focus:bg-white text-xs font-bold" />
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Consent & Save */}
            <div className="space-y-4">
               <div className="p-4 bg-white border border-clinical-primary/20 rounded-md shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-clinical-primary" />
                      <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">RA 10173 Compliance</h3>
                  </div>
                  <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-sm border border-slate-100">
                    <Checkbox 
                      id="dpaConsent" 
                      className="mt-0.5 border-slate-300 data-[state=checked]:bg-clinical-primary data-[state=checked]:border-clinical-primary"
                      onCheckedChange={(checked) => form.setValue("dpaConsent", checked === true)}
                      checked={form.watch("dpaConsent")}
                    />
                    <Label htmlFor="dpaConsent" className="text-[10px] font-bold cursor-pointer leading-tight text-slate-600 uppercase tracking-tight">
                      I confirm patient consent has been formally obtained.
                    </Label>
                  </div>
                  {form.formState.errors.dpaConsent && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse">Action Required: Consent Mandatory</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-clinical-primary text-white hover:bg-clinical-primary-dark h-10 rounded-sm font-black uppercase tracking-widest text-[10px] shadow-sm transition-all"
                  >
                    {isSubmitting ? "Processing..." : (
                      <span className="flex items-center gap-2">
                        <Save className="h-3.5 w-3.5" />
                        Complete Registration
                      </span>
                    )}
                  </Button>
               </div>

               <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                     <Info className="h-3.5 w-3.5" />
                     <span className="text-[9px] font-black uppercase tracking-widest">System Protocol</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter">
                     All demographics must be validated against official government ID before final submission.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
