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

  if (loading && !data) return <div className="p-20 text-center animate-pulse">Aggregating Statistical Data...</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <BarChart3 className="h-8 w-8 text-blue-600" />
             DOH Statistical Reporting
          </h1>
          <p className="text-slate-500 font-medium">Annual Hospital Statistical Report (AHSR) compliance module.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <Select value={year} onValueChange={setYear}>
                 <SelectTrigger className="border-none shadow-none h-10 w-32 focus:ring-0 font-bold">
                    <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl">
                    <SelectItem value="2024">CY 2024</SelectItem>
                    <SelectItem value="2025">CY 2025</SelectItem>
                    <SelectItem value="2026">CY 2026</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <Button variant="outline" className="rounded-2xl border-slate-200 font-bold h-12 px-6">
              <Download className="h-4 w-4 mr-2" />
              Export XML
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 font-bold h-12 px-8">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Generate AHSR
           </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Total Admissions", value: data?.volume.admissions, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
           { label: "Bed Occupancy Rate", value: `${data?.hospitalInfo.occupancyRate}%`, icon: BedDouble, color: "text-purple-600", bg: "bg-purple-50" },
           { label: "Avg Length of Stay", value: `${data?.hospitalInfo.alos} Days`, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
           { label: "Total Mortality", value: data?.volume.deaths, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden">
             <CardContent className="p-8">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                   <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Top Causes of Morbidity */}
         <div className="lg:col-span-2">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                  <CardTitle className="text-lg font-bold">Top 10 Causes of Morbidity</CardTitle>
                  <CardDescription>Based on primary ICD-10 clinical coding for the selected period.</CardDescription>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-slate-50">
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-20">Rank</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24">ICD-10</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis Description</th>
                              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Cases</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {data?.morbidity.map((item, i) => (
                             <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                   <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                      {i + 1}
                                   </span>
                                </td>
                                <td className="px-8 py-5 font-mono text-xs font-bold text-blue-600">{item.code}</td>
                                <td className="px-8 py-5 font-bold text-slate-700">{item.description}</td>
                                <td className="px-8 py-5 text-right font-black text-slate-900">{item.count}</td>
                             </tr>
                           ))}
                           {data?.morbidity.length === 0 && (
                             <tr>
                                <td colSpan={4} className="py-20 text-center">
                                   <div className="max-w-xs mx-auto opacity-20">
                                      <Activity className="h-12 w-12 mx-auto mb-4" />
                                      <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">No coded cases found for this period.</p>
                                   </div>
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
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-slate-900 text-white">
               <CardHeader className="border-b border-white/10 px-8 py-6">
                  <CardTitle className="text-lg font-bold">Facility Capacity</CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Implemented Beds</p>
                        <span className="text-2xl font-black">{data?.hospitalInfo.totalBeds}</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${Math.min(data?.hospitalInfo.occupancyRate || 0, 100)}%` }} 
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Discharges</p>
                        <p className="text-xl font-black text-emerald-400">{data?.volume.discharges}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Days</p>
                        <p className="text-xl font-black text-purple-400">{data?.hospitalInfo.totalPatientDays}</p>
                     </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                           <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </div>
                        <p className="text-xs font-bold text-slate-300">Live Efficiency Index</p>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                           <span className="text-slate-500 font-medium">Turnover Rate</span>
                           <span className="font-bold">1.4x</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-slate-500 font-medium">Death Rate</span>
                           <span className="font-bold">{data?.volume.admissions ? ((data?.volume.deaths / data?.volume.admissions) * 100).toFixed(1) : 0}%</span>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4">
               <ShieldCheck className="h-8 w-8 text-blue-600" />
               <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight">DOH Licensing Readiness</h4>
               <p className="text-xs text-blue-600 leading-relaxed font-medium">
                  This report follows the DOH-KMITS technical standards for electronic health records submission. Ensure all admissions have primary ICD-10 coding for 100% accuracy.
               </p>
               <Button variant="link" className="p-0 h-auto text-blue-700 font-bold text-xs uppercase tracking-widest">
                  View Submission Guide
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
