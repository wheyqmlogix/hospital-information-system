"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Send, 
  Clock, 
  User,
  AlertCircle
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

export function NursingNotes({ admissionId }: NursingNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [type, setType] = useState("PROGRESS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/admissions/${admissionId}/notes`);
      if (res.ok) setNotes(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [admissionId]);

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
               {["PROGRESS", "SHIFT_REPORT", "INCIDENT"].map((t) => (
                 <button
                   key={t}
                   type="button"
                   onClick={() => setType(t)}
                   className={cn(
                     "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all",
                     type === t 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                   )}
                 >
                   {t.replace("_", " ")}
                 </button>
               ))}
            </div>
            <div className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter clinical progress note..."
                className="w-full h-32 p-6 rounded-3xl border-2 border-slate-50 focus:border-blue-500 focus:ring-0 transition-all resize-none text-slate-900 placeholder:text-slate-300 bg-slate-50/50"
              />
              <Button 
                type="submit"
                disabled={isSubmitting || !newNote.trim()}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-10 px-6 font-bold"
              >
                {isSubmitting ? "Saving..." : "Save Note"}
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-slate-100 before:rounded-full">
             <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-blue-100 transition-all">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                        note.type === 'INCIDENT' ? "bg-red-100 text-red-600" : 
                        note.type === 'SHIFT_REPORT' ? "bg-amber-100 text-amber-600" : 
                        "bg-blue-100 text-blue-600"
                      )}>
                        {note.type}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Clock className="h-3.5 w-3.5" />
                         <span className="text-[10px] font-bold uppercase tracking-wider">
                           {new Date(note.createdAt).toLocaleString()}
                         </span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <User className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">RN-042</span>
                   </div>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.note}</p>
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
