"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NetworkStatus } from "./network-status";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-md flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search patients, doctors, records..." 
            className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500 h-9"
          />
        </div>
        <NetworkStatus />
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">Dr. Sarah Wilson</p>
            <p className="text-xs text-slate-500">Chief Medical Officer</p>
          </div>
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">SW</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
