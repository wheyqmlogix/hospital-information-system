"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createAdmission } from "@/app/api/admissions/actions";
import { 
  Loader2, 
  ShieldCheck, 
  CreditCard, 
  WifiOff, 
  Save, 
  User, 
  MapPin, 
  Stethoscope,
  Info,
  Phone,
  Activity,
  X
} from "lucide-react";
import { db } from "@/lib/offline/db";
import { useRouter } from "next/navigation";

const AdmissionSchema = z.object({
  admittingDiagnosis: z.string().min(3, "Diagnosis is too short"),
  admissionType: z.enum(["ROUTINE", "EMERGENCY", "URGENT", "MATERNITY"]),
  admissionSource: z.string().min(1, "Admission source is required"),
  physicians: z.array(z.object({
    physicianId: z.string().min(1, "Please select a physician"),
    name: z.string().optional(), // For UI display
    role: z.enum(["ATTENDING", "CONSULTANT", "RESIDENT"]),
    isPrimary: z.boolean(),
  })).min(1, "At least one physician is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  ward: z.string().optional(),
  guarantorName: z.string().optional(),
  guarantorRelation: z.string().optional(),
  guarantorPhone: z.string().optional(),
  isPhilHealthMember: z.boolean(),
  philHealthPIN: z.string().optional(),
  dpaConsent: z.boolean().refine(val => val === true, {
    message: "Data Privacy Act consent is mandatory."
  }),
  vitals: z.object({
    bloodPressure: z.string().optional(),
    temperature: z.coerce.number().optional(),
    heartRate: z.coerce.number().optional(),
    respiratoryRate: z.coerce.number().optional(),
    oxygenSaturation: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
  }).optional()
});

type AdmissionFormValues = z.infer<typeof AdmissionSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface Physician {
  id: string;
  name: string;
  specialization?: string | null;
}

interface AdmissionFormContentProps {
  patient: Patient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdmissionFormContent({ patient, onSuccess, onCancel }: AdmissionFormContentProps) {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const router = useRouter();

  // Physician Search State
  const [physicianSearch, setPhysicianSearch] = useState("");
  const [physicianResults, setPhysicianResults] = useState<Physician[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    getValues,
    formState: { errors },
    reset,
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(AdmissionSchema) as any,
    defaultValues: {
      admissionType: "ROUTINE",
      admissionSource: "OPD Referral",
      physicians: [{ physicianId: "", name: "", role: "ATTENDING", isPrimary: true }],
      isPhilHealthMember: false,
      dpaConsent: false,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "physicians",
  });

  const isPhilHealthMember = watch("isPhilHealthMember");
  const selectedRoomNumber = watch("roomNumber");

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, []);

  // Physician Search Debounce
  useEffect(() => {
    if (physicianSearch.length < 2) {
      setPhysicianResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users?search=${encodeURIComponent(physicianSearch)}&role=Doctor`);
        if (res.ok) {
          const data = await res.json();
          setPhysicianResults(data);
        }
      } catch (error) {
        console.error("Physician search failed", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [physicianSearch]);

  const handleAddPhysician = (physician: Physician) => {
    // Check if already added
    const currentPhysicians = getValues("physicians");
    if (currentPhysicians.some(p => p.physicianId === physician.id)) {
      toast.error("Physician already assigned.");
      return;
    }

    // If the first one is empty, replace it
    if (currentPhysicians.length === 1 && !currentPhysicians[0].physicianId) {
      update(0, {
        physicianId: physician.id,
        name: `Dr. ${physician.name}`,
        role: "ATTENDING",
        isPrimary: true
      });
    } else {
      append({ 
        physicianId: physician.id, 
        name: `Dr. ${physician.name}`,
        role: "CONSULTANT", 
        isPrimary: false 
      });
    }
    
    setPhysicianSearch("");
    setPhysicianResults([]);
  };

  const onSubmit = async (data: AdmissionFormValues) => {
    setLoading(true);

    // OFFLINE BRANCH
    if (!navigator.onLine) {
      try {
        await db.admissions.add({
          id: crypto.randomUUID(),
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          ...data,
          status: 'ADMITTED',
          dpaConsentTimestamp: Date.now(),
          createdAt: Date.now(),
        });
        
        toast.info("Admission saved locally.", {
          description: "No internet connection. Data will sync automatically when online.",
          icon: <WifiOff className="h-4 w-4 text-amber-500" />
        });
        
        if (onSuccess) onSuccess();
        reset();
      } catch (err) {
        toast.error("Failed to save offline.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ONLINE BRANCH
    try {
      const result = await createAdmission({
        ...data,
        patientId: patient.id,
      });

      if (result.success) {
        toast.success("Patient admitted successfully.");
        if (onSuccess) onSuccess();
        reset();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to admit patient.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-h-[70vh] overflow-y-auto px-1 pr-3">
      {/* Clinical Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
          <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
          Clinical Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="admittingDiagnosis">Admitting Diagnosis</Label>
            <Textarea
              id="admittingDiagnosis"
              placeholder="Initial clinical impression..."
              {...register("admittingDiagnosis")}
              className={errors.admittingDiagnosis ? "border-red-500" : ""}
            />
            {errors.admittingDiagnosis && (
              <p className="text-xs text-red-500">{errors.admittingDiagnosis.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Admission Type</Label>
            <Select 
              onValueChange={(val: string | null) => val && setValue("admissionType", val as any)}
              defaultValue="ROUTINE"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROUTINE">Routine</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="MATERNITY">Maternity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admissionSource">Source of Admission</Label>
            <Input 
              id="admissionSource" 
              placeholder="e.g. ER, OPD, Direct" 
              {...register("admissionSource")} 
            />
          </div>

          <div className="space-y-4 md:col-span-2 pt-2 border-t border-slate-100/50">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center">
                <User className="h-4 w-4 mr-2 text-slate-400" />
                Assigned Physicians
              </Label>
              <div className="relative">
                <Input 
                  placeholder="Search doctor..." 
                  className="h-8 text-xs w-48"
                  value={physicianSearch}
                  onChange={(e) => setPhysicianSearch(e.target.value)}
                />
                {physicianResults.length > 0 && (
                  <div className="absolute top-full right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden w-64 max-h-48 overflow-y-auto">
                    {physicianResults.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        className="w-full text-left p-2 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                        onClick={() => handleAddPhysician(doc)}
                      >
                        <p className="text-sm font-bold text-slate-900">Dr. {doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.specialization || "General Practitioner"}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex-1">
                    <p className="text-sm font-bold">
                      {field.name || "Primary Physician"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Select 
                        defaultValue={field.role}
                        onValueChange={(v: string | null) => v && setValue(`physicians.${index}.role`, v as any)}
                      >
                        <SelectTrigger className="h-7 text-[10px] w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATTENDING">Attending</SelectItem>
                          <SelectItem value="CONSULTANT">Consultant</SelectItem>
                          <SelectItem value="RESIDENT">Resident</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center space-x-1">
                        <Checkbox 
                          id={`primary-${index}`}
                          checked={watch(`physicians.${index}.isPrimary`)}
                          onCheckedChange={() => {
                            fields.forEach((_, i) => setValue(`physicians.${i}.isPrimary`, i === index));
                          }}
                        />
                        <Label htmlFor={`primary-${index}`} className="text-[10px]">Primary</Label>
                      </div>
                    </div>
                  </div>
                  {index > 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.physicians && (
                <p className="text-xs text-red-500">{errors.physicians.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
          <Activity className="h-4 w-4 mr-2 text-red-600" />
          Initial Vitals (Optional)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bp">BP (mmHg)</Label>
            <Input id="bp" placeholder="120/80" {...register("vitals.bloodPressure")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temp">Temp (°C)</Label>
            <Input id="temp" type="number" step="0.1" placeholder="36.5" {...register("vitals.temperature")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hr">HR (bpm)</Label>
            <Input id="hr" type="number" placeholder="80" {...register("vitals.heartRate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rr">RR (cpm)</Label>
            <Input id="rr" type="number" placeholder="18" {...register("vitals.respiratoryRate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spo2">SpO2 (%)</Label>
            <Input id="spo2" type="number" placeholder="98" {...register("vitals.oxygenSaturation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" step="0.1" placeholder="60" {...register("vitals.weight")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" step="0.1" placeholder="170" {...register("vitals.height")} />
          </div>
        </div>
      </div>

      {/* Accommodation Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
          Accommodation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Room & Bed Assignment</Label>
            <Select 
              onValueChange={(val: string | null) => {
                if (!val) return;
                const room = rooms.find(r => r.roomNumber === val);
                setValue("roomNumber", val);
                if (room?.type) setValue("ward", room.type);
              }}
            >
              <SelectTrigger className={errors.roomNumber ? "border-red-500" : ""}>
                <SelectValue placeholder={loadingRooms ? "Loading rooms..." : "Select Room"} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => {
                  const availableBeds = room.beds?.filter((b: any) => b.status === "AVAILABLE").length || 0;
                  return (
                    <SelectItem 
                      key={room.id} 
                      value={room.roomNumber}
                      disabled={availableBeds === 0}
                    >
                      Room {room.roomNumber} ({room.type}) - {availableBeds} available
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.roomNumber && (
              <p className="text-xs text-red-500">{errors.roomNumber.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ward">Ward/Service</Label>
            <Input id="ward" placeholder="e.g. Medical-Surgical" {...register("ward")} />
          </div>
        </div>
      </div>

      {/* Guarantor Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
          <Info className="h-4 w-4 mr-2 text-blue-600" />
          Guarantor Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="guarantorName">Full Name</Label>
            <Input id="guarantorName" placeholder="Responsible party" {...register("guarantorName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guarantorRelation">Relationship</Label>
            <Input id="guarantorRelation" placeholder="e.g. Spouse, Parent" {...register("guarantorRelation")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guarantorPhone">Contact Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input id="guarantorPhone" className="pl-10" placeholder="09XX-XXX-XXXX" {...register("guarantorPhone")} />
            </div>
          </div>
        </div>
      </div>

      {/* PhilHealth & Consent Section */}
      <div className="space-y-6 pt-4 border-t border-slate-100">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="isPhilHealthMember" className="text-sm font-bold text-blue-900 cursor-pointer">
                  PhilHealth Membership
                </Label>
                <p className="text-xs text-blue-700">Check if patient is an active member/dependent.</p>
              </div>
            </div>
            <Checkbox
              id="isPhilHealthMember"
              checked={isPhilHealthMember}
              onCheckedChange={(checked) => setValue("isPhilHealthMember", checked as boolean)}
              className="h-5 w-5"
            />
          </div>

          {isPhilHealthMember && (
            <div className="space-y-2 pl-4 border-l-2 border-blue-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="philHealthPIN">PhilHealth PIN</Label>
              <Input id="philHealthPIN" placeholder="XX-XXXXXXXXX-X" {...register("philHealthPIN")} />
            </div>
          )}
        </div>

        <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="dpaConsent"
              onCheckedChange={(checked) => setValue("dpaConsent", checked as boolean)}
              className="mt-1 h-5 w-5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="dpaConsent" className="flex items-center cursor-pointer text-sm font-bold text-green-900">
                <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                Data Privacy Act (DPA) Consent
              </Label>
              <p className="text-xs text-green-700 leading-relaxed">
                The patient/guarantor hereby gives consent to the hospital to collect and process 
                personal and medical information for the purpose of treatment, billing, and regulatory reporting.
              </p>
            </div>
          </div>
          {errors.dpaConsent && (
            <p className="text-xs text-red-500 mt-2 font-medium">{errors.dpaConsent.message}</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Finalize Admission
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

