"use client";

import { useState, useEffect } from "react";
import { 
  Home, 
  User, 
  Search, 
  Map as MapIcon, 
  Grid, 
  Clock, 
  Activity,
  ChevronRight,
  Info,
  History,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Bed {
  id: string;
  name: string;
  status: "VACANT" | "OCCUPIED" | "MAINTENANCE" | "CLEANING";
  currentAdmission?: {
    id: string;
    patient: {
      firstName: string;
      lastName: string;
      gender: string;
    }
  } | null;
}

interface Room {
  id: string;
  name: string;
  beds: Bed[];
}

interface Ward {
  id: string;
  name: string;
  description: string;
  rooms: Room[];
}

export default function BedManagementPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  const fetchWards = async () => {
    try {
      const res = await fetch("/api/admin/wards");
      if (res.ok) {
        const data = await res.json();
        setWards(data);
        if (data.length > 0 && !selectedWardId) {
          setSelectedWardId(data[0].id);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse">Scanning Hospital Capacity...</div>;

  const selectedWard = wards.find(w => w.id === selectedWardId);
  
  const stats = {
    total: wards.reduce((acc, w) => acc + w.rooms.reduce((acc2, r) => acc2 + r.beds.length, 0), 0),
    vacant: wards.reduce((acc, w) => acc + w.rooms.reduce((acc2, r) => acc2 + r.beds.filter(b => b.status === 'VACANT').length, 0), 0),
    occupied: wards.reduce((acc, w) => acc + w.rooms.reduce((acc2, r) => acc2 + r.beds.filter(b => b.status === 'OCCUPIED').length, 0), 0),
    maintenance: wards.reduce((acc, w) => acc + w.rooms.reduce((acc2, r) => acc2 + r.beds.filter(b => b.status === 'MAINTENANCE' || b.status === 'CLEANING').length, 0), 0),
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <MapIcon className="h-8 w-8 text-blue-600" />
             Bed Management Command
          </h1>
          <p className="text-slate-500 font-medium">Visual facility mapping and real-time occupancy tracking.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
           <Button variant="ghost" size="sm" className="rounded-xl text-xs font-black uppercase tracking-widest bg-white shadow-sm text-blue-600">
              <Grid className="h-4 w-4 mr-2" />
              Floor Map
           </Button>
           <Button variant="ghost" size="sm" className="rounded-xl text-xs font-black uppercase tracking-widest text-slate-400">
              <History className="h-4 w-4 mr-2" />
              Analytics
           </Button>
        </div>
      </div>

      {/* Global Occupancy Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Beds", value: stats.total, color: "text-slate-900", bg: "bg-white" },
          { label: "Available", value: stats.vacant, color: "text-green-600", bg: "bg-green-50/50" },
          { label: "Occupied", value: stats.occupied, color: "text-blue-600", bg: "bg-blue-50/50" },
          { label: "Maint/Cleaning", value: stats.maintenance, color: "text-amber-600", bg: "bg-amber-50/50" },
        ].map((stat, i) => (
          <Card key={i} className={cn("border-none shadow-sm rounded-[2rem] overflow-hidden", stat.bg)}>
            <CardContent className="p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <span className={cn("text-3xl font-black", stat.color)}>{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Ward Navigation */}
        <div className="space-y-4">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Facility Wards</p>
           {wards.map((ward) => {
             const occupiedCount = ward.rooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'OCCUPIED').length, 0);
             const totalCount = ward.rooms.reduce((acc, r) => acc + r.beds.length, 0);
             const isActive = selectedWardId === ward.id;

             return (
               <button
                 key={ward.id}
                 onClick={() => setSelectedWardId(ward.id)}
                 className={cn(
                   "w-full text-left p-6 rounded-[2rem] transition-all flex items-center justify-between group",
                   isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white hover:bg-slate-50 text-slate-600"
                 )}
               >
                 <div className="space-y-1">
                   <p className="font-bold text-lg leading-tight">{ward.name}</p>
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full transition-all", isActive ? "bg-blue-400" : "bg-blue-600")} 
                           style={{ width: `${(occupiedCount / totalCount) * 100}%` }}
                         />
                      </div>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest", isActive ? "text-slate-400" : "text-slate-400")}>
                        {occupiedCount}/{totalCount} Occupied
                      </span>
                   </div>
                 </div>
                 <ChevronRight className={cn("h-5 w-5 transition-transform", isActive ? "text-blue-400" : "text-slate-200 group-hover:translate-x-1")} />
               </button>
             );
           })}
        </div>

        {/* Visual Map Area */}
        <div className="lg:col-span-3 space-y-8">
           {selectedWard ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedWard.name}</h2>
                        <p className="text-slate-500 text-sm font-medium">{selectedWard.description}</p>
                      </div>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-600" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupied</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maint</span>
                         </div>
                      </div>
                   </div>

                   {/* Room Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {selectedWard.rooms.map((room) => (
                        <div key={room.id} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2">{room.name}</h3>
                           
                           {/* Bed Grid in Room */}
                           <div className="grid grid-cols-2 gap-4">
                              {room.beds.map((bed) => {
                                const isOccupied = bed.status === 'OCCUPIED';
                                const isVacant = bed.status === 'VACANT';
                                const isMaint = bed.status === 'MAINTENANCE' || bed.status === 'CLEANING';

                                return (
                                  <div 
                                    key={bed.id}
                                    className={cn(
                                      "relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group",
                                      isVacant ? "bg-white border-green-100 hover:border-green-500 cursor-pointer" :
                                      isOccupied ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" :
                                      "bg-amber-50 border-amber-100 text-amber-600"
                                    )}
                                  >
                                     <div className={cn(
                                       "h-10 w-10 rounded-xl flex items-center justify-center mb-1 transition-colors",
                                       isVacant ? "bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white" :
                                       isOccupied ? "bg-white/20 text-white" :
                                       "bg-amber-100 text-amber-600"
                                     )}>
                                        <Home className="h-5 w-5" />
                                     </div>
                                     <span className="text-[10px] font-black uppercase tracking-widest">{bed.name}</span>
                                     
                                     {isOccupied && bed.currentAdmission && (
                                       <div className="text-center">
                                          <p className="text-[10px] font-bold leading-tight line-clamp-1 opacity-90">
                                            {bed.currentAdmission.patient.lastName}
                                          </p>
                                          <Link 
                                            href={`/admissions/${bed.currentAdmission.id}`}
                                            className="text-[8px] font-black uppercase tracking-tighter mt-1 hover:underline block"
                                          >
                                            View Clinical
                                          </Link>
                                       </div>
                                     )}

                                     {!isOccupied && (
                                       <span className={cn(
                                         "text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded",
                                         isVacant ? "text-green-600 bg-green-50 group-hover:bg-green-500 group-hover:text-white" : "text-amber-600 bg-amber-100"
                                       )}>
                                         {bed.status}
                                       </span>
                                     )}
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Info className="h-6 w-6" />
                   </div>
                   <div>
                      <h4 className="font-bold text-blue-900">Bed Assignment Protocol</h4>
                      <p className="text-sm text-blue-700/80 leading-relaxed mt-1">
                        To assign a patient to a vacant bed, use the **Register Admission** button in the patient profile. 
                        Beds marked as "Cleaning" are automatically updated from the housekeeping module once ready.
                      </p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex items-center justify-center py-40 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="text-center max-w-xs opacity-20">
                   <Activity className="h-12 w-12 mx-auto mb-4" />
                   <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">Select a ward to view floor map.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
