"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Reset instructions sent to your email");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to process request");
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
              <h1 className="text-xl font-black text-[#0f172a] uppercase tracking-widest">Email Sent</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                If an account exists for {email}, you will receive password reset instructions shortly.
              </p>
            </div>
            <Button 
              onClick={() => router.push("/login")}
              className="w-full bg-[#0f172a] hover:bg-black text-white h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg rounded-sm"
            >
              Return to Login
              <ArrowLeft className="h-3.5 w-3.5 ml-2" />
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
              <Mail className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-black text-[#0f172a] uppercase tracking-widest">Forgot Password</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request a secure password reset link.</p>
        </div>
        
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                Institutional Email
              </Label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@hospital.com" 
                className="h-11 text-[12px] font-bold"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-black text-white h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg rounded-sm"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              <Send className="h-3.5 w-3.5 ml-2" />
            </Button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="text-[10px] font-black text-slate-400 hover:text-[#0f172a] uppercase tracking-widest transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
