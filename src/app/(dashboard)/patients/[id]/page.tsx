import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  IdCard, 
  CreditCard,
  Droplets,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id }
  });

  if (!patient) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            href="/patients" 
            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
               {patient.lastName}, {patient.firstName} {patient.middleName} {patient.extensionName}
             </h1>
             <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
               {patient.status}
             </span>
          </div>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">{patient.patientId}</p>
        </div>

        <div className="flex items-center gap-3">
           <Link href={`/patients/${patient.id}/admit`}>
              <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 font-bold px-6">
                 <Droplets className="h-4 w-4 mr-2" />
                 Admit to ER
              </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-8">
           <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
             <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <User className="h-5 w-5 text-blue-600" />
                   Personal Information
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</p>
                   <p className="font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-300" />
                      {new Date(patient.dateOfBirth).toLocaleDateString("en-PH", { dateStyle: "long" })}
                   </p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</p>
                   <p className="font-bold text-slate-900">{patient.gender}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Civil Status</p>
                   <p className="font-bold text-slate-900">{patient.civilStatus || "Not Specified"}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Type</p>
                   <p className="font-bold text-red-600 flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      {patient.bloodType || "Unknown"}
                   </p>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
             <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <MapPin className="h-5 w-5 text-blue-600" />
                   Residential Address
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barangay</p>
                      <p className="font-bold text-slate-900">{patient.barangay || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City / Municipality</p>
                      <p className="font-bold text-slate-900">{patient.city || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Province</p>
                      <p className="font-bold text-slate-900">{patient.province || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zip Code</p>
                      <p className="font-bold text-slate-900">{patient.zipCode || "N/A"}</p>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
             <CardHeader className="bg-blue-600 text-white px-8 py-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <ShieldCheck className="h-5 w-5" />
                   Health IDs
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">PhilHealth PIN</p>
                      <p className="font-mono font-bold text-blue-700">{patient.philHealthPIN || "Not Enrolled"}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">National ID</p>
                      <p className="font-mono font-bold text-slate-700">{patient.nationalId || "Not Provided"}</p>
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm rounded-3xl overflow-hidden border-l-4 border-l-amber-500">
             <CardHeader className="px-8 py-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-700">
                   <AlertTriangle className="h-5 w-5" />
                   Allergies
                </CardTitle>
             </CardHeader>
             <CardContent className="px-8 pb-8">
                <p className="text-slate-600 font-medium">
                   {patient.allergies || "No known allergies recorded."}
                </p>
             </CardContent>
           </Card>

           <div className="bg-slate-100 rounded-3xl p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Compliance</p>
              <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                 <ShieldCheck className="h-4 w-4" />
                 DPA COMPLIANT
              </div>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                 Consent timestamp: {patient.dpaConsentTimestamp ? new Date(patient.dpaConsentTimestamp).toLocaleString() : "N/A"}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
