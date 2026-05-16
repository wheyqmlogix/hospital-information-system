"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StaffForm } from "@/components/staff/staff-form";

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, deptRes] = await Promise.all([
          fetch(`/api/admin/staff/${id}`),
          fetch("/api/admin/departments")
        ]);

        if (!staffRes.ok) throw new Error("Staff member not found");
        
        setStaff(await staffRes.json());
        if (deptRes.ok) setDepartments(await deptRes.json());
      } catch (err) {
        console.error(err);
        router.push("/settings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  if (loading) return <div className="p-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Personnel Specification...</div>;
  if (!staff) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link 
          href="/settings" 
          className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#0f172a] transition-colors uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Settings Return
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight leading-none mb-3">Modify Personnel</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institutional Personnel Registry Update</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden bg-white">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="h-6 w-6 bg-[#0f172a]/10 rounded-sm flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-[#0f172a]" />
          </div>
          <h2 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest">Personnel Specification</h2>
        </div>
        <CardContent className="p-8">
          <StaffForm 
            initialData={staff}
            departments={departments}
            onSuccess={() => router.push("/settings")} 
            onCancel={() => router.push("/settings")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
