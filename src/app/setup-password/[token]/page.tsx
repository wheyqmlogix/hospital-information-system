"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function SetupPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Password set successfully");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to set password");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-200 shadow-xl rounded-sm overflow-hidden bg-white">
          <CardContent className="p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-[#0f172a] uppercase tracking-widest">Account Activated</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your institutional credentials are now active.</p>
            </div>
            <Button 
              onClick={() => router.push("/login")}
              className="w-full bg-[#0f172a] hover:bg-black text-white h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg rounded-sm"
            >
              Proceed to Login
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl rounded-sm overflow-hidden bg-white">
        <div className="px-10 py-8 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-[#0f172a] text-white flex items-center justify-center rounded-sm">
              <Lock className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-black text-[#0f172a] uppercase tracking-widest">Setup Password</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete your institutional profile activation.</p>
        </div>
        
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                New Password
              </Label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="h-11 text-[12px] font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                Confirm Password
              </Label>
              <Input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="h-11 text-[12px] font-bold"
                required
              />
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm flex gap-3">
              <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                By setting your password, you acknowledge and agree to the institutional data privacy and security protocols.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-black text-white h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg rounded-sm"
            >
              {loading ? "Activating..." : "Activate Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
