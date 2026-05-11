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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Master Patient Index</h1>
          <p className="text-slate-500 mt-1">Search and manage patient identity records.</p>
        </div>
        
        {hasSearched && (
          <Protected permission="edit_patients">
            <Link
              href="/patients/new"
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Register New Patient
            </Link>
          </Protected>
        )}
      </div>

      {/* The Gatekeeper Search */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-600/5 rounded-3xl blur-xl group-focus-within:bg-blue-600/10 transition-all"></div>
        <div className="relative bg-white border-2 border-slate-100 rounded-3xl shadow-sm p-2 flex items-center group-focus-within:border-blue-500 transition-all">
          <div className="pl-6 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-6 w-6" />
          </div>
          <input
            autoFocus
            placeholder="Search by Name, Patient ID, PhilHealth PIN, or National ID..."
            className="flex-1 px-6 py-5 text-xl font-medium border-none focus:ring-0 placeholder:text-slate-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="pr-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-medium animate-pulse">Checking records...</p>
          </div>
        ) : query.length >= 2 ? (
          results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <User className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-none mb-2">
                        {patient.lastName}, {patient.firstName} {patient.middleName && `${patient.middleName[0]}.`}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{patient.patientId}</span>
                        <span>•</span>
                        <span>{patient.gender}</span>
                        <span>•</span>
                        <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end gap-1">
                      {patient.philHealthPIN && (
                        <div className="flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          PH: {patient.philHealthPIN}
                        </div>
                      )}
                      {patient.nationalId && (
                        <div className="flex items-center text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                          <IdCard className="h-3 w-3 mr-1" />
                          NAT: {patient.nationalId}
                        </div>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="max-w-xs mx-auto">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Records Found</h3>
                <p className="text-sm text-slate-500 mb-6">
                  We couldn&apos;t find any patient matching &quot;<span className="font-bold text-slate-900">{query}</span>&quot;.
                </p>
                <Protected permission="edit_patients">
                  <Link
                    href="/patients/new"
                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    Create New Record
                  </Link>
                </Protected>
              </div>
            </div>
          )
        ) : (
          <div className="py-32 text-center">
             <div className="max-w-sm mx-auto opacity-20">
                <Search className="h-20 w-20 mx-auto mb-6 text-slate-400" />
                <p className="text-xl font-bold text-slate-900">Patient Gatekeeper</p>
                <p className="text-sm">Perform a mandatory search to begin.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
