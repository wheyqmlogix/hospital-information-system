"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  User, 
  ChevronRight, 
  Plus,
  Thermometer,
  HeartPulse,
  Timer,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ERAdmission {
  id: string;
  admissionId: string;
  patientId: string;
  triageLevel: "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4" | "LEVEL_5";
  chiefComplaint: string;
  admittedAt: string;
  patient: {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
  };
  vitals: Array<{
    bpSystolic?: number;
    bpDiastolic?: number;
    temperature?: number;
    pulseRate?: number;
    o2Saturation?: number;
  }>;
}

const triageConfig = {
  LEVEL_1: { label: "Immediate (L1)", color: "text-[#991b1b] border-[#991b1b]/20 bg-red-50/30", pulse: "" },
  LEVEL_2: { label: "Emergent (L2)", color: "text-[#9a3412] border-[#9a3412]/20 bg-orange-50/30", pulse: "" },
  LEVEL_3: { label: "Urgent (L3)", color: "text-[#854d0e] border-[#854d0e]/20 bg-amber-50/30", pulse: "" },
  LEVEL_4: { label: "Less Urgent (L4)", color: "text-[#166534] border-[#166534]/20 bg-green-50/30", pulse: "" },
  LEVEL_5: { label: "Non-Urgent (L5)", color: "text-[#1e40af] border-[#1e40af]/20 bg-blue-50/30", pulse: "" },
};

export default function ERDashboard() {
  const [admissions, setAdmissions] = useState<ERAdmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admissions/er");
      if (res.ok) {
        const data = await res.json();
        setAdmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch ER queue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const calculateWaitTime = (admittedAt: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(admittedAt).getTime()) / 60000);
    if (diff < 60) return `${diff}m`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div className="max-w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Emergency Clinical Registry</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time Status Monitoring & Triage Coordination</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchQueue} disabled={loading} className="h-8 text-[9px] font-black uppercase tracking-widest border-slate-300">
            <RefreshCw className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
            Sync Records
          </Button>
          <Link href="/patients">
            <Button className="bg-[#0f172a] text-white h-8 px-6 text-[9px] font-black uppercase tracking-widest">
              <Plus className="h-3 w-3 mr-2" />
              Initialize Admission
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary - Minimal Institutional Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-200 divide-x divide-slate-200">
         {[
           { label: "Active Admissions", value: admissions.length, icon: Activity },
           { label: "Critical Priority", value: admissions.filter(a => ["LEVEL_1", "LEVEL_2"].includes(a.triageLevel)).length, icon: AlertTriangle },
           { label: "Institutional Wait", value: "14m", icon: Clock },
           { label: "Unit Capacity", value: "8/12", icon: Timer },
         ].map((stat, i) => (
           <div key={i} className="p-6 bg-white">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-[#0f172a] tracking-tighter leading-none">{stat.value}</p>
                <stat.icon className="h-4 w-4 text-slate-200" />
              </div>
           </div>
         ))}
      </div>

      {/* ER Queue Table - Swiss High Density */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-r border-slate-100">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-r border-slate-100">Patient Identification</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-r border-slate-100">Clinical Narrative</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-r border-slate-100">Vital Parameters</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-r border-slate-100">Duration</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Navigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.length > 0 ? admissions.map((adm) => {
                const config = triageConfig[adm.triageLevel];
                const latestVitals = adm.vitals[0];
                
                return (
                  <tr key={adm.id} className="hover:bg-[#fcfcfc] transition-colors group">
                    <td className="px-6 py-4 border-r border-slate-50">
                       <div className={cn(
                         "inline-flex items-center px-2 py-0.5 rounded-[1px] text-[8px] font-black uppercase tracking-widest border",
                         config.color
                       )}>
                         {config.label}
                       </div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="h-7 w-7 rounded-[1px] bg-slate-50 flex items-center justify-center text-slate-300 text-[9px] font-black border border-slate-100 group-hover:bg-[#0f172a] group-hover:text-white transition-colors">
                           {adm.patient.lastName[0]}{adm.patient.firstName[0]}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-[#0f172a] leading-none mb-1 uppercase tracking-tight">
                            {adm.patient.lastName}, {adm.patient.firstName}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            {adm.patient.gender[0]} • {new Date().getFullYear() - new Date(adm.patient.dateOfBirth).getFullYear()}Y • {adm.admissionId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-50">
                      <p className="text-[10px] font-bold text-slate-500 max-w-[180px] truncate uppercase tracking-tight">
                        {adm.chiefComplaint}
                      </p>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-50">
                      {latestVitals ? (
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-tighter">
                           <div className="flex items-center gap-1.5 text-slate-900">
                              <span className="text-slate-300">BP</span>
                              {latestVitals.bpSystolic}/{latestVitals.bpDiastolic}
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-900">
                              <span className="text-slate-300">TMP</span>
                              {latestVitals.temperature}°C
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-900">
                              <span className="text-slate-300">OXG</span>
                              {latestVitals.o2Saturation}%
                           </div>
                        </div>
                      ) : (
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r border-slate-50">
                      <div className="flex items-center gap-2 text-[#0f172a] font-black text-[10px] uppercase">
                        <Clock className="h-3 w-3 text-slate-200" />
                        {calculateWaitTime(adm.admittedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href={`/admissions/${adm.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-3 rounded-[1px] border-slate-200 text-[#0f172a] text-[8px] font-black uppercase tracking-[0.2em]">
                            Open Record
                          </Button>
                       </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="max-w-xs mx-auto">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">System State: No Active Admissions Detected</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
