"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Filter,
  Download,
  FileText,
  Edit2,
  Loader2
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const statusStyles = {
  INPATIENT: "bg-blue-100 text-blue-700 border-blue-200",
  OUTPATIENT: "bg-teal-100 text-teal-700 border-teal-200",
  EMERGENCY: "bg-red-100 text-red-700 border-red-200",
  OBSERVATION: "bg-amber-100 text-amber-700 border-amber-200",
  RECOVERED: "bg-green-100 text-green-700 border-green-200",
  DECEASED: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });

  const filteredPatients = patients.filter((patient: any) => 
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-slate-500 mt-1">Manage and track patient records and medical history.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="hidden md:flex">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push("/patients/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Status: All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-slate-500">Loading patients...</p>
              </div>
            ) : isError ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                <p className="text-red-500 font-medium text-lg">Failed to load patients</p>
                <p className="text-slate-500 mt-2">Please check your internet connection and try again.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Age/Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient: any) => (
                      <TableRow key={patient.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-slate-900 text-xs md:text-sm">{patient.patientId}</TableCell>
                        <TableCell>
                          <Link href={`/patients/${patient.id}`} className="flex items-center space-x-2 md:space-x-3 group">
                            <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                              <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] md:text-xs font-medium">
                                {patient.firstName[0]}{patient.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900 group-hover:text-blue-600 group-hover:underline text-xs md:text-sm truncate max-w-[100px] md:max-w-none">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-slate-600 hidden sm:table-cell text-xs md:text-sm">
                          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}y / {patient.gender}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px] md:text-xs px-1.5 py-0 md:px-2 md:py-0.5", statusStyles[patient.status as keyof typeof statusStyles])}>
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 hidden md:table-cell text-xs md:text-sm">
                          {new Date(patient.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1 md:space-x-2">
                            <Link 
                              href={`/patients/${patient.id}`}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "icon" }),
                                "h-7 w-7 md:h-8 md:w-8 text-slate-400 hover:text-blue-600"
                              )}
                            >
                              <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Link>
                            <Link 
                              href={`/patients/${patient.id}/edit`}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "icon" }),
                                "h-7 w-7 md:h-8 md:w-8 text-slate-400 hover:text-slate-600"
                              )}
                            >
                              <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-slate-500 text-xs md:text-sm">
                        No patients found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          {!isLoading && !isError && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <p>Showing {filteredPatients.length} of {patients.length} patients</p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
