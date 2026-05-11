"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Search, 
  UserPlus, 
  Stethoscope, 
  MapPin, 
  Info, 
  CreditCard, 
  Save, 
  Loader2, 
  Activity,
  User,
  X,
  ArrowLeft
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createAdmission } from "@/app/api/admissions/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const AdmissionSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  admittingDiagnosis: z.string().min(3, "Diagnosis is too short"),
  admissionType: z.enum(["ROUTINE", "EMERGENCY", "URGENT", "MATERNITY"]),
  admissionSource: z.string().min(1, "Admission source is required"),
  department: z.string().min(1, "Department is required"),
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
    message: "DPA consent is mandatory."
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
  patientId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  status: string;
}

interface Physician {
  id: string;
  name: string;
  specialization?: string | null;
}

interface Bed {
  id: string;
  bedNumber: string;
  status: string;
}

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  beds: Bed[];
}

export default function NewAdmissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Patient Search State
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  // Physician Search State
  const [physicianSearch, setPhysicianSearch] = useState("");
  const [physicianResults, setPhysicianResults] = useState<Physician[]>([]);

  // Rooms State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    getValues,
    formState: { errors },
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(AdmissionSchema) as any,
    defaultValues: {
      admissionType: "EMERGENCY",
      admissionSource: "Emergency Room",
      department: "ER",
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
  const currentDepartment = watch("department");

  // Handle department change to auto-set fields
  useEffect(() => {
    if (currentDepartment === "ER") {
      setValue("admissionType", "EMERGENCY");
      setValue("admissionSource", "Emergency Room");
    } else {
      setValue("admissionType", "ROUTINE");
      setValue("admissionSource", "OPD Referral");
    }
  }, [currentDepartment, setValue]);

  // Fetch Rooms
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

  // Patient Search Debounce
  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatientResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPatients(true);
      try {
        const res = await fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setPatientResults(data);
        }
      } catch (error) {
        console.error("Patient search failed", error);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch]);

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

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setValue("patientId", patient.id);
    setPatientSearch("");
    setPatientResults([]);
  };

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
    console.log("Submitting Admission:", data);
    setLoading(true);
    try {
      const result = await createAdmission(data);
      if (result.success) {
        toast.success("Admission successful");
        router.push("/admissions");
      } else {
        toast.error(result.error || "Failed to admit patient");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4">
      {/* Debug Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-bold text-red-800 mb-2">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-xs text-red-700">
            {Object.entries(errors).map(([key, error]: [string, any]) => (
              <li key={key}>
                {key}: {error.message || (Array.isArray(error) ? "Check items" : "Invalid field")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/admissions">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ER Registration</h1>
            <p className="text-slate-500 text-sm font-medium">Initial encounter for emergency care.</p>
          </div>
        </div>

        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2">
           <Activity className="h-4 w-4" />
           <span className="text-sm font-bold uppercase tracking-wider">Mandatory Gateway</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Patient Selection */}
        <Card className="border-none shadow-sm overflow-visible bg-red-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-red-600" />
              1. Patient Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPatient ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search patient by name or ID (Min 2 chars)..." 
                  className="pl-10 h-12 border-slate-200 focus:ring-red-500"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
                {isSearchingPatients && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  </div>
                )}
                
                {patientResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {patientResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between"
                        onClick={() => handleSelectPatient(p)}
                      >
                        <div>
                          <p className="font-bold text-slate-900">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-slate-500">{p.patientId} • DOB: {new Date(p.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-slate-200 text-slate-600">{p.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-xl bg-red-50 border-red-100">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg bg-red-100 text-red-700">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>{selectedPatient.patientId}</span>
                      <span>•</span>
                      <span>{selectedPatient.gender}</span>
                      <span>•</span>
                      <span>{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setSelectedPatient(null); setValue("patientId", ""); }}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            )}
            {errors.patientId && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.patientId.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 2: Clinical Information */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-red-600" />
                  2. Emergency Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis" className="text-sm font-semibold">Initial Impression / Admitting Diagnosis</Label>
                  <Textarea 
                    id="diagnosis" 
                    placeholder="Describe emergency impression..." 
                    className="min-h-[100px] border-slate-200"
                    {...register("admittingDiagnosis")}
                  />
                  {errors.admittingDiagnosis && (
                    <p className="text-xs text-red-500 font-medium">{errors.admittingDiagnosis.message}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center text-sm font-semibold">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      Assigned ER Physician
                    </Label>
                    <div className="relative">
                      <Input 
                        placeholder="Search doctor..." 
                        className="h-9 text-xs w-48 border-slate-200"
                        value={physicianSearch}
                        onChange={(e) => setPhysicianSearch(e.target.value)}
                      />
                      {physicianResults.length > 0 && (
                        <div className="absolute top-full right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden w-64 max-h-48 overflow-y-auto">
                          {physicianResults.map((doc) => (
                            <button
                              key={doc.id}
                              type="button"
                              className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
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
                  
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-slate-200">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">
                            {field.name || "Search and select a physician"}
                          </p>
                          <div className="flex items-center space-x-3 mt-1.5">
                            <Select 
                              defaultValue={field.role}
                              onValueChange={(v: any) => setValue(`physicians.${index}.role`, v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] w-32 border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ATTENDING">Attending</SelectItem>
                                <SelectItem value="CONSULTANT">Consultant</SelectItem>
                                <SelectItem value="RESIDENT">Resident</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-md border border-slate-200">
                              <Checkbox 
                                id={`primary-${index}`}
                                checked={watch(`physicians.${index}.isPrimary`)}
                                onCheckedChange={() => {
                                  fields.forEach((_, i) => setValue(`physicians.${i}.isPrimary`, i === index));
                                }}
                              />
                              <Label htmlFor={`primary-${index}`} className="text-[11px] font-medium">Primary</Label>
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
                      <p className="text-xs text-red-500 font-medium">{errors.physicians.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Vitals */}
            <Card className="border-none shadow-sm transition-all ring-2 ring-red-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-red-600" />
                  3. Emergency Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-slate-500">BP (mmHg)</Label>
                    <Input placeholder="120/80" className="border-slate-200" {...register("vitals.bloodPressure")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-slate-500">Temp (°C)</Label>
                    <Input type="number" step="0.1" placeholder="36.5" className="border-slate-200" {...register("vitals.temperature")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-slate-500">HR (bpm)</Label>
                    <Input type="number" placeholder="80" className="border-slate-200" {...register("vitals.heartRate")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-slate-500">RR (cpm)</Label>
                    <Input type="number" placeholder="18" className="border-slate-200" {...register("vitals.respiratoryRate")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-slate-500">SpO2 (%)</Label>
                    <Input type="number" placeholder="98" className="border-slate-200" {...register("vitals.oxygenSaturation")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Step 4: Accommodation */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center text-red-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  4. ER Bay Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Select ER Bay</Label>
                  <Select onValueChange={(v: string | null) => {
                    if (!v) return;
                    const room = rooms.find(r => r.roomNumber === v);
                    setValue("roomNumber", v);
                    if (room?.type) setValue("ward", room.type);
                  }}>
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder={loadingRooms ? "Loading..." : "Choose a bay"} />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.filter(r => r.type === "ER").map((room) => {
                        const available = room.beds?.filter((b: Bed) => b.status === "AVAILABLE").length || 0;
                        return (
                          <SelectItem key={room.id} value={room.roomNumber} disabled={available === 0}>
                            {room.roomNumber} • {available} free
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.roomNumber && (
                    <p className="text-xs text-red-500 font-medium">{errors.roomNumber.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Consent */}
            <Card className="border-none shadow-sm opacity-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  5. Authorization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={cn(
                  "flex items-start space-x-3 p-4 rounded-xl",
                  errors.dpaConsent ? "bg-red-50 border border-red-100" : "bg-green-50/50 border border-green-100/50"
                )}>
                  <Checkbox 
                    id="dpa" 
                    onCheckedChange={(v) => setValue("dpaConsent", v as boolean)}
                    className="mt-1 h-5 w-5"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="dpa" className="text-xs font-bold leading-none cursor-pointer text-slate-800">
                      Emergency Data Consent
                    </Label>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Patient/Guarantor agrees to data processing for emergency treatment and subsequent admission.
                    </p>
                  </div>
                </div>
                {errors.dpaConsent && (
                  <p className="text-[10px] text-red-500 font-bold">{errors.dpaConsent.message}</p>
                )}
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold shadow-lg bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Complete ER Registration
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
