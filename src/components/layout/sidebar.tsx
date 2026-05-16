"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  Activity,
  Pill,
  Package,
  CreditCard,
  TestTube,
  Map,
  BarChart3,
  X as CloseIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { Permission } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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
  { name: "Bed Management", href: "/beds", icon: Map, requiredPermission: "view_admissions" },
  { name: "Pharmacy", href: "/inventory", icon: Pill, requiredPermission: "manage_inventory" },
  { name: "Central Supply (CSR)", href: "/csr", icon: Package, requiredPermission: "manage_inventory" },
  { name: "Laboratory", href: "/lab", icon: TestTube, requiredPermission: "view_lab_orders" },
  { name: "Billing", href: "/billing", icon: CreditCard, requiredPermission: "view_billing" },
  { name: "Reports", href: "/reports", icon: BarChart3, requiredPermission: "system_admin" },
  { name: "Settings", href: "/settings", icon: Settings, requiredPermission: "system_admin" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <>
      <div className="px-4 py-3 mb-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Operations</p>
      </div>
      {filteredNavigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center px-4 py-2.5 text-[10px] font-bold rounded-[1px] transition-all relative group uppercase tracking-widest",
              isActive 
                ? "bg-slate-50 text-[#0f172a]" 
                : "text-slate-500 hover:text-[#0f172a] hover:bg-slate-50/50"
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#0f172a]" />
            )}
            <item.icon className={cn(
              "h-4 w-4 mr-3 transition-colors md:h-3.5 md:w-3.5",
              isActive ? "text-[#0f172a]" : "text-slate-400 group-hover:text-slate-600"
            )} />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-56 flex-col bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="h-14 flex items-center px-6 border-b border-slate-100">
          <div className="h-5 w-5 bg-[#0f172a] rounded-[1px] flex items-center justify-center mr-3">
            <Activity className="h-3 w-3 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-[#0f172a] leading-none tracking-tight uppercase">Cliniq</span>
            <span className="text-[8px] font-bold text-slate-400 leading-none uppercase tracking-widest mt-0.5">Institutions</span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          <NavItems />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-[1px]">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-900 mr-2.5" />
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sys. Connected</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] z-50 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 flex flex-col",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-14 flex items-center px-6 border-b border-slate-100 justify-between">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-[#0f172a] rounded-[1px] flex items-center justify-center mr-3">
                  <Activity className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-black text-[#0f172a] uppercase">Cliniq Registry</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <NavItems onClick={() => setIsOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Quick Access) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 pb-safe">
        {[
          { icon: LayoutDashboard, href: "/", label: "Home" },
          { icon: Users, href: "/patients", label: "Registry" },
          { icon: Activity, href: "/admissions", label: "Clinical" },
          { icon: CreditCard, href: "/billing", label: "Finance" },
        ].map((item) => (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full gap-1 transition-colors",
              pathname === item.href ? "text-[#0f172a]" : "text-slate-400"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
