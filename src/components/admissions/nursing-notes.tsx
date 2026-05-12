"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  FileText, 
  Send, 
  Clock, 
  User,
  ClipboardCheck,
  Stethoscope,
  Activity,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  note: string;
  type: string;
  createdAt: string;
  recordedByUserId?: string;
}

interface NursingNotesProps {
  admissionId: string;
}

const HANDOVER_TEMPLATE = `[SHIFT HANDOVER REPORT]
STATUS: STABLE / FOR OBSERVATION

VITAL SIGNS SUMMARY:
BP: 
TEMP:
HR/PR:
SPO2:

MEDICATIONS GIVEN:
- 

PENDING TASKS/ORDERS:
- 

SPECIAL CONCERNS:
- `;

export function NursingNotes({ admissionId }: NursingNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [type, setType] = useState("PROGRESS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/admissions/${admissionId}/notes`);
      if (res.ok) setNotes(await res.json());
    } catch (error) {
      console.error(error);
    }
  }, [admissionId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType === "SHIFT_REPORT" && (!newNote || newNote.trim() === "")) {
      setNewNote(HANDOVER_TEMPLATE);
    } else if (newType === "PROGRESS" && newNote === HANDOVER_TEMPLATE) {
      setNewNote("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admissions/${admissionId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote, type }),
      });

      if (res.ok) {
        setNewNote("");
        setType("PROGRESS");
        fetchNotes();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
               {[
                 { id: "PROGRESS", label: "Progress Note", icon: FileText },
                 { id: "SHIFT_REPORT", label: "Shift Handover", icon: ClipboardCheck },
                 { id: "INCIDENT", label: "Incident Report", icon: AlertTriangle }
               ].map((t) => (
                 <button
                   key={t.id}
                   type="button"
                   onClick={() => handleTypeChange(t.id)}
                   className={cn(
                     "flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all",
                     type === t.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                   )}
                 >
                   <t.icon className="h-3.5 w-3.5" />
                   {t.label}
                 </button>
               ))}
            </div>
            <div className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={type === 'SHIFT_REPORT' ? "Complete the handover template..." : "Enter clinical progress note..."}
                className={cn(
                  "w-full p-6 rounded-3xl border-2 border-slate-50 focus:border-blue-500 focus:ring-0 transition-all resize-none text-slate-900 placeholder:text-slate-300 bg-slate-50/50 font-medium",
                  type === 'SHIFT_REPORT' ? "h-80 font-mono text-xs" : "h-32"
                )}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                 {type === 'SHIFT_REPORT' && (
                   <p className="text-[10px] font-bold text-slate-400 italic">Structured template applied</p>
                 )}
                 <Button 
                   type="submit"
                   disabled={isSubmitting || !newNote.trim()}
                   className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-10 px-6 font-bold shadow-lg shadow-blue-100"
                 >
                   {isSubmitting ? "Saving..." : "Record Note"}
                   <Send className="h-4 w-4 ml-2" />
                 </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-slate-100 before:rounded-full">
             <div className={cn(
               "bg-white border rounded-3xl p-6 shadow-sm transition-all",
               note.type === 'SHIFT_REPORT' ? "border-amber-100 bg-amber-50/10" : "border-slate-100 hover:border-blue-100"
             )}>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                        note.type === 'INCIDENT' ? "bg-red-100 text-red-600" : 
                        note.type === 'SHIFT_REPORT' ? "bg-amber-100 text-amber-700" : 
                        "bg-blue-100 text-blue-600"
                      )}>
                        {note.type.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Clock className="h-3.5 w-3.5" />
                         <span className="text-[10px] font-bold uppercase tracking-wider">
                           {new Date(note.createdAt).toLocaleString()}
                         </span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      <User className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Nurse Dalisay, R.</span>
                   </div>
                </div>
                <div className={cn(
                  "text-slate-700 leading-relaxed whitespace-pre-wrap",
                  note.type === 'SHIFT_REPORT' ? "font-mono text-xs bg-white/50 p-4 rounded-2xl border border-amber-50" : ""
                )}>
                  {note.note}
                </div>
                {note.type === 'SHIFT_REPORT' && (
                  <div className="mt-4 pt-4 border-t border-amber-100/50 flex items-center justify-between text-amber-700/50">
                     <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter">
                        <ClipboardCheck className="h-3 w-3" />
                        Formal Handover Documented
                     </div>
                     <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        <Stethoscope className="h-3 w-3" />
                     </div>
                  </div>
                )}
             </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
             <div className="max-w-xs mx-auto opacity-20">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">No clinical notes recorded.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
