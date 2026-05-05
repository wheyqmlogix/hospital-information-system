"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Save, Loader2, User, MapPin, CreditCard } from "lucide-react";

interface PatientFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

export function PatientForm({ initialData, onSubmit, loading, onCancel }: PatientFormProps) {
  const { register, handleSubmit, setValue } = useForm<any>({
    defaultValues: initialData || {
      nationality: "Filipino",
      civilStatus: "SINGLE",
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-12">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName", { required: true })} placeholder="Juan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName", { required: true })} placeholder="Dela Cruz" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <Input id="middleName" {...register("middleName")} placeholder="Santos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                defaultValue={initialData?.gender} 
                onValueChange={(value) => setValue("gender", value as any)}
              >
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
            <div className="space-y-2">
              <Label htmlFor="civilStatus">Civil Status</Label>
              <Select 
                defaultValue={initialData?.civilStatus || "SINGLE"} 
                onValueChange={(value) => setValue("civilStatus", value)}
              >
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
              <Select 
                defaultValue={initialData?.bloodType} 
                onValueChange={(value) => setValue("bloodType", value)}
              >
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
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" {...register("nationality")} placeholder="Filipino" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="religion">Religion</Label>
              <Input id="religion" {...register("religion")} placeholder="Roman Catholic" />
            </div>
          </div>
        </div>

        {/* Contact & Address Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Contact & Address</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input id="mobileNumber" {...register("mobileNumber")} placeholder="0917XXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register("email")} placeholder="juan@example.com" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Street / House No.</Label>
            <Input id="address" {...register("address")} placeholder="123 Mabini St." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="barangay">Barangay</Label>
              <Input id="barangay" {...register("barangay")} placeholder="Brgy. 123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City / Municipality</Label>
              <Input id="city" {...register("city")} placeholder="Quezon City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input id="province" {...register("province")} placeholder="Metro Manila" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input id="zipCode" {...register("zipCode")} placeholder="1100" />
            </div>
          </div>
        </div>

        {/* Identification & IDs Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Identification & IDs</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="philHealthId">PhilHealth ID</Label>
              <Input id="philHealthId" {...register("philHealthId")} placeholder="12-345678901-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID (PhilSys)</Label>
              <Input id="nationalId" {...register("nationalId")} placeholder="XXXX-XXXX-XXXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seniorCitizenId">Senior Citizen ID</Label>
              <Input id="seniorCitizenId" {...register("seniorCitizenId")} placeholder="SC-XXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwdId">PWD ID</Label>
              <Input id="pwdId" {...register("pwdId")} placeholder="PWD-XXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" {...register("occupation")} placeholder="Teacher" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-12 pt-8 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[150px]" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Patient Record
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
