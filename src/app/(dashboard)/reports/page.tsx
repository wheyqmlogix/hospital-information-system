"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  BedDouble, 
  Activity, 
  AlertTriangle,
  ArrowLeft,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AHSRData {
  year: number;
  hospitalInfo: {
    totalBeds: number;
    totalPatientDays: number;
    occupancyRate: number;
    alos: number;
  };
  volume: {
    admissions: number;
    discharges: number;
    deaths: number;
  };
  morbidity: {
    code: string;
    description: string;
    count: number;
  }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<AHSRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/ahsr?year=${year}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [year]);

  if (loading && !data) return <div className="p-20 text-center animate-pulse uppercase text-[9px] font-black tracking-[0.2em] text-slate-400">Aggregating Institutional Statistics...</div>;

  return (
    <div className="max-w-full space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="h-3 w-3 mr-2" />
            Registry Return
          </Link>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none">
             DOH Statistical Analytics
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Annual Hospital Statistical Report (AHSR) Compliance</p>
        </div>

        <div className="flex items-center gap-2">
           <div className="bg-white p-1 rounded-sm border border-slate-200 flex items-center gap-2 px-3 h-9">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <Select value={year} onValueChange={setYear}>
                 <SelectTrigger className="border-none shadow-none h-7 w-28 focus:ring-0 text-[10px] font-black uppercase tracking-widest bg-transparent">
                    <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                    <SelectItem value="2024" className="text-[10px] font-bold uppercase">CY 2024</SelectItem>
                    <SelectItem value="2025" className="text-[10px] font-bold uppercase">CY 2025</SelectItem>
                    <SelectItem value="2026" className="text-[10px] font-bold uppercase">CY 2026</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <Button variant="outline" className="h-9 px-6 rounded-sm border-slate-300 text-[9px] font-black uppercase tracking-widest">
              <Download className="h-3.5 w-3.5 mr-2" />
              Export XML
           </Button>
           <Button className="bg-[#0f172a] text-white h-9 px-8 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-sm">
              <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
              Generate AHSR
           </Button>
        </div>
      </div>

      {/* Main Stats Grid - Institutional Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-slate-200 divide-x divide-slate-200 bg-white">
         {[
           { label: "Total Admissions", value: data?.volume.admissions, icon: Users, color: "text-[#0f172a]" },
           { label: "Bed Occupancy", value: `${data?.hospitalInfo.occupancyRate}%`, icon: BedDouble, color: "text-[#0f172a]" },
           { label: "Mean Stay (Days)", value: data?.hospitalInfo.alos, icon: Activity, color: "text-[#0f172a]" },
           { label: "Mortality Registry", value: data?.volume.deaths, icon: AlertTriangle, color: "text-[#991b1b]" },
         ].map((stat, i) => (
           <div key={i} className="p-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className={cn("text-3xl font-black tracking-tighter leading-none", stat.color)}>{stat.value}</span>
                <stat.icon className="h-4 w-4 text-slate-200" />
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Top Causes of Morbidity */}
         <div className="lg:col-span-2">
            <Card className="border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
               <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Institutional Morbidity Analysis</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Based on validated ICD-10 clinical coding records.</p>
               </div>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-white border-b border-slate-100">
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-20 border-r border-slate-50 text-center">Rank</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-28 border-r border-slate-50">ICD-10 Code</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Clinical Identification</th>
                              <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Case Vol.</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {data?.morbidity.map((item, i) => (
                             <tr key={i} className="hover:bg-[#fcfcfc] transition-colors">
                                <td className="px-8 py-4 border-r border-slate-50 text-center">
                                   <span className="text-[10px] font-black text-slate-300">
                                      {String(i + 1).padStart(2, '0')}
                                   </span>
                                </td>
                                <td className="px-8 py-4 border-r border-slate-50">
                                   <span className="text-[10px] font-black text-[#0f172a] bg-slate-50 px-2 py-0.5 rounded-[1px] border border-slate-100 uppercase">{item.code}</span>
                                </td>
                                <td className="px-8 py-4 border-r border-slate-50">
                                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{item.description}</span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                   <span className="text-[11px] font-black text-[#0f172a] tracking-tighter">{item.count}</span>
                                </td>
                             </tr>
                           ))}
                           {data?.morbidity.length === 0 && (
                             <tr>
                                <td colSpan={4} className="py-24 text-center">
                                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">No validated diagnostic data found for selected period.</p>
                                </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Efficiency & Capacity */}
         <div className="space-y-6">
            <Card className="border-slate-900 bg-[#0f172a] text-white rounded-sm overflow-hidden shadow-xl">
               <div className="px-8 py-5 border-b border-white/10">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Capacity Index</h2>
               </div>
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Licensed Bed Units</p>
                        <span className="text-3xl font-black tracking-tighter">{data?.hospitalInfo.totalBeds}</span>
                     </div>
                     <div className="h-1.5 bg-white/10 rounded-[1px] overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-1000" 
                          style={{ width: `${Math.min(data?.hospitalInfo.occupancyRate || 0, 100)}%` }} 
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-0 border-t border-white/10 -mx-8">
                     <div className="p-6 border-r border-white/10">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry Discharges</p>
                        <p className="text-2xl font-black tracking-tighter text-white">{data?.volume.discharges}</p>
                     </div>
                     <div className="p-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient Accrual Days</p>
                        <p className="text-2xl font-black tracking-tighter text-white">{data?.hospitalInfo.totalPatientDays}</p>
                     </div>
                  </div>

                  <div className="bg-white border border-white/10 p-5 rounded-sm space-y-5">
                     <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-[1px] bg-slate-50 flex items-center justify-center border border-slate-100">
                           <RefreshCw className={cn("h-3.5 w-3.5 text-[#0f172a]", loading && "animate-spin")} />
                        </div>
                        <p className="text-[9px] font-black text-[#0f172a] uppercase tracking-widest">Efficiency Parameters</p>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between text-[9px] font-black uppercase border-b border-slate-50 pb-2">
                           <span className="text-slate-400 tracking-wider">Bed Turnover</span>
                           <span className="text-[#0f172a]">1.4x Index</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase">
                           <span className="text-slate-400 tracking-wider">Gross Fatality</span>
                           <span className="text-[#0f172a]">{data?.volume.admissions ? ((data?.volume.deaths / data?.volume.admissions) * 100).toFixed(1) : 0}%</span>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="p-8 bg-slate-50 border border-slate-200 rounded-sm space-y-4">
               <ShieldCheck className="h-6 w-6 text-[#0f172a]" />
               <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.1em]">KMITS Compliance Notice</h4>
               <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                  Validated for DOH-KMITS technical standards. All records must feature primary ICD-10 categorization before institutional submission.
               </p>
               <Button variant="link" className="p-0 h-auto text-[#0f172a] font-black text-[9px] uppercase tracking-widest underline underline-offset-4 decoration-1">
                  Institutional Protocols
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
