"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Activity, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Plus,
  Loader2,
  ShieldCheck,
  Receipt,
  Download,
  Printer,
  Stethoscope,
  Heart,
  Thermometer,
  Scale,
  Pill,
  FileCheck,
  Microscope,
  Radius,
  FlaskConical,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { EligibilityChecker } from "@/components/insurance/eligibility-checker";
import { ClaimForm } from "@/components/patients/claim-form";
import { ChargeForm } from "@/components/patients/charge-form";
import { PrescriptionForm } from "@/components/patients/prescription-form";
import { LabRequestForm } from "@/components/patients/lab-request-form";
import { RadRequestForm } from "@/components/patients/rad-request-form";
import { calculateDiscounts, PatientCategory } from "@/lib/billing/utils";
import { aiAuditor } from "@/lib/intelligence/auditor";

import { useRouter } from "next/navigation";

const statusStyles = {
  INPATIENT: "bg-blue-100 text-blue-700 border-blue-200",
  OUTPATIENT: "bg-teal-100 text-teal-700 border-teal-200",
  EMERGENCY: "bg-red-100 text-red-700 border-red-200",
  OBSERVATION: "bg-amber-100 text-amber-700 border-amber-200",
  RECOVERED: "bg-green-100 text-green-700 border-green-200",
  DECEASED: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState(false);
  const [isLabFormOpen, setIsLabFormOpen] = useState(false);
  const [isRadFormOpen, setIsRadFormOpen] = useState(false);
  const router = useRouter();
  
  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ["patient", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch patient");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Retrieving patient record...</p>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Record Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          We couldn&apos;t find the patient record you&apos;re looking for. It might have been deleted or moved.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</h1>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-sm font-medium text-slate-500">{patient.patientId}</span>
            <span className="text-slate-300">•</span>
            <Badge variant="outline" className={statusStyles[patient.status as keyof typeof statusStyles]}>
              {patient.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-sm">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</h2>
                <p className="text-sm text-slate-500">{patient.gender} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old</p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-3 text-slate-400" />
                  <span className="text-slate-600">{patient.mobileNumber || "No number"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-3 text-slate-400" />
                  <span className="text-slate-600">{patient.email || "No email"}</span>
                </div>
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 text-slate-400" />
                  <div className="text-slate-600">
                    <p>{patient.address || "No street address"}</p>
                    {(patient.barangay || patient.city) && (
                      <p className="text-xs text-slate-500">
                        {patient.barangay ? `${patient.barangay}, ` : ""}
                        {patient.city ? `${patient.city}` : ""}
                      </p>
                    )}
                    {(patient.province || patient.zipCode) && (
                      <p className="text-xs text-slate-500">
                        {patient.province ? `${patient.province} ` : ""}
                        {patient.zipCode ? `${patient.zipCode}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Identification</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">PhilHealth ID</span>
                    <span className="font-medium text-slate-900">{patient.philHealthId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">National ID</span>
                    <span className="font-medium text-slate-900">{patient.nationalId || "N/A"}</span>
                  </div>
                  {patient.seniorCitizenId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Senior Citizen ID</span>
                      <span className="font-medium text-slate-900">{patient.seniorCitizenId}</span>
                    </div>
                  )}
                  {patient.pwdId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">PWD ID</span>
                      <span className="font-medium text-slate-900">{patient.pwdId}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <EligibilityChecker philhealthId={patient.philHealthId} />

          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={() => setIsClaimFormOpen(true)}
              disabled={!patient.philHealthId}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              File Insurance Claim
            </Button>

            <Button 
              variant="outline"
              className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
              onClick={() => setIsChargeFormOpen(true)}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Add Hospital Charge
            </Button>
          </div>

          <ClaimForm 
            open={isClaimFormOpen} 
            onOpenChange={setIsClaimFormOpen} 
            patient={patient} 
          />

          <ChargeForm 
            open={isChargeFormOpen} 
            onOpenChange={setIsChargeFormOpen} 
            patient={patient} 
          />

          <Card className="border-none shadow-sm bg-red-50 border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-red-800 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Medical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 font-medium">
                {patient.allergies ? `Allergies: ${patient.allergies}` : "No known allergies reported."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none h-auto p-0 space-x-8">
              <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
                Overview
              </TabsTrigger>
              <TabsTrigger value="clinical" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
                Clinical Notes
              </TabsTrigger>
              <TabsTrigger value="ancillary" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
                Lab & Imaging
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="appointments" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
                Appointments
              </TabsTrigger>
              <TabsTrigger value="billing" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
                Billing
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Recent Vitals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.clinicalNotes?.[0]?.bloodPressure ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <span className="text-xs text-slate-500 block">Blood Pressure</span>
                          <span className="text-lg font-bold text-blue-700">{patient.clinicalNotes[0].bloodPressure}</span>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <span className="text-xs text-slate-500 block">Temperature</span>
                          <span className="text-lg font-bold text-red-700">{patient.clinicalNotes[0].temperature}°C</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No recent vitals recorded</p>
                        <Button variant="link" size="sm" className="text-blue-600 mt-2" onClick={() => router.push(`/patients/${params.id}/notes/new`)}>
                          Add Vitals
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Active Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.prescriptions?.[0]?.items?.length > 0 ? (
                      <div className="space-y-3">
                        {patient.prescriptions[0].items.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="flex items-center space-x-3 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="font-medium text-slate-900">{item.medicationName}</span>
                            <span className="text-slate-500">{item.dosage} • {item.frequency}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No active medications</p>
                        <Button variant="link" size="sm" className="text-blue-600 mt-2" onClick={() => setIsPrescriptionFormOpen(true)}>
                          Issue e-Prescription
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="pt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Clinical Progress Notes</CardTitle>
                    <CardDescription>Detailed medical records and doctor observations.</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/patients/${params.id}/notes/new`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </CardHeader>
                <CardContent>

                  {patient.clinicalNotes?.length > 0 ? (                    <div className="space-y-8">
                      {patient.clinicalNotes.map((note: any) => {
                        const audit = aiAuditor.auditClinicalNote(note);
                        return (
                        <div key={note.id} className="pb-8 border-b border-slate-100 last:border-0">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-50 p-2 rounded-lg">
                                <Stethoscope className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{note.doctorName}</h4>
                                <span className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {audit.status !== "PASSED" && (
                                <Badge variant="outline" className={`${
                                  audit.status === "WARNING" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-red-50 text-red-600 border-red-200"
                                } flex items-center`}>
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Audit: {audit.score}%
                                </Badge>
                              )}
                              {audit.status === "PASSED" && (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Compliant
                                </Badge>
                              )}
                              {note.diagnosis && (
                                <Badge variant="outline" className="bg-slate-50 font-bold">
                                  {note.diagnosis} {note.icd10Code && `(${note.icd10Code})`}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Vitals Summary in Note */}
                          {(note.bloodPressure || note.temperature || note.heartRate) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              {note.bloodPressure && (
                                <div className="text-xs">
                                  <span className="text-slate-500 block">BP</span>
                                  <span className="font-bold text-slate-900">{note.bloodPressure} <span className="text-[10px] font-normal text-slate-400">mmHg</span></span>
                                </div>
                              )}
                              {note.temperature && (
                                <div className="text-xs">
                                  <span className="text-slate-500 block">Temp</span>
                                  <span className="font-bold text-slate-900">{note.temperature}°C</span>
                                </div>
                              )}
                              {note.heartRate && (
                                <div className="text-xs">
                                  <span className="text-slate-500 block">HR</span>
                                  <span className="font-bold text-slate-900">{note.heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span></span>
                                </div>
                              )}
                              {note.oxygenSaturation && (
                                <div className="text-xs">
                                  <span className="text-slate-500 block">O2 Sat</span>
                                  <span className="font-bold text-slate-900">{note.oxygenSaturation}%</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Subjective</span>
                                <p className="text-slate-700 mt-1 leading-relaxed">{note.subjective || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Assessment</span>
                                <p className="text-slate-700 mt-1 leading-relaxed font-medium">{note.assessment || "N/A"}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Objective</span>
                                <p className="text-slate-700 mt-1 leading-relaxed">{note.objective || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Plan</span>
                                <p className="text-blue-700 mt-1 leading-relaxed bg-blue-50/50 p-2 rounded border border-blue-100/50">{note.plan || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500">No clinical notes available for this patient.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ancillary" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center">
                        <FlaskConical className="h-4 w-4 mr-2 text-blue-600" />
                        Laboratory Requests
                      </CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsLabFormOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <LabRequestForm open={isLabFormOpen} onOpenChange={setIsLabFormOpen} patient={patient} />
                    {patient.labRequests?.length > 0 ? (
                      <div className="space-y-3">
                        {patient.labRequests.map((req: any) => (
                          <div key={req.id} className="flex items-center justify-between p-2 rounded border border-slate-100 text-sm">
                            <div>
                              <p className="font-medium text-slate-900">{req.testName}</p>
                              <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {req.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">No lab requests</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2 text-indigo-600" />
                        Radiology Requests
                      </CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsRadFormOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <RadRequestForm open={isRadFormOpen} onOpenChange={setIsRadFormOpen} patient={patient} />
                    {patient.radRequests?.length > 0 ? (
                      <div className="space-y-3">
                        {patient.radRequests.map((req: any) => (
                          <div key={req.id} className="flex items-center justify-between p-2 rounded border border-slate-100 text-sm">
                            <div>
                              <p className="font-medium text-slate-900">{req.procedureName}</p>
                              <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {req.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">No imaging requests</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="prescriptions" className="pt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">e-Prescription History</CardTitle>
                    <CardDescription>All medications prescribed to this patient.</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setIsPrescriptionFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Prescription
                  </Button>
                </CardHeader>
                <CardContent>
                  <PrescriptionForm 
                    open={isPrescriptionFormOpen} 
                    onOpenChange={setIsPrescriptionFormOpen} 
                    patient={patient} 
                  />
                  
                  {patient.prescriptions?.length > 0 ? (
                    <div className="space-y-6">
                      {patient.prescriptions.map((pres: any) => (
                        <div key={pres.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-slate-900">Dr. {pres.doctorName}</h4>
                              <span className="text-xs text-slate-400">{new Date(pres.createdAt).toLocaleString()}</span>
                            </div>
                            <Button size="sm" variant="outline" className="h-8">
                              <Printer className="h-3.5 w-3.5 mr-2" />
                              Print Rx
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {pres.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-100">
                                <div className="flex items-center space-x-3">
                                  <Pill className="h-4 w-4 text-purple-500" />
                                  <span className="font-bold text-slate-800">{item.medicationName}</span>
                                  <span className="text-slate-500">{item.dosage}</span>
                                </div>
                                <div className="text-slate-600 text-xs font-medium">
                                  {item.frequency} {item.duration && `• ${item.duration}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Pill className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500">No prescriptions found for this patient.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="pt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Appointment History</CardTitle>
                  <Button size="sm" variant="outline">Schedule New</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.appointments?.length > 0 ? (
                        patient.appointments.map((app: any) => (
                          <TableRow key={app.id}>
                            <TableCell>{new Date(app.appointmentDate).toLocaleDateString()}</TableCell>
                            <TableCell>{app.doctorName}</TableCell>
                            <TableCell>{app.reason}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{app.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No appointments scheduled.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Itemized Charges</CardTitle>
                        <CardDescription>Detailed breakdown of all hospital services provided.</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button size="sm" variant="outline">
                          <Printer className="h-4 w-4 mr-2" />
                          Print SOA
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service / Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.billingRecords?.[0]?.items?.length > 0 ? (
                            patient.billingRecords[0].items.map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.serviceName}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>₱{Number(item.unitPrice).toLocaleString()}</TableCell>
                                <TableCell className="text-right">₱{Number(item.totalAmount).toLocaleString()}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-slate-500 italic">
                                No charges recorded for the current admission.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Statement Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const total = Number(patient.billingRecords?.[0]?.totalAmount || 0);
                        const category: PatientCategory = patient.seniorCitizenId ? "SENIOR" : patient.pwdId ? "PWD" : "REGULAR";
                        const { discountTotal, vatExemption, discountedAmount } = calculateDiscounts(total, category);
                        const philhealth = Number(patient.billingRecords?.[0]?.philHealthShare || 0);
                        const patientShare = discountedAmount - philhealth;

                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Gross Amount</span>
                              <span>₱{total.toLocaleString()}</span>
                            </div>
                            {(category !== "REGULAR") && (
                              <>
                                <div className="flex justify-between text-sm text-green-400">
                                  <span>Regulatory Discount ({category})</span>
                                  <span>-₱{discountTotal.toLocaleString()}</span>
                                </div>
                                <div className="pl-4 flex justify-between text-xs text-slate-500">
                                  <span>incl. VAT Exemption</span>
                                  <span>₱{vatExemption.toLocaleString()}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between text-sm text-blue-400">
                              <span>PhilHealth Benefit</span>
                              <span>-₱{philhealth.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                              <span className="font-bold">Total Patient Share</span>
                              <span className="text-2xl font-bold text-teal-400">₱{patientShare.toLocaleString()}</span>
                            </div>
                            <Button className="w-full bg-teal-600 hover:bg-teal-700 mt-4">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Proceed to Payment
                            </Button>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
