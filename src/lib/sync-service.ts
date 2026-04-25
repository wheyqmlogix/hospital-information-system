import { db, type PatientRecord } from './db';

/**
 * Background Sync Service
 * Orchestrates the push of local IndexedDB data to the PostgreSQL backend.
 */
export async function syncLocalDataToServer() {
  const unsyncedPatients = await db.patients.where('status').equals('draft').toArray();

  if (unsyncedPatients.length === 0) return { count: 0 };

  console.log(`Syncing ${unsyncedPatients.length} records to server...`);

  let successCount = 0;

  for (const record of unsyncedPatients) {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      if (response.ok) {
        // Update local status to prevent re-syncing
        await db.patients.update(record.id!, { 
          status: 'synced',
          updatedAt: Date.now() 
        });
        successCount++;
      }
    } catch (error) {
      console.error(`Failed to sync record ${record.id}:`, error);
      // Stay as 'draft' to retry later
    }
  }

  return { count: successCount };
}

/**
 * Hook-like function to start a periodic sync (can be called from layout)
 */
export function startAutoSync(intervalMs = 30000) {
  if (typeof window === 'undefined') return;

  // Run immediately on start
  syncLocalDataToServer();

  // Then run periodically
  const interval = setInterval(syncLocalDataToServer, intervalMs);
  
  // Also sync when coming back online
  window.addEventListener('online', syncLocalDataToServer);

  return () => {
    clearInterval(interval);
    window.removeEventListener('online', syncLocalDataToServer);
  };
}
