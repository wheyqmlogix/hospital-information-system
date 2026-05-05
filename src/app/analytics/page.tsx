"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const kpis = [
  { 
    name: "Total Revenue (MTD)", 
    value: "₱4,250,000", 
    change: "+14.2%", 
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-100"
  },
  { 
    name: "PhilHealth Approval Rate", 
    value: "98.2%", 
    change: "+2.1%", 
    trend: "up",
    icon: ShieldCheck,
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  { 
    name: "Avg. Length of Stay", 
    value: "4.2 Days", 
    change: "-0.5d", 
    trend: "up", // Improving efficiency
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  { 
    name: "Revenue Leakage", 
    value: "₱142,000", 
    change: "-18.5%", 
    trend: "down",
    icon: TrendingDown,
    color: "text-red-600",
    bg: "bg-red-100"
  },
];

const revenueBreakdown = [
  { label: "PhilHealth Benefit", value: 45, color: "bg-blue-500" },
  { label: "HMO Share", value: 25, color: "bg-teal-500" },
  { label: "Patient Out-of-Pocket", value: 30, color: "bg-slate-700" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Executive Analytics</h1>
        <p className="text-slate-500 mt-1">Real-time performance indicators and financial health.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.name} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${kpi.bg} p-3 rounded-xl`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <Badge variant="outline" className={
                  kpi.trend === "up" 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-700 border-red-200"
                }>
                  {kpi.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{kpi.name}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="bg-transparent border-b border-slate-200 rounded-none h-auto p-0 space-x-8">
          <TabsTrigger value="financial" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
            Financial Health
          </TabsTrigger>
          <TabsTrigger value="operational" className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-none shadow-none">
            Operational Efficiency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Revenue Trends (6 Months)
                </CardTitle>
                <CardDescription>Monthly growth across all hospital departments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 relative">
                  <div className="text-center">
                    <TrendingUp className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="text-slate-400 mt-2 font-medium">Interactive Financial Projection Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-teal-600" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Distribution of collection sources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {revenueBreakdown.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-bold">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <div className="flex items-start space-x-3 text-sm bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-blue-700">
                      <strong>Insight:</strong> PhilHealth collections are up 8% this month due to the new eClaims Bridge.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="pt-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Departmental Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { dept: "ER", value: 85, color: "bg-red-500" },
                    { dept: "ICU", value: 92, color: "bg-orange-500" },
                    { dept: "General Ward", value: 65, color: "bg-blue-500" },
                    { dept: "OB-GYN", value: 45, color: "bg-pink-500" },
                  ].map((dept) => (
                    <div key={dept.dept} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-24">{dept.dept}</span>
                      <div className="flex-1 mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${dept.color}`} style={{ width: `${dept.value}%` }} />
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{dept.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Ancillary TAT (Turnaround Time)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { service: "Stat CBC", time: "18 min", target: "20 min", status: "ON-TARGET" },
                    { service: "Routine Lab", time: "45 min", target: "60 min", status: "ON-TARGET" },
                    { service: "X-Ray Reading", time: "125 min", target: "90 min", status: "DELAYED" },
                  ].map((item) => (
                    <div key={item.service} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-sm font-bold">{item.service}</p>
                        <p className="text-xs text-slate-500">Target: {item.target}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${item.status === 'DELAYED' ? 'text-red-600' : 'text-green-600'}`}>{item.time}</p>
                        <Badge variant="outline" className={`text-[10px] h-4 ${
                          item.status === 'DELAYED' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing import fix
import { Clock } from "lucide-react";
