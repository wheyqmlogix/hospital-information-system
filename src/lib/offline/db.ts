import Dexie, { Table } from "dexie";

export interface OfflineUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  department?: string;
  lastSynced: number;
}

export class CliniqDB extends Dexie {
  users!: Table<OfflineUser>;

  constructor() {
    super("CliniqOfflineDB");
    this.version(1).stores({
      users: "id, email, role"
    });
  }
}

export const db = new CliniqDB();
