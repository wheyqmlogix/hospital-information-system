"use client";

import { Bell, Search, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Role } from "@/lib/auth";

export function Header() {
  const { user, login, logout } = useAuth();

  const handleRoleChange = (role: Role) => {
    login(role);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm/5">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            placeholder="Search patients (Name, PIN, ID), records, or help..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Dev Role Switcher - Refined */}
        <div className="hidden md:flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
          {(["ADMIN", "DOCTOR", "NURSE", "BILLING"] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${
                user?.role === role 
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="relative group">
          <button className="flex items-center pl-3 pr-1 py-1 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100">
            <div className="text-right mr-3 hidden lg:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || "Guest"}</p>
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">{user?.role || "No Role"}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
              {user?.name.split(" ").map(n => n[0]).join("") || "GU"}
            </div>
            <ChevronDown className="h-4 w-4 ml-2 text-slate-400" />
          </button>
          
          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1.5 origin-top-right">
            <div className="px-3 py-2 border-b border-slate-100 mb-1 lg:hidden">
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-blue-600 font-medium">{user?.role}</p>
            </div>
            <button className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <UserIcon className="h-4 w-4 mr-2.5 text-slate-400" />
              My Profile
            </button>
            <div className="h-px bg-slate-100 my-1" />
            <button 
              onClick={() => logout()}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
