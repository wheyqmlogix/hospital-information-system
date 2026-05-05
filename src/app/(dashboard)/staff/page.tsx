"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Shield, 
  Building,
  Mail,
  Award,
  Circle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPST } from "@/lib/date-utils";

interface UserWithRelations {
  id: string;
  name: string;
  email: string;
  status: string;
  licenseNumber: string | null;
  lastLogin: string | null;
  role: { name: string };
  primaryDepartment: { name: string } | null;
}

export default function StaffDirectoryPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { data: users, isLoading } = useQuery<UserWithRelations[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    }
  });

  const filteredUsers = users?.filter((user) => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage hospital personnel, roles, and clinical access permissions.</p>
        </div>
        <Button onClick={() => router.push("/staff/new")} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Provision Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{users?.length || 0}</div>
            <p className="text-xs text-slate-400 mt-1">Active personnel in the system</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">8</div>
            <p className="text-xs text-slate-400 mt-1">Across clinical and admin units</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center">
              <Circle className="h-3 w-3 fill-green-600 mr-2 animate-pulse" />
              12
            </div>
            <p className="text-xs text-slate-400 mt-1">Users currently logged in</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-50 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, email, or role..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] pl-6">Staff Member</TableHead>
                <TableHead>Role & Department</TableHead>
                <TableHead>License / ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-[50px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 animate-pulse bg-slate-50/50"></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No staff members found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell className="pl-6">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9 border border-slate-100">
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1.5 text-blue-600" />
                          <span className="text-sm font-medium text-slate-700">{user.role.name}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <Building className="h-3 w-3 mr-1.5" />
                          {user.primaryDepartment?.name || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.licenseNumber ? (
                        <div className="flex items-center text-sm font-mono text-slate-600">
                          <Award className="h-3.5 w-3.5 mr-1.5 text-teal-600" />
                          {user.licenseNumber}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Non-clinical</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        user.status === "ACTIVE" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-600">
                        {user.lastLogin 
                          ? formatPST(new Date(user.lastLogin), "MMM dd, HH:mm") 
                          : "Never"}
                      </p>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
