"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  ArrowRight, 
  Loader2, 
  CreditCard, 
  IdCard,
  User,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Protected } from "@/components/auth/protected";

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  philHealthPIN?: string | null;
  nationalId?: string | null;
  dateOfBirth: string;
  gender: string;
  status: string;
}

export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/patients?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setHasSearched(true);
        }
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Master Patient Index</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Identity Management & Record Synchronization</p>
        </div>
        
        {hasSearched && (
          <Protected permission="edit_patients">
            <Link
              href="/patients/new"
              className="flex items-center px-6 h-9 bg-clinical-primary text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-sm hover:bg-clinical-primary-dark transition-all"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register New Patient
            </Link>
          </Protected>
        )}
      </div>

      {/* The Utilitarian Search */}
      <div className="relative">
        <div className="relative bg-white border border-slate-300 rounded-sm shadow-sm flex items-center focus-within:border-clinical-primary transition-all overflow-hidden">
          <div className="pl-4 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            autoFocus
            placeholder="Search by Name, Patient ID, PhilHealth PIN, or National ID..."
            className="flex-1 px-4 py-3 text-sm font-bold border-none focus:ring-0 placeholder:text-slate-400 bg-transparent text-slate-900 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="pr-4">
              <Loader2 className="h-4 w-4 animate-spin text-clinical-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Search Results - High Density List */}
      <div className="space-y-1">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Global Patient Database...</p>
          </div>
        ) : query.length >= 2 ? (
          results.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {results.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="bg-white border border-slate-200 p-4 rounded-sm flex items-center justify-between hover:border-clinical-primary/30 hover:bg-slate-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-sm bg-slate-900 flex items-center justify-center text-white text-[10px] font-black group-hover:bg-clinical-primary transition-colors border border-slate-800">
                      {patient.lastName[0]}{patient.firstName[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-clinical-primary transition-colors">
                        {patient.lastName}, {patient.firstName} {patient.middleName && `${patient.middleName[0]}.`}
                      </h3>
                      <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">{patient.patientId}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                        <span>{patient.gender}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                        <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end gap-1">
                      {patient.philHealthPIN && (
                        <div className="flex items-center text-[9px] font-black text-clinical-primary bg-clinical-primary/5 px-2 py-0.5 rounded-sm border border-clinical-primary/10 uppercase tracking-tighter">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          PH: {patient.philHealthPIN}
                        </div>
                      )}
                      {patient.nationalId && (
                        <div className="flex items-center text-[9px] font-black text-slate-600 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-200 uppercase tracking-tighter">
                          <IdCard className="h-3 w-3 mr-1" />
                          NAT: {patient.nationalId}
                        </div>
                      )}
                    </div>
                    <div className="h-8 w-8 rounded-sm border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-clinical-primary group-hover:border-clinical-primary/20 group-hover:bg-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-sm border border-dashed border-slate-200">
              <div className="max-w-xs mx-auto">
                <div className="h-12 w-12 bg-white rounded-sm border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-6 w-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">No Matching Records</h3>
                <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest leading-relaxed">
                  The criteria &quot;<span className="text-slate-900">{query}</span>&quot; returned zero identity matches.
                </p>
                <Protected permission="edit_patients">
                  <Link
                    href="/patients/new"
                    className="inline-flex items-center px-8 h-10 bg-clinical-primary text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-sm hover:bg-clinical-primary-dark transition-all"
                  >
                    Register New Record
                  </Link>
                </Protected>
              </div>
            </div>
          )
        ) : (
          <div className="py-32 text-center">
             <div className="max-w-sm mx-auto opacity-20">
                <Search className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Mandatory Search Protocol</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Identity validation required before entry.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
