"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  BedDouble, 
  Loader2, 
  LayoutGrid, 
  Building2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RoomsSettingsPage() {
  const { data: rooms, isLoading, refetch } = useQuery({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Room & Bed Management</h1>
          <p className="text-slate-500">Configure hospital wards, rooms, and bed allocations.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link 
            href="/settings/rooms/new"
            className={cn(buttonVariants(), "bg-blue-600 hover:bg-blue-700")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Room
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading hospital layout...</p>
        </div>
      ) : rooms?.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Rooms Configured</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2">
              Start by setting up your hospital floors and rooms.
            </p>
            <Link 
              href="/settings/rooms/new"
              className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
            >
              Setup First Room
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms?.map((room: any) => (
            <Card key={room.id} className="border-none shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg font-bold text-slate-900">{room.roomNumber}</CardTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {room.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-[10px]">{room.floor || "No Floor"}</CardDescription>
                </div>
                <LayoutGrid className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <div className="space-y-3">
                  {room.beds.map((bed: any) => (
                    <div key={bed.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-blue-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-md ${bed.status === "OCCUPIED" ? "bg-blue-50" : "bg-slate-50"}`}>
                          <BedDouble className={`h-4 w-4 ${bed.status === "OCCUPIED" ? "text-blue-600" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{bed.bedNumber}</p>
                          {bed.patient ? (
                            <p className="text-[10px] text-blue-600 font-medium">
                              {bed.patient.firstName} {bed.patient.lastName}
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
      )}
    </div>
  );
}
