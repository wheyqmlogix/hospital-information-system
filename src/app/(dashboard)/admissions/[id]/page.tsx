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

import { CSRIssuance } from "@/components/admissions/csr-issuance";

export default function AdmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [admission, setAdmission] = useState<AdmissionDetail | null>(null);
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MONITORING" | "NOTES" | "LAB" | "PHARMACY" | "CSR" | "DIAGNOSIS" | "ORDERS">("MONITORING");
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

  if (loading) return <div className="p-20 text-center animate-pulse">Synchronizing Clinical Record...</div>;
  if (!admission) return <div className="p-20 text-center">Admission record not found.</div>;

  const latestVitals = vitals[0];

  return (
    <div className="max-w-full space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <Link 
            href="/admissions" 
            className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="h-3 w-3 mr-2" />
            Registry Return
          </Link>
          <div className="flex items-center gap-6">
             <h1 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter leading-none">
               {admission.patient.lastName}, {admission.patient.firstName}
             </h1>
             <div className="flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-[1px] border border-slate-200 uppercase tracking-widest">
                  {admission.type}
                </span>
                <span className="bg-green-50 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-[1px] border border-green-100 uppercase tracking-widest">
                  {admission.status}
                </span>
             </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Institutional Identifier: {admission.admissionId}</p>
        </div>

        <div className="flex items-center gap-2">
           <Protected permission="add_vitals">
             <Button 
               onClick={() => setShowVitalsForm(true)}
               className="bg-[#0f172a] text-white h-9 px-6 text-[9px] font-black uppercase tracking-widest"
             >
                <Plus className="h-3 w-3 mr-2" />
                Record Vitals
             </Button>
           </Protected>
           <Protected permission="view_billing">
             <Link href={`/admissions/${admission.id}/billing`}>
                <Button variant="outline" className="h-9 px-6 text-[9px] font-black uppercase tracking-widest border-slate-300">
                   <Receipt className="h-3 w-3 mr-2" />
                   Billing Registry
                </Button>
             </Link>
           </Protected>
           {admission.status === "DISCHARGED" && isClient && summaryData && (
             <PDFDownloadLink 
               document={<DischargeSummary data={summaryData} />} 
               fileName={`Summary-${admission.admissionId}.pdf`}
             >
                {({ loading }) => (
                  <Button className="bg-[#0f172a] text-white h-9 px-6 text-[9px] font-black uppercase tracking-widest" disabled={loading}>
                     <Printer className="h-3 w-3 mr-2" />
                     {loading ? 'Processing...' : 'Export Discharge Summary'}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Left Column: Encounter Summary */}
         <div className="space-y-8">
            <Card className="border-slate-200 rounded-sm overflow-hidden bg-white">
               <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-red-800" />
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Admission Parameters</h2>
               </div>
               <CardContent className="p-6 space-y-6">
                  <div className="space-y-1.5">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Chief Complaint / Narration</p>
                     <p className="text-sm font-black text-[#0f172a] leading-tight uppercase tracking-tight">{admission.chiefComplaint}</p>
                  </div>
                  <div className="space-y-1.5 pt-4 border-t border-slate-50">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Initial Clinical Impression</p>
                     <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{admission.admittingDiagnosis || "Awaiting Assessment"}</p>
                  </div>
                  {admission.finalDiagnosis && (
                    <div className="space-y-1.5 pt-4 border-t border-slate-50">
                       <p className="text-[8px] font-black text-[#0f172a] uppercase tracking-widest">Final Clinical Diagnosis</p>
                       <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{admission.finalDiagnosis}</p>
                    </div>
                  )}
                  {admission.primaryCaseRate && (
                    <div className="space-y-2 pt-4 border-t border-slate-50">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PhilHealth Case Classification</p>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-[#0f172a] tracking-tight">{admission.primaryCaseRate.code}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight line-clamp-2">{admission.primaryCaseRate.description}</span>
                       </div>
                    </div>
                  )}
                  <div className="pt-6 grid grid-cols-2 gap-0 border-t border-slate-100 -mx-6 -mb-6">
                     <div className="p-4 border-r border-slate-100 bg-slate-50/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Elapsed</p>
                        <p className="text-lg font-black text-[#0f172a] tracking-tighter">2h 15m</p>
                     </div>
                     <div className="p-4 bg-slate-50/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Triage</p>
                        <p className="text-lg font-black text-red-900 tracking-tighter">{admission.triageLevel.replace("_", " ")}</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-slate-200 rounded-sm overflow-hidden bg-white">
               <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <User className="h-3 w-3 text-slate-500" />
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Institutional Identity</h2>
               </div>
               <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</span>
                     <span className="text-[10px] font-black text-[#0f172a] uppercase">{new Date(admission.patient.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gender</span>
                     <span className="text-[10px] font-black text-[#0f172a] uppercase">{admission.patient.gender}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MPI Access</span>
                     <Link href={`/patients/${admission.patient.id}`} className="text-[9px] font-black text-[#0f172a] hover:underline underline-offset-4 tracking-widest">
                        SECURE PROFILE
                     </Link>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Middle/Right Column: Clinical Activity Workspace */}
         <div className="lg:col-span-3 space-y-8">
            {/* Tabs Navigation - Swiss Minimal */}
            <div className="flex items-center gap-0 border border-slate-200 bg-white p-0 rounded-sm overflow-hidden">
               {[
                 { id: "MONITORING", label: "Monitoring", icon: Activity, permission: "view_vitals" as const },
                 { id: "ORDERS", label: "Clinical Orders", icon: ClipboardList, permission: "view_admissions" as const },
                 { id: "NOTES", label: "Progress Notes", icon: FileText, permission: "view_clinical_notes" as const },
                 { id: "LAB", label: "Lab Registry", icon: History, permission: "view_lab_orders" as const },
                 { id: "PHARMACY", label: "Pharmacy", icon: Pill, permission: "manage_inventory" as const },
                 { id: "CSR", label: "Central Supply", icon: Package, permission: "manage_inventory" as const },
                 { id: "DIAGNOSIS", label: "Finalization", icon: ShieldCheck, permission: "create_admissions" as const },
               ].map((tab) => (
                 <Protected key={tab.id} permission={tab.permission}>
                    <button
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 text-[9px] font-black uppercase tracking-[0.15em] transition-all border-r border-slate-100 last:border-r-0",
                        activeTab === tab.id 
                          ? "bg-slate-50 text-[#0f172a] border-b-2 border-b-[#0f172a]" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                      )}
                    >
                      <tab.icon className="h-3 w-3" />
                      {tab.label}
                    </button>
                 </Protected>
               ))}
            </div>

            <div className="min-h-[600px]">
              {activeTab === "MONITORING" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Blood Pressure", value: latestVitals ? `${latestVitals.bpSystolic}/${latestVitals.bpDiastolic}` : "--/--", unit: "mmHg", icon: HeartPulse, color: "text-[#991b1b]" },
                      { label: "Temperature", value: latestVitals?.temperature || "--", unit: "°C", icon: Thermometer, color: "text-[#9a3412]" },
                      { label: "O2 Saturation", value: latestVitals?.o2Saturation || "--", unit: "%", icon: Wind, color: "text-[#166534]" },
                      { label: "Pulse Rate", value: latestVitals?.pulseRate || "--", unit: "bpm", icon: Activity, color: "text-[#1e40af]" },
                    ].map((stat, i) => (
                      <Card key={i} className="border-slate-200 rounded-sm overflow-hidden bg-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-[#0f172a] tracking-tighter leading-none">{stat.value}</span>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{stat.unit}</span>
                            </div>
                          </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Vitals History */}
                  <Card className="border-slate-200 rounded-sm overflow-hidden bg-white">
                    <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <History className="h-3 w-3" />
                          Longitudinal Observation Registry
                        </h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Sync State: {latestVitals ? `Captured ${new Date(latestVitals.recordedAt).toLocaleTimeString()}` : "No Records"}
                        </p>
                    </div>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-white border-b border-slate-100">
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Time Marker</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">BP Analysis</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Thermal</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">SpO2</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cardiac Rate</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {vitals.map((v) => (
                                  <tr key={v.id} className="hover:bg-[#fcfcfc] transition-colors">
                                      <td className="px-8 py-4 font-black text-slate-500 text-[10px] border-r border-slate-50 uppercase tracking-widest">
                                        {new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="px-8 py-4 border-r border-slate-50">
                                        <span className="text-[11px] font-black text-[#0f172a] uppercase">{v.bpSystolic}/{v.bpDiastolic}</span>
                                      </td>
                                      <td className="px-8 py-4 text-[11px] font-black text-[#0f172a] border-r border-slate-50 uppercase">{v.temperature}°C</td>
                                      <td className="px-8 py-4 text-[11px] font-black text-[#0f172a] border-r border-slate-50 uppercase">{v.o2Saturation}%</td>
                                      <td className="px-8 py-4 text-[11px] font-black text-[#0f172a] uppercase">{v.pulseRate} bpm</td>
                                  </tr>
                                ))}
                                {vitals.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="py-24 text-center">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Institutional State: No Observational Data Synchronized</p>
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
                <div className="animate-in fade-in duration-500">
                  <NursingNotes admissionId={admission.id} />
                </div>
              )}

              {activeTab === "LAB" && (
                <div className="animate-in fade-in duration-500">
                  <LabOrders admissionId={admission.id} />
                </div>
              )}

              {activeTab === "PHARMACY" && (
                <div className="animate-in fade-in duration-500">
                  <PharmacyDispensing admissionId={admission.id} />
                </div>
              )}

              {activeTab === "CSR" && (
                <CSRIssuance admissionId={admission.id} />
              )}

              {activeTab === "ORDERS" && (
                <div className="animate-in fade-in duration-500">
                  <DoctorOrders admissionId={admission.id} />
                </div>
              )}

              {activeTab === "DIAGNOSIS" && (
                <div className="animate-in fade-in duration-500 space-y-8">
                  <Card className="border-slate-200 rounded-sm overflow-hidden bg-white">
                    <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
                      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Encounter Finalization Registry</h2>
                    </div>
                    <CardContent className="p-8 space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="finalDiagnosis" className="text-[9px] font-black uppercase tracking-widest text-slate-400">Final Clinical Diagnosis (Official Record)</Label>
                        <textarea
                          id="finalDiagnosis"
                          value={finalDiagnosis}
                          onChange={(e) => setFinalDiagnosis(e.target.value)}
                          className="w-full h-32 rounded-sm border border-slate-200 bg-slate-50/30 p-4 focus:border-[#0f172a] focus:ring-0 text-[11px] font-bold uppercase tracking-tight transition-all outline-none"
                          placeholder="Provide the official clinical diagnosis for institutional records..."
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">PhilHealth Case Rate Classification (ICD-10 / RVS)</Label>
                        <CaseRateSelector 
                          selectedId={admission.primaryCaseRateId}
                          onSelect={(rate) => handleUpdateDiagnosis(rate.id)} 
                        />
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                         <div className="flex items-center gap-4">
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
                                className="border-red-200 text-red-900 hover:bg-red-50 h-10 px-8 text-[9px] font-black uppercase tracking-widest"
                              >
                                 Execute Institutional Discharge
                              </Button>
                            )}

                            {admission.status === "DISCHARGED" && isClient && (
                              <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                    <span className="text-[9px] font-black text-green-700 uppercase tracking-widest mr-4">Registry State: Encounter Finalized</span>
                                 </div>
                                 
                                 {summaryData ? (
                                   <PDFDownloadLink 
                                     document={<DischargeSummary data={summaryData} />} 
                                     fileName={`Summary-${admission.admissionId}.pdf`}
                                   >
                                      {({ loading }) => (
                                        <Button variant="outline" className="h-10 px-8 text-[9px] font-black uppercase tracking-widest border-slate-300 text-[#0f172a]" disabled={loading}>
                                           <FileText className="h-3.5 w-3.5 mr-2" />
                                           {loading ? 'Processing...' : 'Export Final Summary'}
                                        </Button>
                                      )}
                                   </PDFDownloadLink>
                                 ) : (
                                   <Button 
                                     variant="outline" 
                                     onClick={fetchSummaryData} 
                                     className="h-10 px-8 text-[9px] font-black uppercase tracking-widest border-slate-300"
                                     disabled={isFetchingSummary}
                                   >
                                      {isFetchingSummary ? 'Syncing...' : 'Synchronize Discharge Data'}
                                   </Button>
                                 )}
                              </div>
                            )}

                            {!admission.finalDiagnosis && admission.status === 'ACTIVE' && (
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Institutional Note: Diagnosis mandatory for discharge clearance.</p>
                            )}
                         </div>
                         <Button 
                           onClick={() => handleUpdateDiagnosis()}
                           disabled={isUpdating}
                           className="bg-[#0f172a] text-white h-10 px-10 text-[9px] font-black uppercase tracking-widest shadow-sm"
                         >
                            {isUpdating ? "Synchronizing..." : "Update Official Record"}
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}
