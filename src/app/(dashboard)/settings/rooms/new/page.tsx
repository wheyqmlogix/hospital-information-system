"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { RoomFormContent } from "@/components/settings/room-form-content";

export default function NewRoomPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Setup New Room</h1>
          <p className="text-slate-500">Configure a new hospital room and allocate initial bed capacity.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="flex items-center text-blue-700">
            <LayoutGrid className="h-5 w-5 mr-2" />
            Room Configuration
          </CardTitle>
          <CardDescription>
            Specify the room number, location, and the type of care it will provide.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <RoomFormContent 
            onSuccess={() => router.push("/settings/rooms")}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
