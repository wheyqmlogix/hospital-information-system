"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Password reset successfully");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset password");
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
              <h1 className="text-xl font-black text-[#0f172a] uppercase tracking-widest">Password Reset</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your institutional credentials have been updated.</p>
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
            <h1 className="text-lg font-black text-[#0f172a] uppercase tracking-widest">Reset Password</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define your new secure system credentials.</p>
        </div>
        
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                New Password
              </Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-11 pr-10 text-[12px] font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0f172a] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                Confirm Password
              </Label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-11 pr-10 text-[12px] font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#0f172a] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm flex gap-3">
              <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                Ensure your new password follows the institutional security standards for account protection.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-black text-white h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg rounded-sm"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
