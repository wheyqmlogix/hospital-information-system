"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings, 
  Activity,
  BarChart3,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Admissions", href: "/admissions", icon: Activity },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
        <div className="flex items-center">
          <Activity className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">Cliniq</span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-700" : "text-slate-400 group-hover:text-slate-500"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital System</p>
          <p className="text-xs text-slate-400 mt-1">v1.2.0-phase4</p>
        </div>
      </div>
    </div>
  );
}
