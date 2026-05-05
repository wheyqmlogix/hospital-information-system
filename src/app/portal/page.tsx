"use client";

import { 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Bell
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PatientPortalPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-blue-100">
            <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, Juan</h1>
            <p className="text-slate-500">Your Health ID: <span className="font-medium text-slate-700">PT-8421</span></p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <Badge className="bg-blue-500/30 text-white border-blue-400/50">Next Appointment</Badge>
                <div>
                  <h3 className="text-3xl font-bold">May 12, 2026</h3>
                  <p className="text-blue-100 mt-1">10:30 AM with Dr. Sarah Wilson</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-100">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Cardiology Follow-up</span>
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <Calendar className="h-12 w-12 text-white/80" />
              </div>
            </div>
            <div className="mt-8 flex space-x-4">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">Reschedule</Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">Get Directions</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Blood Test (CBC)", date: "2 days ago", icon: FileText, color: "text-blue-600" },
              { name: "Chest X-Ray", date: "1 week ago", icon: Activity, color: "text-teal-600" },
            ].map((result, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-md bg-slate-50 ${result.color}`}>
                    <result.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{result.name}</p>
                    <p className="text-xs text-slate-500">{result.date}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            ))}
            <Button variant="link" className="w-full text-blue-600 text-sm">View All Records</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Pill className="mr-2 h-5 w-5 text-purple-600" />
              Active Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Amlodipine 5mg", schedule: "Once daily, morning", remaining: "12 days left" },
              { name: "Metformin 500mg", schedule: "Twice daily, after meals", remaining: "5 days left" },
            ].map((med, i) => (
              <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{med.name}</p>
                  <p className="text-xs text-slate-500">{med.schedule}</p>
                </div>
                <Badge variant="outline" className="bg-white">{med.remaining}</Badge>
              </div>
            ))}
            <Button className="w-full" variant="outline">Order Refill</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-600" />
              Health Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {[
                { title: "Hospital Discharge", subtitle: "St. Luke's Medical Center", date: "May 2, 2026", icon: CheckCircle2, color: "text-green-500" },
                { title: "Lab Results Ready", subtitle: "Diagnostic Center", date: "April 30, 2026", icon: FileCheck, color: "text-blue-500" },
                { title: "Specialist Consult", subtitle: "Dr. Robert Tan", date: "April 28, 2026", icon: User, color: "text-slate-500" },
              ].map((item, i) => (
                <div key={i} className="pl-8 relative">
                  <div className={`absolute left-0 top-1 p-1 rounded-full bg-white border-2 border-slate-100 ${item.color}`}>
                    <item.icon className="h-3 w-3" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">{item.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Missing imports
import { CheckCircle2, FileCheck } from "lucide-react";
