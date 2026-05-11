"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  MapPin,
  User,
  Fingerprint
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

const steps = [
  { id: 1, title: "Identifiers", icon: Fingerprint },
  { id: 2, title: "Demographics", icon: User },
  { id: 3, title: "Geography", icon: MapPin },
  { id: 4, title: "Consent", icon: ShieldCheck },
];

export function PatientForm() {
  const [step, setStep] = useState(1);
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

  const nextStep = async () => {
    let fieldsToValidate: (keyof PatientFormValues)[] = [];
    if (step === 1) fieldsToValidate = ["philHealthPIN", "nationalId", "seniorId", "pwdId"];
    if (step === 2) fieldsToValidate = ["firstName", "lastName", "dateOfBirth", "gender"];
    if (step === 3) fieldsToValidate = ["province", "city", "barangay"];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center group">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4",
                  isActive ? "bg-blue-600 border-blue-100 scale-110 shadow-lg shadow-blue-100" : 
                  isCompleted ? "bg-green-500 border-green-50 text-white" : 
                  "bg-white border-slate-50 text-slate-400"
                )}>
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className={cn("h-6 w-6", isActive ? "text-white" : "text-slate-400")} />}
                </div>
                <span className={cn(
                  "absolute -bottom-8 text-[10px] font-bold uppercase tracking-widest transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400"
                )}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardContent className="p-8 md:p-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Identifiers */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Primary Identifiers</h2>
                  <p className="text-slate-500">National and PH-specific identification numbers.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="philHealthPIN">PhilHealth PIN</Label>
                    <Input 
                      id="philHealthPIN" 
                      placeholder="XX-XXXXXXXXX-X" 
                      {...form.register("philHealthPIN")} 
                      className="h-12 rounded-xl"
                    />
                    {form.formState.errors.philHealthPIN && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.philHealthPIN.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID (PhilSys)</Label>
                    <Input id="nationalId" {...form.register("nationalId")} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seniorId">Senior Citizen ID</Label>
                    <Input id="seniorId" {...form.register("seniorId")} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pwdId">PWD ID</Label>
                    <Input id="pwdId" {...form.register("pwdId")} className="h-12 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Demographics */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Patient Demographics</h2>
                  <p className="text-slate-500">Basic personal information as per official records.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...form.register("firstName")} className="h-12 rounded-xl" />
                    {form.formState.errors.firstName && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" {...form.register("middleName")} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...form.register("lastName")} className="h-12 rounded-xl" />
                    {form.formState.errors.lastName && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extensionName">Extension (e.g. Jr, III)</Label>
                    <Input id="extensionName" {...form.register("extensionName")} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} className="h-12 rounded-xl" />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(val) => form.setValue("gender", val as "MALE" | "FEMALE" | "OTHER")} defaultValue={form.getValues("gender")}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Geography */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Philippine Geographic Hub</h2>
                  <p className="text-slate-500">Accurate residential address mapping.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input id="province" {...form.register("province")} className="h-12 rounded-xl" placeholder="e.g. Cavite" />
                    {form.formState.errors.province && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.province.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City / Municipality</Label>
                    <Input id="city" {...form.register("city")} className="h-12 rounded-xl" placeholder="e.g. Dasmariñas" />
                    {form.formState.errors.city && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input id="barangay" {...form.register("barangay")} className="h-12 rounded-xl" placeholder="e.g. Burol I" />
                    {form.formState.errors.barangay && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.barangay.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" {...form.register("zipCode")} className="h-12 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Consent */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">Data Privacy Act (DPA)</h2>
                  <p className="text-slate-500">Finalize registration and capture consent.</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-100 space-y-4">
                   <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
                      <ShieldCheck className="h-6 w-6" />
                   </div>
                   <h3 className="font-bold text-slate-900">Compliance Statement</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">
                     By checking the box below, you confirm that the patient (or their legal guardian) 
                     has been informed about the collection, processing, and storage of their personal 
                     and health information in accordance with the <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>.
                   </p>
                   
                   <div className="pt-4 flex items-start space-x-3">
                      <Checkbox 
                        id="dpaConsent" 
                        onCheckedChange={(checked) => form.setValue("dpaConsent", checked === true)}
                        checked={form.watch("dpaConsent")}
                      />
                      <Label htmlFor="dpaConsent" className="text-sm font-bold text-slate-900 cursor-pointer leading-tight">
                        I hereby certify that informed consent has been obtained from the patient.
                      </Label>
                   </div>
                   {form.formState.errors.dpaConsent && (
                      <p className="text-xs text-red-500 font-medium pl-8">{form.formState.errors.dpaConsent.message}</p>
                   )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={step === 1 || isSubmitting}
                className="rounded-xl px-6 h-12 font-bold text-slate-500"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-slate-200"
                >
                  Next Step
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-200"
                >
                  {isSubmitting ? "Processing..." : "Register Patient"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
