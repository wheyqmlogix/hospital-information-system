"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/offline/db";
import { createAdmission } from "@/app/api/admissions/actions";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

export function SyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const pendingAdmissions = useLiveQuery(() => db.admissions.toArray());
  
  const syncData = async () => {
    if (!navigator.onLine || isSyncing || !pendingAdmissions || pendingAdmissions.length === 0) return;

    setIsSyncing(true);
    const toastId = toast.loading("Syncing offline admissions...", {
      icon: <RefreshCw className="h-4 w-4 animate-spin" />
    });

    let successCount = 0;
    let failCount = 0;

    for (const admission of pendingAdmissions) {
      try {
        const result = await createAdmission({
          patientId: admission.patientId,
          admittingDiagnosis: admission.admittingDiagnosis,
          roomNumber: admission.roomNumber,
          ward: admission.ward,
          isPhilHealthMember: admission.isPhilHealthMember,
          philHealthPIN: admission.philHealthPIN,
          dpaConsent: true, // Offline capture already confirmed DPA
        });

        if (result.success) {
          await db.admissions.delete(admission.id);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    setIsSyncing(false);
    toast.dismiss(toastId);

    if (successCount > 0) {
      toast.success(`Synced ${successCount} admission(s) successfully.`, {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    }
    
    if (failCount > 0) {
      toast.error(`Failed to sync ${failCount} admission(s). Check logs.`, {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    }
  };

  useEffect(() => {
    // Initial sync check
    syncData();

    // Listen for online event
    window.addEventListener("online", syncData);
    return () => window.removeEventListener("online", syncData);
  }, [pendingAdmissions?.length]);

  if (!pendingAdmissions || pendingAdmissions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-3 border border-slate-700">
        <div className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </div>
        <span className="text-xs font-bold tracking-tight uppercase">
          {pendingAdmissions.length} Pending Sync
        </span>
        {isSyncing && <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />}
      </div>
    </div>
  );
}
