import { 
  Users, 
  Calendar, 
  BedDouble, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedBoard } from "@/components/layout/bed-board";
import Link from "next/link";

const stats = [
  { 
    name: "Total Patients", 
    value: "2,543", 
    change: "+12.5%", 
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  { 
    name: "Active Appointments", 
    value: "156", 
    change: "+4.2%", 
    trend: "up",
    icon: Calendar,
    color: "text-teal-600",
    bg: "bg-teal-100"
  },
  { 
    name: "Available Beds", 
    value: "42", 
    change: "-2.1%", 
    trend: "down",
    icon: BedDouble,
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  { 
    name: "Revenue (Today)", 
    value: "₱62,450", 
    change: "+18.2%", 
    trend: "up",
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-100"
  },
];

const recentActivities = [
  {
    id: 1,
    patient: "John Doe",
    type: "Admission",
    time: "2 hours ago",
    status: "Completed",
    icon: CheckCircle2,
    iconColor: "text-green-500"
  },
  {
    id: 2,
    patient: "Alice Smith",
    type: "Lab Result",
    time: "3 hours ago",
    status: "Pending",
    icon: Clock,
    iconColor: "text-amber-500"
  },
  {
    id: 3,
    patient: "Robert Johnson",
    type: "Emergency",
    time: "5 hours ago",
    status: "Urgent",
    icon: AlertCircle,
    iconColor: "text-red-500"
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Welcome back, Dr. Wilson. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 py-1.5 px-3 text-xs md:text-sm">
            <Clock className="h-3.5 w-3.5 mr-2" />
            Tuesday, May 5, 2026
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link 
            key={stat.name} 
            href={stat.name === "Total Patients" ? "/patients" : stat.name === "Available Beds" ? "/admissions" : "#"}
            className="block"
          >
            <Card className="border-none shadow-sm overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`${stat.bg} p-3 rounded-xl`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className={
                    stat.trend === "up" 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-red-50 text-red-700 border-red-200"
                  }>
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bed Occupancy Board</h2>
            <p className="text-sm text-slate-500 mt-1">Real-time status of all hospital rooms and beds.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-slate-500">Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-500">Occupied</span>
            </div>
            <Badge variant="outline" className="ml-4 bg-blue-50 text-blue-700 border-blue-200">
              Total Occupancy: 68%
            </Badge>
          </div>
        </div>
        <BedBoard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Patient Admissions Trend</CardTitle>
            <CardDescription>Number of patients admitted over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <div className="text-center">
                <TrendingUp className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-slate-400 mt-2">Analytics Chart Placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from across the hospital.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`mt-1 ${activity.iconColor}`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.patient}
                    </p>
                    <p className="text-sm text-slate-500">
                      {activity.type} • {activity.status}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 text-right">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
