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
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  staffId: string;
  role: string;
  specialization?: string;
  department?: {
    name: string;
  };
  user?: {
    email: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  _count?: {
    staff: number;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "departments">("staff");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    departmentId: string | null;
  }>({
    isOpen: false,
    departmentId: null,
  });

  const fetchData = async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        fetch("/api/admin/staff", { cache: 'no-store' }),
        fetch("/api/admin/departments", { cache: 'no-store' })
      ]);
      
      if (staffRes.ok) setStaff(await staffRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Department removed from registry");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to remove department");
      }
    } catch (error) {
      toast.error("Audit Failure: System Communication Error");
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [activeTab]);

  return (
    <div className="max-w-full space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Institutional Management</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Administrative Control, Human Resources & Unit Hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} className="h-9 px-6 rounded-sm border-slate-300 text-[9px] font-black uppercase tracking-widest">
            Registry Sync
          </Button>
          <Link href={activeTab === "staff" ? "/settings/staff/new" : "/settings/departments/new"}>
            <Button className="bg-[#0f172a] text-white h-9 px-6 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-2" />
              {activeTab === "staff" ? "Provision Staff Account" : "Initialize Department"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-0 border border-slate-200 bg-white p-0 rounded-sm overflow-hidden w-fit">
        <button
          onClick={() => setActiveTab("staff")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all border-r border-slate-100",
            activeTab === "staff" 
              ? "bg-slate-50 text-[#0f172a] border-b-2 border-b-[#0f172a]" 
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Staff Directory
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all",
            activeTab === "departments" 
              ? "bg-slate-50 text-[#0f172a] border-b-2 border-b-[#0f172a]" 
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
          )}
        >
          <Building2 className="h-3.5 w-3.5" />
          Unit Hierarchy
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === "staff" ? (
          <Card className="border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm">
            <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Institutional Personnel Registry</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official directory of clinical and operational staff.</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                <Input placeholder="Search Registry..." className="pl-9 h-8 bg-white border-slate-200 text-[10px] font-bold" />
              </div>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Personnel</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Operational Role</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Department</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">Credentials</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       <tr><td colSpan={5} className="px-8 py-20 text-center animate-pulse text-[9px] font-black text-slate-300 uppercase tracking-widest">Synchronizing Directory...</td></tr>
                    ) : staff.length === 0 ? (
                       <tr><td colSpan={5} className="px-8 py-20 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No Registered Personnel Found</td></tr>
                    ) : staff.map((member) => (
                      <tr key={member.id} className="hover:bg-[#fcfcfc] transition-colors group">
                        <td className="px-8 py-4 border-r border-slate-50">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-[1px] bg-[#0f172a] text-white flex items-center justify-center text-[10px] font-black mr-4 border border-white/10 group-hover:bg-black transition-colors">
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-[#0f172a] leading-none mb-1 uppercase tracking-tight">{member.firstName} {member.lastName}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{member.staffId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 border-r border-slate-50">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[1px] text-[8px] font-black bg-slate-50 text-[#0f172a] w-fit border border-slate-200 uppercase tracking-widest">
                              <ShieldCheck className="h-2.5 w-2.5 mr-1" />
                              {member.role}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{member.specialization || "General Clinical"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 border-r border-slate-50">
                          <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                            <Building2 className="h-3 w-3 mr-2 text-slate-300" />
                            {member.department?.name || "Unassigned Unit"}
                          </div>
                        </td>
                        <td className="px-8 py-4 border-r border-slate-50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{member.user?.email || "Account Pending"}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[1px] hover:bg-slate-50 transition-colors">
                            <MoreVertical className="h-3.5 w-3.5 text-slate-300" />
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
              <div className="col-span-full py-20 text-center animate-pulse text-[9px] font-black text-slate-300 uppercase tracking-widest">Synchronizing Unit Hierarchy...</div>
            ) : departments.length === 0 ? (
              <div className="col-span-full py-20 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No Institutional Units Configured</div>
            ) : departments.map((dept) => (
              <Card key={dept.id} className="border-slate-200 rounded-sm hover:border-[#0f172a]/20 transition-all bg-white group shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-10 w-10 rounded-[1px] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#0f172a] group-hover:text-white transition-colors">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/settings/departments/edit/${dept.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-[#0f172a] hover:bg-slate-50 transition-all">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setConfirmModal({ isOpen: true, departmentId: dept.id })}
                        className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 mb-6">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-tight leading-none">{dept.name}</h3>
                      <span className="text-[8px] font-black px-2 py-0.5 bg-[#0f172a] text-white rounded-[1px] uppercase tracking-[0.2em]">{dept.code}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{dept.description || "Institutional Unit Designation Pending."}</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <MapPin className="h-3 w-3 mr-3 text-slate-300" />
                      {dept.location || "Undesignated Area"}
                    </div>
                    <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Users className="h-3 w-3 mr-3 text-slate-300" />
                      {dept._count?.staff ?? 0} Registry Personnel
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, departmentId: null })}
        onConfirm={() => {
          if (confirmModal.departmentId) {
            deleteDepartment(confirmModal.departmentId);
          }
        }}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone and is only possible if no personnel are assigned."
        confirmText="Remove from Registry"
        variant="danger"
      />
    </div>
  );
}
