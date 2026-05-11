"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  Activity,
  Pill,
  CreditCard,
  TestTube
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { Permission } from "@/lib/auth";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  requiredPermission?: Permission;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients (MPI)", href: "/patients", icon: Users, requiredPermission: "view_patients" },
  { name: "ER/Admissions", href: "/admissions", icon: Activity, requiredPermission: "view_admissions" },
  { name: "Pharmacy", href: "/inventory", icon: Pill, requiredPermission: "manage_inventory" },
  { name: "Laboratory", href: "/lab", icon: TestTube, requiredPermission: "view_lab_orders" },
  { name: "Billing", href: "/billing", icon: CreditCard, requiredPermission: "view_billing" },
  { name: "Settings", href: "/settings", icon: Settings, requiredPermission: "system_admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <div className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Cliniq</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
