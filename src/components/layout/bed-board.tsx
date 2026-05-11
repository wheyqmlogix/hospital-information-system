"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, User, Loader2, Building2, MapPin } from "lucide-react";

interface BedWithPatient {
  id: string;
  bedNumber: string;
  status: string;
  patient?: {
    firstName: string;
    lastName: string;
  } | null;
}

interface RoomWithBeds {
  id: string;
  roomNumber: string;
  type: string;
  floor?: string | null;
  beds: BedWithPatient[];
}

export function BedBoard() {
  const { data: rooms, isLoading } = useQuery<RoomWithBeds[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch("/api/rooms");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return res.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-700 border-green-200";
      case "OCCUPIED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "MAINTENANCE": return "bg-amber-100 text-amber-700 border-amber-200";
      case "CLEANING": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading bed board...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rooms?.map((room) => (
        <Card key={room.id} className="border-none shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                  {room.roomNumber}
                </CardTitle>
                <div className="flex items-center mt-0.5 text-[10px] text-slate-500">
                  <MapPin className="h-2.5 w-2.5 mr-1" />
                  {room.floor || "Unassigned Floor"}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold bg-white px-2 py-0">
                {room.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            <div className="space-y-3">
              {room.beds?.length > 0 ? (
                room.beds.map((bed) => (
                  <div key={bed.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-blue-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${bed.status === "OCCUPIED" ? "bg-blue-50" : "bg-slate-50"}`}>
                        <BedDouble className={`h-4 w-4 ${bed.status === "OCCUPIED" ? "text-blue-600" : "text-slate-400"}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{bed.bedNumber}</p>
                        {bed.patient ? (
                          <p className="text-[10px] text-slate-500 flex items-center mt-0.5">
                            <User className="h-2.5 w-2.5 mr-1 text-blue-500" />
                            {bed.patient.firstName} {bed.patient.lastName}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5">Vacant</p>
                        )}
                      </div>
                    </div>
                    <Badge className={`text-[9px] px-1.5 h-4 font-bold border-none shadow-none ${getStatusColor(bed.status)}`}>
                      {bed.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 text-center py-4 italic">No beds assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


