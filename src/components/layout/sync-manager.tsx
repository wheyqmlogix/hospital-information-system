"use client";

import { useEffect, useState } from "react";
import { getSyncQueue, clearSyncQueueItem } from "@/lib/offline/sync-queue";
import { toast } from "sonner"; // Assuming sonner for notifications
import { RefreshCw } from "lucide-react";

export function SyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const processQueue = async () => {
      if (!navigator.onLine || isSyncing) return;

      const queue = await getSyncQueue();
      if (queue.length === 0) return;

      setIsSyncing(true);
      console.log(`Syncing ${queue.length} items...`);

      for (const item of queue) {
        try {
          const response = await fetch(item.action === "CREATE_PATIENT" ? "/api/patients" : "", {
            method: "POST",
            body: JSON.stringify(item.data),
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            await clearSyncQueueItem(item.id);
          }
        } catch (error) {
          console.error("Failed to sync item:", error);
        }
      }
      
      setIsSyncing(false);
    };

    window.addEventListener("online", processQueue);
    // Initial check
    processQueue();

    return () => window.removeEventListener("online", processQueue);
  }, [isSyncing]);

  if (!isSyncing) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-50">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span className="text-sm font-medium">Syncing data...</span>
    </div>
  );
}
