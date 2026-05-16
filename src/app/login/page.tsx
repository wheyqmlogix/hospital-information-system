"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Activity, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { realLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await res.json();
      realLogin(data.user);
      toast.success("Welcome back!");
      router.push("/admissions");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-[#0f172a] rounded-sm flex items-center justify-center mx-auto mb-6 border border-[#0f172a]">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Cliniq HIS</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Sign in to access the hospital information system.</p>
        </div>

        <div className="bg-white p-8 rounded-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input
                  type="email"
                  required
                  placeholder="admin@cliniq.com"
                  className="pl-12 h-12 rounded-sm border border-slate-200 focus:border-[#0f172a] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-12 h-12 rounded-sm border border-slate-200 focus:border-[#0f172a] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-sm bg-[#0f172a] hover:bg-black text-white font-black uppercase tracking-[0.15em] text-sm transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Cliniq"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
             <div className="p-4 bg-slate-50 rounded-sm border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">Dev Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-600">
                   <div className="bg-white p-2 rounded-[1px] border border-slate-200">
                      <p className="text-slate-400 uppercase tracking-widest mb-1">Admin</p>
                      <p className="text-[#0f172a]">admin@cliniq.com / admin123</p>
                   </div>
                   <div className="bg-white p-2 rounded-[1px] border border-slate-200">
                      <p className="text-slate-400 uppercase tracking-widest mb-1">Doctor</p>
                      <p className="text-[#0f172a]">doctor@cliniq.com / doctor123</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          &copy; 2026 Rose & Co. Healthcare Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
