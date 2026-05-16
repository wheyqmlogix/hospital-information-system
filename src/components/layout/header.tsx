"use client";

import { Bell, Search, User as UserIcon, LogOut, ChevronDown, Menu, Activity } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Role } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, login, logout } = useAuth();

  const handleRoleChange = (role: Role) => {
    login(role);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center lg:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2 h-9 w-9">
          <Menu className="h-5 w-5 text-[#0f172a]" />
        </Button>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-tighter">Cliniq HIS</span>
        </div>
      </div>

      <div className="flex-1 max-w-md hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 group-focus-within:text-[#0f172a] transition-colors" />
          <input 
            placeholder="Global Search (Records, Patients, Files)..." 
            className="w-full pl-9 pr-4 py-1.5 bg-transparent border border-slate-200 rounded-[1px] text-[10px] font-bold uppercase tracking-widest focus:border-[#0f172a] focus:bg-slate-50/30 transition-all outline-none"
          />
        </div>
      </div>
      
      {/* Mobile Spacer */}
      <div className="lg:hidden flex-1" />

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Dev Role Switcher - Institutional Utility */}
        <div className="hidden xl:flex items-center bg-slate-50 border border-slate-200 rounded-[1px] p-0.5">
          {(["ADMIN", "DOCTOR", "NURSE", "BILLING"] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-2 py-0.5 text-[7px] font-black rounded-[1px] transition-all uppercase tracking-widest ${
                user?.role === role 
                  ? "bg-[#0f172a] text-white" 
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <button className="p-1.5 text-slate-400 hover:text-[#0f172a] transition-all relative">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-[#0f172a] border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

        <div className="relative group">
          <button className="flex items-center pl-2 py-1 hover:bg-slate-50 rounded-[1px] transition-all">
            <div className="text-right mr-3 hidden md:block">
              <p className="text-[9px] font-black text-[#0f172a] leading-none uppercase tracking-widest">{user?.name || "GUEST"}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{user?.role || "NO ROLE"}</p>
            </div>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-[1px] bg-[#0f172a] flex items-center justify-center text-white text-[8px] md:text-[9px] font-black border border-white/10">
              {user?.name.split(" ").map(n => n[0]).join("") || "GU"}
            </div>
            <ChevronDown className="h-3 w-3 ml-2 text-slate-400" />
          </button>
          
          <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 rounded-[1px] shadow-xl shadow-slate-900/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1 origin-top-right">
            <div className="px-3 py-2 xl:hidden">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2">Switch Identity</p>
              <div className="grid grid-cols-2 gap-1">
                {(["ADMIN", "DOCTOR", "NURSE", "BILLING"] as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`px-1 py-1 text-[7px] font-black rounded-[1px] transition-all uppercase tracking-tight border ${
                      user?.role === role 
                        ? "bg-[#0f172a] text-white border-[#0f172a]" 
                        : "text-slate-600 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="h-px bg-slate-100 my-2" />
            </div>
            
            <button className="w-full flex items-center px-3 py-2 text-[8px] font-black text-slate-600 hover:bg-slate-50 rounded-[1px] transition-colors uppercase tracking-[0.15em]">
              <UserIcon className="h-3 w-3 mr-2 text-slate-400" />
              Secure Profile
            </button>
            <div className="h-px bg-slate-100 my-1 mx-1" />
            <button 
              onClick={() => logout()}
              className="w-full flex items-center px-3 py-2 text-[8px] font-black text-[#991b1b] hover:bg-red-50 rounded-[1px] transition-colors uppercase tracking-[0.15em]"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
