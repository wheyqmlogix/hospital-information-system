"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Home, 
  Building, 
  Stethoscope, 
  Loader2, 
  Save, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { releaseERPatient, admitFromER } from "@/app/api/admissions/er-actions";
import { useRouter } from "next/navigation";

interface ERWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admission: {
    id: string;
    patientId: string;
    patientName: string;
    admittingDiagnosis: string;
  };
}

export function ERWorkflowDialog({ open, onOpenChange, admission }: ERWorkflowDialogProps) {
  const [mode, setMode] = useState<"RELEASE" | "ADMIT" | null>(null);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const router = useRouter();

  // Form States
  const [finalDiagnosis, setFinalDiagnosis] = useState(admission.admittingDiagnosis);
  const [followUp, setFollowUp] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newWard, setNewWard] = useState("");

  const handleFetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRelease = async () => {
    setLoading(true);
    try {
      const result = await releaseERPatient({
        admissionId: admission.id,
        finalDiagnosis,
        followUpInstructions: followUp,
      });

      if (result.success) {
        toast.success("Patient released from ER");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to release patient");
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async () => {
    if (!newRoom) {
      toast.error("Please select a room for admission");
      return;
    }
    setLoading(true);
    try {
      const result = await admitFromER({
        admissionId: admission.id,
        newRoomNumber: newRoom,
        newWard,
        admittingDiagnosis: finalDiagnosis,
      });

      if (result.success) {
        toast.success("Patient admitted to ward");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error("Failed to admit patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-red-600" />
            Process ER Patient
          </DialogTitle>
          <DialogDescription>
            Clinical disposition for <span className="font-bold text-slate-900">{admission.patientName}</span>
          </DialogDescription>
        </DialogHeader>

        {!mode ? (
          <div className="grid grid-cols-2 gap-4 py-6">
            <button
              onClick={() => setMode("RELEASE")}
              className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <span className="font-bold text-slate-900">Release / Discharge</span>
              <span className="text-[10px] text-slate-500 text-center mt-1">Send patient home after treatment</span>
            </button>

            <button
              onClick={() => {
                setMode("ADMIT");
                handleFetchRooms();
              }}
              className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-slate-900">Admit to Ward</span>
              <span className="text-[10px] text-slate-500 text-center mt-1">Transfer for inpatient care</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Final Diagnosis / Impression</Label>
              <Textarea 
                value={finalDiagnosis} 
                onChange={(e) => setFinalDiagnosis(e.target.value)}
                placeholder="Enter final clinical impression..."
              />
            </div>

            {mode === "RELEASE" && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Follow-up Instructions</Label>
                <Textarea 
                  value={followUp} 
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Medications, rest, or next visit..."
                />
              </div>
            )}

            {mode === "ADMIT" && (
              <div className="grid grid-cols-1 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Assign Inpatient Room</Label>
                    <Select onValueChange={(v) => {
                      const room = rooms.find(r => r.roomNumber === v);
                      setNewRoom(v);
                      if (room?.type) setNewWard(room.type);
                    }}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select target room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => {
                          const available = room.beds?.filter((b: any) => b.status === "AVAILABLE").length || 0;
                          return (
                            <SelectItem key={room.id} value={room.roomNumber} disabled={available === 0}>
                              Room {room.roomNumber} ({room.type}) • {available} beds
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Ward/Floor</Label>
                    <Input value={newWard} readOnly className="bg-slate-50 text-slate-500 h-8 text-xs" />
                 </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
               <AlertCircle className="h-3 w-3" />
               This action will update the patient's record and release the current ER bay.
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {mode && (
            <Button variant="ghost" onClick={() => setMode(null)} disabled={loading}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          {mode && (
            <Button 
              className={mode === "RELEASE" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
              onClick={mode === "RELEASE" ? handleRelease : handleAdmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Confirm {mode === "RELEASE" ? "Release" : "Admission"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
