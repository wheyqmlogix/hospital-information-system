"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus, Shield, Loader2, Save } from "lucide-react";

interface ProvisionFormData {
  name: string;
  email: string;
  password?: string;
  roleName: string;
  departmentName: string;
  licenseNumber?: string;
  specialization?: string;
}

export default function NewStaffPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch } = useForm<ProvisionFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleName: "",
      departmentName: "",
      licenseNumber: "",
      specialization: "",
    }
  });

  const selectedRole = watch("roleName");

  const onSubmit = async (data: ProvisionFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Staff account provisioned successfully.");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        router.push("/staff");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to provision user.");
      }
    } catch {
      toast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Provision New Staff</h1>
          <p className="text-slate-500">Assign a clinical or administrative role to a new employee.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <CardTitle>Staff Details</CardTitle>
              </div>
              <div className="text-sm font-medium text-slate-400">
                Step {step} of 3
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register("name", { required: true })} placeholder="Dr. Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" {...register("email", { required: true })} placeholder="jane@carepoint.his" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Initial Password</Label>
                  <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
                  <p className="text-[10px] text-slate-400 italic">Leave blank to use default: CarePoint@2026</p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="button" className="min-w-[120px]" onClick={nextStep}>
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>Clinical/Staff Role</Label>
                  <Select onValueChange={(val) => setValue("roleName", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                      <SelectItem value="Doctor">Doctor</SelectItem>
                      <SelectItem value="Nurse">Nurse</SelectItem>
                      <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="Billing Staff">Billing Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Department</Label>
                  <Select onValueChange={(val) => setValue("departmentName", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency Room (ER)">Emergency Room</SelectItem>
                      <SelectItem value="Outpatient Department (OPD)">Outpatient (OPD)</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                  <Button type="button" className="min-w-[120px]" onClick={nextStep} disabled={!selectedRole}>
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {["Doctor", "Nurse"].includes(selectedRole) ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">PRC License Number</Label>
                      <Input id="licenseNumber" {...register("licenseNumber", { required: true })} placeholder="XXXXXXX" />
                      <p className="text-[10px] text-red-500 italic">Mandatory for clinical practitioners.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input id="specialization" {...register("specialization")} placeholder="e.g. Cardiology" />
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Shield className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No additional clinical details required for this role.</p>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[150px]" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Provisioning...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Complete Provisioning
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
