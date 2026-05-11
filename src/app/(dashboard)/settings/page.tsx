"use client";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Building2, 
  ShieldCheck, 
  Stethoscope, 
  Database,
  Users2,
  Bell,
  Globe,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";

const settingsGroups = [
  {
    title: "Facility Management",
    description: "Manage physical assets and hospital structure.",
    items: [
      {
        name: "Rooms & Beds",
        description: "Configure wards, rooms, and bed capacity.",
        href: "/settings/rooms",
        icon: LayoutGrid,
        color: "text-blue-600",
        bg: "bg-blue-50"
      },
      {
        name: "Departments",
        description: "Manage clinical and administrative units.",
        href: "/settings/departments",
        icon: Building2,
        color: "text-indigo-600",
        bg: "bg-indigo-50"
      }
    ]
  },
  {
    title: "User & Security",
    description: "Control access and staff permissions.",
    items: [
      {
        name: "Roles & Permissions",
        description: "Define what staff can see and do.",
        href: "/settings/roles",
        icon: ShieldCheck,
        color: "text-green-600",
        bg: "bg-green-50"
      },
      {
        name: "Staff Accounts",
        description: "Manage user credentials and status.",
        href: "/staff",
        icon: Users2,
        color: "text-orange-600",
        bg: "bg-orange-50"
      }
    ]
  },
  {
    title: "Clinical Configuration",
    description: "Customize medical services and lookup tables.",
    items: [
      {
        name: "Services & Pricing",
        description: "Manage hospital services and billing rates.",
        href: "/settings/services",
        icon: Stethoscope,
        color: "text-teal-600",
        bg: "bg-teal-50"
      },
      {
        name: "Integrations",
        description: "Configure PhilHealth and external APIs.",
        href: "/settings/integrations",
        icon: Globe,
        color: "text-purple-600",
        bg: "bg-purple-50"
      },
      {
        name: "Patient Portal",
        description: "Configure patient access and online features.",
        href: "/portal",
        icon: Globe,
        color: "text-blue-600",
        bg: "bg-blue-50"
      }
    ]
  }
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">Global configuration for your Hospital Information System.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {settingsGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{group.title}</h2>
              <p className="text-xs text-slate-500">{group.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {group.items.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Card className="border-none shadow-sm hover:ring-2 hover:ring-blue-500/20 transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${item.bg}`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
