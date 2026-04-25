import Dexie, { type Table } from 'dexie';

export type MembershipType = 'S' | 'G' | 'I' | 'NS' | 'NO' | 'PS' | 'PG' | 'P';
export type RelationToMember = 'M' | 'S' | 'C' | 'P';
export type SyncStatus = 'draft' | 'validated' | 'synced';

export interface PatientRecord {
  id?: number;
  // Demographics (PCDI)
  firstName: string;
  lastName: string;
  middleName?: string;
  extensionName?: string; // Jr, III
  birthDate: string;
  sex: 'Male' | 'Female';
  
  // PhilHealth Compliance (eClaims 3.0)
  memberPIN?: string;
  patientPIN?: string;
  membershipType?: MembershipType;
  relationshipToMember?: RelationToMember;
  
  // Clinical Data (DOH/NHDR)
  chiefComplaint?: string;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    temp?: number;
    weight?: number;
    height?: number;
  };
  diagnosisCode?: string; // ICD-10
  diagnosisDescription?: string;
  
  // System Fields
  status: SyncStatus;
  createdAt: number;
  updatedAt: number;
}

export interface InventoryItem {
  id?: number;
  name: string;
  genericName?: string;
  pndfCode?: string;
  vatExempt: boolean;
  isDangerousDrug: boolean;
  basePrice: number;
}

export interface StockBatch {
  id?: number;
  inventoryId: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
}

export interface BillingRecord {
  id?: number;
  patientId: number;
  encounterId: number;
  status: 'unpaid' | 'paid' | 'void';
  philhealthBenefit: number;
  seniorDiscount: number;
  totalActualCharges: number;
  netAmount: number;
  createdAt: number;
}

export interface BillingItem {
  id?: number;
  billingId: number;
  inventoryId?: number; // Null if it's a service (e.g., Room, PF)
  serviceName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class HISDatabase extends Dexie {
  patients!: Table<PatientRecord>;
  inventory!: Table<InventoryItem>;
  stocks!: Table<StockBatch>;
  billing!: Table<BillingRecord>;
  billingItems!: Table<BillingItem>;

  constructor() {
    super('HISDatabase');
    this.version(3).stores({
      patients: '++id, status, lastName, patientPIN, memberPIN, diagnosisCode',
      inventory: '++id, name, genericName, pndfCode',
      stocks: '++id, inventoryId, expiryDate',
      billing: '++id, patientId, encounterId, status',
      billingItems: '++id, billingId, inventoryId'
    });
  }
}

export const db = new HISDatabase();

// Helper to save/update record
export async function savePatientRecord(record: Omit<PatientRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  return await db.patients.add({
    ...record,
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}
