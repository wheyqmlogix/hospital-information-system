"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { addToSyncQueue } from "@/lib/offline/sync-queue";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PatientForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      nationality: "Filipino",
      civilStatus: "SINGLE",
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    const patientData = {
      ...data,
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`, // Improved Temp ID
      status: "OUTPATIENT",
    };

    if (!navigator.onLine) {
      await addToSyncQueue("CREATE_PATIENT", patientData);
      toast.success("Saved locally. Will sync when online.");
      onOpenChange(false);
      reset();
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        body: JSON.stringify(patientData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Patient record created successfully.");
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        onOpenChange(false);
        reset();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create patient.");
      }
    } catch (error) {
      toast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Register New Patient</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="id">IDs & Other</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...register("firstName", { required: true })} placeholder="Juan" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...register("lastName", { required: true })} placeholder="Dela Cruz" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name (Optional)</Label>
                  <Input id="middleName" {...register("middleName")} placeholder="Santos" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth", { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setValue("gender", value as any)}>
                      <SelectTrigger>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="civilStatus">Civil Status</Label>
                    <Select defaultValue="SINGLE" onValueChange={(value) => setValue("civilStatus", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="MARRIED">Married</SelectItem>
                        <SelectItem value="WIDOWED">Widowed</SelectItem>
                        <SelectItem value="SEPARATED">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select onValueChange={(value) => setValue("bloodType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="address">Street / House No.</Label>
                  <Input id="address" {...register("address")} placeholder="123 Mabini St." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input id="barangay" {...register("barangay")} placeholder="Brgy. 123" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City / Municipality</Label>
                    <Input id="city" {...register("city")} placeholder="Quezon City" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input id="province" {...register("province")} placeholder="Metro Manila" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" {...register("zipCode")} placeholder="1100" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-slate-500 text-xs uppercase font-bold">Contact Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input id="mobileNumber" {...register("mobileNumber")} placeholder="0917XXXXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input id="email" type="email" {...register("email")} placeholder="juan@example.com" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="id" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="philHealthId">PhilHealth ID</Label>
                  <Input id="philHealthId" {...register("philHealthId")} placeholder="12-345678901-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID (PhilSys)</Label>
                    <Input id="nationalId" {...register("nationalId")} placeholder="XXXX-XXXX-XXXX-XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seniorCitizenId">Senior Citizen ID</Label>
                    <Input id="seniorCitizenId" {...register("seniorCitizenId")} placeholder="SC-XXXXXX" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pwdId">PWD ID</Label>
                    <Input id="pwdId" {...register("pwdId")} placeholder="PWD-XXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" {...register("nationality")} placeholder="Filipino" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input id="religion" {...register("religion")} placeholder="Roman Catholic" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" {...register("occupation")} placeholder="Teacher" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="p-6 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Registering..." : "Register Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
