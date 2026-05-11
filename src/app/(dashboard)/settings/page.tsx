"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  ShieldCheck,
  MapPin,
  Briefcase
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "departments">("staff");
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        fetch("/api/admin/staff"),
        fetch("/api/admin/departments")
      ]);
      
      if (staffRes.ok) setStaff(await staffRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (error) {
      toast.error("Failed to load management data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Management</h1>
          <p className="text-slate-500 font-medium">Manage hospital structure, staff roles, and user access.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchData}>Refresh</Button>
          <Button variant="medical">
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "staff" ? "Add Staff Member" : "Create Department"}
          </Button>
        </div>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "staff" 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="h-4 w-4 mr-2" />
          Staff & Users
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "departments" 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 className="h-4 w-4 mr-2" />
          Departments
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === "staff" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
              <div>
                <CardTitle>Hospital Staff</CardTitle>
                <CardDescription>Directory of all registered medical and administrative personnel.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search staff..." className="pl-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                      <th className="px-6 py-4 font-bold">Staff Name</th>
                      <th className="px-6 py-4 font-bold">Role & Specialization</th>
                      <th className="px-6 py-4 font-bold">Department</th>
                      <th className="px-6 py-4 font-bold">User Account</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading staff directory...</td></tr>
                    ) : staff.length === 0 ? (
                       <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No staff members found.</td></tr>
                    ) : staff.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mr-3 border border-blue-100">
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{member.firstName} {member.lastName}</p>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{member.staffId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 w-fit mb-1 uppercase tracking-wide">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              {member.role}
                            </span>
                            <span className="text-slate-500 font-medium">{member.specialization || "General"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-slate-600 font-medium">
                            <Building2 className="h-3.5 w-3.5 mr-2 text-slate-400" />
                            {member.department?.name || "Unassigned"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600 font-medium">{member.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400">Loading departments...</div>
            ) : departments.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">No departments configured yet.</div>
            ) : departments.map((dept) => (
              <Card key={dept.id} className="medical-card-hover group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-1">
                      <CardTitle>{dept.name}</CardTitle>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-widest">{dept.code}</span>
                    </div>
                    <CardDescription className="line-clamp-2 min-h-[40px]">{dept.description || "No description provided."}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 pt-2 border-t border-slate-50">
                    <div className="flex items-center text-sm font-medium text-slate-600">
                      <MapPin className="h-4 w-4 mr-3 text-slate-400" />
                      {dept.location || "Not specified"}
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-600">
                      <Users className="h-4 w-4 mr-3 text-slate-400" />
                      {dept._count.staff} Staff Members
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
