import Dexie, { type Table } from 'dexie';

export type MembershipType = 'S' | 'G' | 'I' | 'NS' | 'NO' | 'PS' | 'PG' | 'P';
export type RelationToMember = 'M' | 'S' | 'C' | 'P';
export type SyncStatus = 'draft' | 'validated' | 'synced';

export interface PatientRecord {
  id?: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  extensionName?: string;
  birthDate: string;
  sex: 'Male' | 'Female';
  memberPIN?: string;
  patientPIN?: string;
  membershipType?: MembershipType;
  relationshipToMember?: RelationToMember;
  chiefComplaint?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  status: SyncStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Room {
  id?: number;
  name: string;
  type: 'WARD' | 'SEMI_PRIVATE' | 'PRIVATE' | 'ICU';
  rate: number;
}

export interface Bed {
  id?: number;
  roomId: number;
  name: string;
  status: 'VACANT' | 'OCCUPIED' | 'CLEANING';
}

export interface Admission {
  id?: number;
  patientId: number;
  bedId: number;
  admissionDate: number;
  dischargeDate?: number;
  status: 'ADMITTED' | 'DISCHARGED' | 'CANCELLED';
  dietaryReq?: string;
}

export interface MedicalOrder {
  id?: number;
  patientId: number;
  type: 'MEDICATION' | 'LABORATORY' | 'RADIOLOGY';
  item: string;
  inventoryId?: number;
  quantity: number;
  instructions?: string;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  orderedBy: string;
  createdAt: number;
}

export interface Procedure {
  id?: number;
  patientId: number;
  rvsCode: string;
  description: string;
  procedureDate: number;
  surgeon: string;
  anesthesiologist?: string;
  findings?: string;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: number;
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
  encounterId?: number;
  status: 'unpaid' | 'paid' | 'void';
  philhealthBenefit: number;
  hmoCoverage: number;
  hmoProvider?: string;
  seniorDiscount: number;
  vatExemption: number;
  totalActualCharges: number;
  netAmount: number;
  amountPaid: number;
  createdAt: number;
  updatedAt: number;
}

export interface BillingItem {
  id?: number;
  billingId: number;
  inventoryId?: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  type: 'MEDICINE' | 'ROOM' | 'LAB' | 'PF';
}

export class HISDatabase extends Dexie {
  patients!: Table<PatientRecord>;
  inventory!: Table<InventoryItem>;
  stocks!: Table<StockBatch>;
  billing!: Table<BillingRecord>;
  billingItems!: Table<BillingItem>;
  rooms!: Table<Room>;
  beds!: Table<Bed>;
  admissions!: Table<Admission>;
  orders!: Table<MedicalOrder>;
  procedures!: Table<Procedure>;

  constructor() {
    super('HISDatabase');
    this.version(7).stores({
      patients: '++id, status, lastName, patientPIN, memberPIN, diagnosisCode',
      inventory: '++id, name, genericName, pndfCode',
      stocks: '++id, inventoryId, expiryDate',
      billing: '++id, patientId, encounterId, status',
      billingItems: '++id, billingId, inventoryId, type',
      rooms: '++id, name, type',
      beds: '++id, roomId, status',
      admissions: '++id, patientId, bedId, status',
      orders: '++id, patientId, type, status',
      procedures: '++id, patientId, rvsCode, status'
    });
  }
}

export const db = new HISDatabase();

export async function savePatientRecord(record: Omit<PatientRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  return await db.patients.add({
    ...record,
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}
