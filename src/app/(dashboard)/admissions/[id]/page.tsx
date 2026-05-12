"use client";

import { useState, useEffect, useCallback, use } from "react";
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
  Pill,
  ShieldCheck,
  ClipboardList,
  Printer
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VitalsForm } from "@/components/admissions/vitals-form";
import { NursingNotes } from "@/components/admissions/nursing-notes";
import { LabOrders } from "@/components/admissions/lab-orders";
import { PharmacyDispensing } from "@/components/admissions/pharmacy-dispensing";
import { CaseRateSelector } from "@/components/admissions/case-rate-selector";
import { DoctorOrders } from "@/components/admissions/doctor-orders";
import { Protected } from "@/components/auth/protected";
import { cn } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DischargeSummary } from "@/components/admissions/discharge-summary";

interface AdmissionDetail {
  id: string;
  admissionId: string;
  type: string;
  status: string;
  triageLevel: string;
  chiefComplaint: string;
  admittingDiagnosis?: string;
  finalDiagnosis?: string;
  admittedAt: string;
  primaryCaseRateId?: string;
  primaryCaseRate?: {
    id: string;
    code: string;
    description: string;
    totalAmount: number;
  };
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

export default function AdmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [admission, setAdmission] = useState<AdmissionDetail | null>(null);
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MONITORING" | "NOTES" | "LAB" | "PHARMACY" | "DIAGNOSIS" | "ORDERS">("MONITORING");
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [summaryData, setSummaryData] = useState<AdmissionDetail | null>(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [admRes, vitalsRes] = await Promise.all([
        fetch(`/api/admissions/${id}`),
        fetch(`/api/admissions/${id}/vitals`)
      ]);

      if (admRes.ok) {
        const data = await admRes.json();
        setAdmission(data);
        setFinalDiagnosis(data.finalDiagnosis || "");
      }
      if (vitalsRes.ok) {
        const data = await vitalsRes.json();
        setVitals(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSummaryData = useCallback(async () => {
    setIsFetchingSummary(true);
    try {
      const res = await fetch(`/api/admissions/${id}/summary`);
      if (res.ok) {
        setSummaryData(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingSummary(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => setIsClient(true));
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === "DIAGNOSIS" && admission?.status === "DISCHARGED") {
      Promise.resolve().then(() => fetchSummaryData());
    }
  }, [activeTab, admission?.status, fetchSummaryData]);

  const handleUpdateDiagnosis = async (caseRateId?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalDiagnosis,
          primaryCaseRateId: caseRateId || admission?.primaryCaseRateId
        })
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

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
           <Protected permission="add_vitals">
             <Button 
               onClick={() => setShowVitalsForm(true)}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 font-bold px-8 h-12"
             >
                <Plus className="h-5 w-5 mr-2" />
                Log Vitals
             </Button>
           </Protected>
           <Protected permission="view_billing">
             <Link href={`/admissions/${admission.id}/billing`}>
                <Button variant="outline" className="rounded-2xl border-slate-200 font-bold px-8 h-12">
                   <Receipt className="h-5 w-5 mr-2" />
                   Billing & Invoicing
                </Button>
             </Link>
           </Protected>
           <Protected permission="add_clinical_notes">
             <Button 
               onClick={() => setActiveTab("NOTES")}
               variant="outline" 
               className="rounded-2xl border-slate-200 font-bold px-8 h-12"
             >
                <FileText className="h-5 w-5 mr-2" />
                Clinical Note
             </Button>
           </Protected>
           {admission.status === "DISCHARGED" && isClient && summaryData && (
             <PDFDownloadLink 
               document={<DischargeSummary data={summaryData} />} 
               fileName={`Summary-${admission.admissionId}.pdf`}
             >
                {({ loading }) => (
                  <Button className="bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 font-bold px-8 h-12" disabled={loading}>
                     <Printer className="h-5 w-5 mr-2" />
                     {loading ? '...' : 'Print Summary'}
                  </Button>
                )}
             </PDFDownloadLink>
           )}
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
                  {admission.finalDiagnosis && (
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Final Diagnosis</p>
                       <p className="font-bold text-blue-900">{admission.finalDiagnosis}</p>
                    </div>
                  )}
                  {admission.primaryCaseRate && (
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">PhilHealth Case Rate</p>
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-green-100 text-green-700 px-2 py-0.5 rounded">{admission.primaryCaseRate.code}</span>
                          <span className="text-xs font-bold text-slate-600 line-clamp-1">{admission.primaryCaseRate.description}</span>
                       </div>
                    </div>
                  )}
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
                 { id: "MONITORING", label: "Monitoring", icon: Activity, permission: "view_vitals" as const },
                 { id: "ORDERS", label: "Dr. Orders", icon: ClipboardList, permission: "view_admissions" as const },
                 { id: "NOTES", label: "Nursing Notes", icon: FileText, permission: "view_clinical_notes" as const },
                 { id: "LAB", label: "Lab Orders", icon: History, permission: "view_lab_orders" as const },
                 { id: "PHARMACY", label: "Pharmacy", icon: Pill, permission: "manage_inventory" as const },
                 { id: "DIAGNOSIS", label: "Diagnosis", icon: ShieldCheck, permission: "create_admissions" as const },
               ].map((tab) => (
                 <Protected key={tab.id} permission={tab.permission}>
                    <button
                      onClick={() => setActiveTab(tab.id as "MONITORING" | "NOTES" | "LAB" | "PHARMACY" | "DIAGNOSIS" | "ORDERS")}
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
                 </Protected>
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

            {activeTab === "ORDERS" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <DoctorOrders admissionId={admission.id} />
              </div>
            )}

            {activeTab === "DIAGNOSIS" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                    <CardTitle className="text-lg font-bold">Final Diagnosis & PhilHealth Case Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <Label htmlFor="finalDiagnosis" className="text-xs font-black uppercase tracking-widest text-slate-400">Final Diagnosis</Label>
                      <textarea
                        id="finalDiagnosis"
                        value={finalDiagnosis}
                        onChange={(e) => setFinalDiagnosis(e.target.value)}
                        className="w-full h-32 rounded-2xl border-2 border-slate-100 p-4 focus:border-blue-500 focus:ring-0 text-slate-900 font-medium transition-all"
                        placeholder="Enter the final diagnosis after clinical evaluation..."
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">PhilHealth Case Rate (ICD-10 / RVS)</Label>
                      <CaseRateSelector 
                        selectedId={admission.primaryCaseRateId}
                        onSelect={(rate) => handleUpdateDiagnosis(rate.id)} 
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          {admission.status === "ACTIVE" && (
                            <Button 
                              variant="outline"
                              onClick={async () => {
                                setIsUpdating(true);
                                try {
                                  const res = await fetch(`/api/admissions/${id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "DISCHARGED" })
                                  });
                                  if (res.ok) await fetchData();
                                } catch (error) {
                                  console.error(error);
                                } finally {
                                  setIsUpdating(false);
                                }
                              }}
                              disabled={isUpdating || !admission.finalDiagnosis || !admission.primaryCaseRateId}
                              className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-8 h-12 font-bold"
                            >
                               Process Discharge
                            </Button>
                          )}

                          {admission.status === "DISCHARGED" && isClient && (
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                               <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mr-4">Encounter Finalized</span>
                               
                               {summaryData ? (
                                 <PDFDownloadLink 
                                   document={<DischargeSummary data={summaryData} />} 
                                   fileName={`Summary-${admission.admissionId}.pdf`}
                                 >
                                    {({ loading }) => (
                                      <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl px-8 h-12 font-bold" disabled={loading}>
                                         <FileText className="h-5 w-5 mr-2" />
                                         {loading ? 'Preparing Summary...' : 'Print Discharge Summary'}
                                      </Button>
                                    )}
                                 </PDFDownloadLink>
                               ) : (
                                 <Button 
                                   variant="outline" 
                                   onClick={fetchSummaryData} 
                                   className="rounded-xl px-8 h-12 font-bold"
                                   disabled={isFetchingSummary}
                                 >
                                    {isFetchingSummary ? 'Fetching Record...' : 'Load Discharge Data'}
                                 </Button>
                               )}
                            </div>
                          )}

                          {!admission.finalDiagnosis && admission.status === 'ACTIVE' && (
                            <p className="text-[10px] font-bold text-slate-400 italic">Final diagnosis required for discharge</p>
                          )}
                       </div>
                       <Button 
                         onClick={() => handleUpdateDiagnosis()}
                         disabled={isUpdating}
                         className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-slate-200"
                       >
                          {isUpdating ? "Updating..." : "Save Clinical Record"}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
