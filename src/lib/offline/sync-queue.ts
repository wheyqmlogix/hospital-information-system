import { openDB } from "idb";

const DB_NAME = "Cliniq-his-offline";
const STORE_NAME = "sync-queue";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    },
  });
}

export async function addToSyncQueue(action: string, data: any) {
  const db = await getDB();
  await db.add(STORE_NAME, {
    action,
    data,
    timestamp: Date.now(),
  });
}

export async function getSyncQueue() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function clearSyncQueueItem(id: number) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
