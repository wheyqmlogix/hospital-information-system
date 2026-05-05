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

export interface OfflineAdmission {
  id: string;
  patientId: string;
  patientName: string;
  admittingDiagnosis: string;
  roomNumber: string;
  ward?: string;
  isPhilHealthMember: boolean;
  philHealthPIN?: string;
  dpaConsentTimestamp: number;
  status: 'ADMITTED';
  createdAt: number;
}

export class CliniqDB extends Dexie {
  users!: Table<OfflineUser>;
  admissions!: Table<OfflineAdmission>;

  constructor() {
    super("CliniqOfflineDB");
    this.version(2).stores({
      users: "id, email, role",
      admissions: "id, patientId, status"
    });
  }
}

export const db = new CliniqDB();
