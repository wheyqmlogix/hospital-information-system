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
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cliniq HIS</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to access the hospital information system.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input
                  type="email"
                  required
                  placeholder="admin@cliniq.com"
                  className="pl-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-100 transition-all transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Sign In to Cliniq"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50">
             <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Dev Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                   <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <p className="text-slate-400">Admin</p>
                      <p>admin@cliniq.com / admin123</p>
                   </div>
                   <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <p className="text-slate-400">Doctor</p>
                      <p>doctor@cliniq.com / doctor123</p>
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
