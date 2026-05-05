"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, User, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const mockRooms = [
  { 
    number: "Room 101", 
    type: "Private", 
    floor: "1st Floor",
    beds: [
      { id: "B1", number: "101-A", status: "OCCUPIED", patient: "Juan Dela Cruz" },
    ]
  },
  { 
    number: "Room 102", 
    type: "Semi-Private", 
    floor: "1st Floor",
    beds: [
      { id: "B2", number: "102-A", status: "AVAILABLE", patient: null },
      { id: "B3", number: "102-B", status: "OCCUPIED", patient: "Maria Santos" },
    ]
  },
  { 
    number: "Ward A", 
    type: "Ward", 
    floor: "2nd Floor",
    beds: [
      { id: "B4", number: "W-A1", status: "AVAILABLE", patient: null },
      { id: "B5", number: "W-A2", status: "OCCUPIED", patient: "Pedro Penduko" },
      { id: "B6", number: "W-A3", status: "MAINTENANCE", patient: null },
      { id: "B7", number: "W-A4", status: "AVAILABLE", patient: null },
    ]
  },
  { 
    number: "ICU 01", 
    type: "ICU", 
    floor: "3rd Floor",
    beds: [
      { id: "B8", number: "ICU-1", status: "OCCUPIED", patient: "John Doe" },
    ]
  },
];

export function BedBoard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-700 border-green-200";
      case "OCCUPIED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "MAINTENANCE": return "bg-amber-100 text-amber-700 border-amber-200";
      case "CLEANING": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockRooms.map((room) => (
        <Card key={room.number} className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-slate-900">{room.number}</CardTitle>
              <Badge variant="outline" className="text-[10px] uppercase font-bold bg-white">
                {room.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {room.beds.map((bed) => (
                <div key={bed.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md ${bed.status === "OCCUPIED" ? "bg-blue-50" : "bg-slate-50"}`}>
                      <BedDouble className={`h-4 w-4 ${bed.status === "OCCUPIED" ? "text-blue-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{bed.number}</p>
                      {bed.patient ? (
                        <p className="text-[10px] text-slate-500 flex items-center">
                          <User className="h-2.5 w-2.5 mr-1" />
                          {bed.patient}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400">Vacant</p>
                      )}
                    </div>
                  </div>
                  <Badge className={`text-[9px] px-1.5 h-4 font-bold border ${getStatusColor(bed.status)}`}>
                    {bed.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
