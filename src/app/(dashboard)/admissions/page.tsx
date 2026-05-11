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
  LEVEL_1: { label: "Resuscitation", color: "bg-red-600", text: "text-white", pulse: "animate-pulse" },
  LEVEL_2: { label: "Emergent", color: "bg-orange-500", text: "text-white", pulse: "" },
  LEVEL_3: { label: "Urgent", color: "bg-amber-400", text: "text-amber-950", pulse: "" },
  LEVEL_4: { label: "Less Urgent", color: "bg-green-500", text: "text-white", pulse: "" },
  LEVEL_5: { label: "Non-Urgent", color: "bg-blue-500", text: "text-white", pulse: "" },
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
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ER Command Center</h1>
          </div>
          <p className="text-slate-500">Real-time emergency triage and queue management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchQueue} disabled={loading} className="rounded-xl border-slate-200">
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Link href="/patients">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 font-bold">
              <Plus className="h-5 w-5 mr-2" />
              New ER Admission
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Active Cases", value: admissions.length, icon: Activity, color: "text-blue-600" },
           { label: "Critical (L1/L2)", value: admissions.filter(a => ["LEVEL_1", "LEVEL_2"].includes(a.triageLevel)).length, icon: AlertTriangle, color: "text-red-600" },
           { label: "Avg Wait Time", value: "14m", icon: Clock, color: "text-amber-600" },
           { label: "Available Bays", value: "8/12", icon: Timer, color: "text-green-600" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden">
             <CardContent className="p-6 flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className={cn("p-4 rounded-2xl bg-slate-50", stat.color)}>
                   <stat.icon className="h-6 w-6" />
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      {/* ER Queue Table */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chief Complaint</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest Vitals</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wait Time</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {admissions.length > 0 ? admissions.map((adm) => {
                const config = triageConfig[adm.triageLevel];
                const latestVitals = adm.vitals[0];
                
                return (
                  <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className={cn(
                         "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                         config.color,
                         config.text,
                         config.pulse
                       )}>
                         {config.label}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                           <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {adm.patient.lastName}, {adm.patient.firstName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {adm.patient.gender[0]} • {new Date().getFullYear() - new Date(adm.patient.dateOfBirth).getFullYear()}Y
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-600 max-w-[200px] truncate">
                        {adm.chiefComplaint}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      {latestVitals ? (
                        <div className="flex items-center gap-4 text-xs font-bold">
                           <div className="flex items-center gap-1 text-red-600">
                              <HeartPulse className="h-3 w-3" />
                              {latestVitals.bpSystolic}/{latestVitals.bpDiastolic}
                           </div>
                           <div className="flex items-center gap-1 text-blue-600">
                              <Thermometer className="h-3 w-3" />
                              {latestVitals.temperature}°C
                           </div>
                           <div className="flex items-center gap-1 text-green-600">
                              <Activity className="h-3 w-3" />
                              {latestVitals.o2Saturation}%
                           </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Vitals</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Clock className="h-4 w-4 text-slate-300" />
                        {calculateWaitTime(adm.admittedAt)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Link href={`/admissions/${adm.id}`}>
                          <Button variant="ghost" size="sm" className="rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold">
                            Review
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                       </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="max-w-xs mx-auto opacity-20">
                       <Activity className="h-12 w-12 mx-auto mb-4" />
                       <p className="font-bold text-slate-900 uppercase tracking-widest">No Active ER Cases</p>
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
