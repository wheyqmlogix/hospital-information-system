"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  BedDouble, 
  History, 
  Search, 
  Plus, 
  Filter,
  Download,
  Loader2,
  Building2,
  Clock,
  Activity,
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BedBoard } from "@/components/layout/bed-board";
import { ERWorkflowDialog } from "@/components/admissions/er-workflow-dialog";

const admissionStatusStyles = {
  ADMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  DISCHARGED: "bg-green-100 text-green-700 border-green-200",
  PENDING_BILLING: "bg-amber-100 text-amber-700 border-amber-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
  ER_RELEASED: "bg-purple-100 text-purple-700 border-purple-200",
  TRANSFERRED: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function AdmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("er");
  
  // ER Workflow State
  const [selectedERAdmission, setSelectedERAdmission] = useState<any>(null);
  const [isERDialogOpen, setIsERDialogOpen] = useState(false);

  const { data: admissions, isLoading, refetch } = useQuery({
    queryKey: ["admissions", activeTab === "census" ? "ADMITTED" : activeTab === "er" ? "ER" : "ALL"],
    queryFn: async () => {
      let url = "/api/admissions";
      if (activeTab === "census") url = "/api/admissions?status=ADMITTED&department=ADMITTING";
      else if (activeTab === "er") url = "/api/admissions?status=ADMITTED&department=ER";
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch admissions");
      return res.json();
    },
  });

  const filteredAdmissions = admissions?.filter((adm: any) => 
    `${adm.patient.firstName} ${adm.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    totalAdmitted: admissions?.filter((a: any) => a.status === "ADMITTED" && a.department === "ADMITTING").length || 0,
    erQueue: admissions?.filter((a: any) => a.status === "ADMITTED" && a.department === "ER").length || 0,
    pendingDischarge: admissions?.filter((a: any) => a.status === "PENDING_BILLING").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Admissions & Census</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Monitor inpatient flow and emergency room activity.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link 
            href="/admissions/new"
            className={cn(buttonVariants({ variant: "default" }), "flex-1 md:flex-none bg-red-600 hover:bg-red-700 shadow-md")}
          >
            <Plus className="h-4 w-4 mr-2" />
            ER Registration
          </Link>
          <Button variant="outline" className="flex-1 md:flex-none border-slate-200 text-slate-600">
            <Download className="h-4 w-4 mr-2" />
            Export Census
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Inpatients</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalAdmitted}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">ER Queue</p>
                <h3 className="text-3xl font-bold mt-1">{stats.erQueue}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Billing</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingDischarge}</h3>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="census" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-white border border-slate-200 h-10">
            <TabsTrigger value="census" className="data-[state=active]:bg-slate-100">
              <Users className="h-4 w-4 mr-2" />
              Inpatient Census
            </TabsTrigger>
            <TabsTrigger value="er" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
              <Activity className="h-4 w-4 mr-2" />
              ER Queue
            </TabsTrigger>
            <TabsTrigger value="bedboard" className="data-[state=active]:bg-slate-100">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Bed Board
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-100">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>
          
          {(activeTab !== "bedboard") && (
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by patient, room..." 
                className="pl-10 bg-white border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        <TabsContent value="census" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Refreshing census...</p>
                </div>
              ) : filteredAdmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Room/Bed</TableHead>
                        <TableHead className="hidden sm:table-cell">Diagnosis</TableHead>
                        <TableHead className="hidden md:table-cell">Admitted At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmissions.map((adm: any) => (
                        <TableRow key={adm.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <Link href={`/patients/${adm.patient.id}`} className="group">
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 group-hover:underline">
                                {adm.patient.firstName} {adm.patient.lastName}
                              </p>
                              <p className="text-xs text-slate-500">{adm.patient.patientId}</p>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-100 border-slate-200">
                              <Building2 className="h-3 w-3 mr-1 text-slate-500" />
                              {adm.roomNumber} {adm.bed?.bedNumber && `- ${adm.bed.bedNumber}`}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <p className="text-sm text-slate-600 truncate max-w-[200px]">
                              {adm.admittingDiagnosis}
                            </p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm text-slate-600">
                              {new Date(adm.admittedAt).toLocaleDateString()}
                              <p className="text-[10px] text-slate-400">
                                {new Date(adm.admittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link 
                              href={`/patients/${adm.patient.id}`}
                              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-blue-600")}
                            >
                              Details
                              <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center py-12">
                  <ClipboardList className="h-12 w-12 text-slate-200 mb-4" />
                  <p className="text-slate-500">No active inpatients found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="er" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Updating ER queue...</p>
                </div>
              ) : filteredAdmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-red-50/50">
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>ER Bay</TableHead>
                        <TableHead className="hidden sm:table-cell">Diagnosis</TableHead>
                        <TableHead className="hidden md:table-cell">Waiting Time</TableHead>
                        <TableHead className="text-right">Workflow</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmissions.map((adm: any) => {
                        const waitingMs = new Date().getTime() - new Date(adm.admittedAt).getTime();
                        const waitingMins = Math.floor(waitingMs / (1000 * 60));
                        
                        return (
                          <TableRow key={adm.id} className="hover:bg-red-50/10 transition-colors border-l-2 border-l-transparent hover:border-l-red-500">
                            <TableCell>
                              <Link href={`/patients/${adm.patient.id}`} className="group">
                                <p className="font-bold text-slate-900 group-hover:text-red-600">
                                  {adm.patient.firstName} {adm.patient.lastName}
                                </p>
                                <p className="text-xs text-slate-500">{adm.patient.patientId}</p>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-red-50 border-red-100 text-red-700">
                                {adm.roomNumber}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <p className="text-sm text-slate-600 truncate max-w-[200px]">
                                {adm.admittingDiagnosis}
                              </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className={cn(
                                "flex items-center text-xs font-bold",
                                waitingMins > 120 ? "text-red-600" : waitingMins > 60 ? "text-amber-600" : "text-green-600"
                              )}>
                                <Clock className="h-3 w-3 mr-1" />
                                {waitingMins < 60 ? `${waitingMins}m` : `${Math.floor(waitingMins / 60)}h ${waitingMins % 60}m`}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                               <div className="flex justify-end gap-2">
                                  <Link 
                                    href={`/patients/${adm.patient.id}`}
                                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-slate-600")}
                                  >
                                    Chart
                                  </Link>
                                  <Button 
                                    onClick={() => {
                                      setSelectedERAdmission({
                                        id: adm.id,
                                        patientId: adm.patient.id,
                                        patientName: `${adm.patient.firstName} ${adm.patient.lastName}`,
                                        admittingDiagnosis: adm.admittingDiagnosis
                                      });
                                      setIsERDialogOpen(true);
                                    }}
                                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "bg-red-600 hover:bg-red-700")}
                                  >
                                    Process
                                  </Button>
                               </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-slate-200 mb-4" />
                  <p className="text-slate-500 font-medium">ER Queue is empty.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bedboard" className="mt-0">
          <BedBoard />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Loading history...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Dept</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Duration</TableHead>
                        <TableHead className="hidden md:table-cell">Discharged</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmissions.map((adm: any) => (
                        <TableRow key={adm.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <p className="font-bold text-slate-900">{adm.patient.firstName} {adm.patient.lastName}</p>
                            <p className="text-xs text-slate-500">{adm.patient.patientId}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="ghost" className="text-[10px] uppercase font-bold">
                              {adm.department}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", admissionStatusStyles[adm.status as keyof typeof admissionStatusStyles])}>
                              {adm.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-slate-600">
                            {adm.dischargedAt ? (
                              `${Math.max(1, Math.ceil((new Date(adm.dischargedAt).getTime() - new Date(adm.admittedAt).getTime()) / (1000 * 60 * 60 * 24)))} days`
                            ) : "Ongoing"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-slate-600">
                            {adm.dischargedAt ? new Date(adm.dischargedAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link 
                              href={`/patients/${adm.patient.id}`}
                              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                            >
                              View
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ER Workflow Dialog */}
      {selectedERAdmission && (
        <ERWorkflowDialog 
          open={isERDialogOpen} 
          onOpenChange={setIsERDialogOpen} 
          admission={selectedERAdmission}
        />
      )}
    </div>
  );
}


