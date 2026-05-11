"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  User, 
  HeartPulse, 
  Thermometer, 
  Wind, 
  Plus,
  History,
  AlertCircle,
  FileText,
  Receipt,
  Pill
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VitalsForm } from "@/components/admissions/vitals-form";
import { NursingNotes } from "@/components/admissions/nursing-notes";
import { LabOrders } from "@/components/admissions/lab-orders";
import { PharmacyDispensing } from "@/components/admissions/pharmacy-dispensing";
import { cn } from "@/lib/utils";

interface AdmissionDetail {
  id: string;
  admissionId: string;
  type: string;
  status: string;
  triageLevel: string;
  chiefComplaint: string;
  admittingDiagnosis?: string;
  admittedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    patientId: string;
  };
}

interface VitalsRecord {
  id: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  temperature?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  o2Saturation?: number;
  recordedAt: string;
}

export default function AdmissionDetailPage({ params }: { params: { id: string } }) {
  const [admission, setAdmission] = useState<AdmissionDetail | null>(null);
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MONITORING" | "NOTES" | "LAB" | "PHARMACY">("MONITORING");

  const fetchData = async () => {
    try {
      // In a real app, this would be a single optimized endpoint
      const [admRes, vitalsRes] = await Promise.all([
        fetch(`/api/admissions/${params.id}`), // Note: We might need to create this endpoint
        fetch(`/api/admissions/${params.id}/vitals`)
      ]);

      if (admRes.ok) setAdmission(await admRes.json());
      if (vitalsRes.ok) setVitals(await vitalsRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Clinical Record...</div>;
  if (!admission) return <div className="p-20 text-center">Admission record not found.</div>;

  const latestVitals = vitals[0];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/admissions" 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Command Center
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
               {admission.patient.lastName}, {admission.patient.firstName}
             </h1>
             <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {admission.type}
                </span>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {admission.status}
                </span>
             </div>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{admission.admissionId}</p>
        </div>

        <div className="flex items-center gap-3">
           <Button 
             onClick={() => setShowVitalsForm(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 font-bold px-8 h-12"
           >
              <Plus className="h-5 w-5 mr-2" />
              Log Vitals
           </Button>
           <Link href={`/admissions/${admission.id}/billing`}>
              <Button variant="outline" className="rounded-2xl border-slate-200 font-bold px-8 h-12">
                 <Receipt className="h-5 w-5 mr-2" />
                 Billing & Invoicing
              </Button>
           </Link>
           <Button variant="outline" className="rounded-2xl border-slate-200 font-bold px-8 h-12">
              <FileText className="h-5 w-5 mr-2" />
              Clinical Note
           </Button>
        </div>
      </div>

      {showVitalsForm && (
        <VitalsForm 
          admissionId={admission.id} 
          onSuccess={() => {
            setShowVitalsForm(false);
            fetchData();
          }}
          onCancel={() => setShowVitalsForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Left Column: Encounter Summary */}
         <div className="space-y-8">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                     <AlertCircle className="h-5 w-5 text-red-600" />
                     Encounter Summary
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chief Complaint</p>
                     <p className="text-lg font-bold text-slate-900 leading-tight">{admission.chiefComplaint}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preliminary Diagnosis</p>
                     <p className="font-bold text-slate-600">{admission.admittingDiagnosis || "Pending Assessment"}</p>
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time in ER</p>
                        <p className="text-xl font-black text-slate-900 flex items-center gap-2">
                           <Clock className="h-5 w-5 text-slate-300" />
                           2h 15m
                        </p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                        <p className="text-xl font-black text-red-600">{admission.triageLevel.replace("_", " ")}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                     <User className="h-5 w-5 text-blue-600" />
                     Patient Details
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">DOB</span>
                     <span className="font-bold text-slate-900">{new Date(admission.patient.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gender</span>
                     <span className="font-bold text-slate-900">{admission.patient.gender}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">MPI Record</span>
                     <Link href={`/patients/${admission.patient.id}`} className="text-xs font-black text-blue-600 hover:underline">
                        VIEW FULL PROFILE
                     </Link>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Middle/Right Column: Clinical Activity Workspace */}
         <div className="md:col-span-2 space-y-8">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl w-fit">
               {[
                 { id: "MONITORING", label: "Monitoring", icon: Activity },
                 { id: "NOTES", label: "Nursing Notes", icon: FileText },
                 { id: "LAB", label: "Lab Orders", icon: History },
                 { id: "PHARMACY", label: "Pharmacy", icon: Pill },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as "MONITORING" | "NOTES" | "LAB" | "PHARMACY")}
                   className={cn(
                     "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                     activeTab === tab.id 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   <tab.icon className="h-4 w-4" />
                   {tab.label}
                 </button>
               ))}
            </div>

            {activeTab === "MONITORING" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Blood Pressure", value: latestVitals ? `${latestVitals.bpSystolic}/${latestVitals.bpDiastolic}` : "--/--", unit: "mmHg", icon: HeartPulse, color: "text-red-600", bg: "bg-red-50" },
                    { label: "Temperature", value: latestVitals?.temperature || "--", unit: "°C", icon: Thermometer, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "O2 Saturation", value: latestVitals?.o2Saturation || "--", unit: "%", icon: Wind, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Pulse Rate", value: latestVitals?.pulseRate || "--", unit: "bpm", icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
                  ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6">
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                              <stat.icon className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                          <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                              <span className="text-[10px] font-bold text-slate-400">{stat.unit}</span>
                          </div>
                        </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Vitals History */}
                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-600" />
                        Observation History
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Last Updated: {latestVitals ? new Date(latestVitals.recordedAt).toLocaleTimeString() : "Never"}
                      </p>
                  </CardHeader>
                  <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-50">
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">BP</th>
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temp</th>
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SpO2</th>
                                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pulse</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {vitals.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 font-bold text-slate-600 text-sm">
                                      {new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-8 py-5">
                                      <span className="font-bold text-slate-900">{v.bpSystolic}/{v.bpDiastolic}</span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900">{v.temperature}°C</td>
                                    <td className="px-8 py-5 font-bold text-slate-900">{v.o2Saturation}%</td>
                                    <td className="px-8 py-5 font-bold text-slate-900">{v.pulseRate} bpm</td>
                                </tr>
                              ))}
                              {vitals.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                                      No vitals recorded yet.
                                    </td>
                                </tr>
                              )}
                            </tbody>
                        </table>
                      </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "NOTES" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <NursingNotes admissionId={admission.id} />
              </div>
            )}

            {activeTab === "LAB" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <LabOrders admissionId={admission.id} />
              </div>
            )}

            {activeTab === "PHARMACY" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <PharmacyDispensing admissionId={admission.id} />
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
