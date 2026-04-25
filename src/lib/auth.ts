'use client';

export type UserRole = 'ENCODER' | 'DOCTOR' | 'PHARMACIST' | 'CASHIER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// Simple simulation of an auth state for the prototype
export const MOCK_USERS: User[] = [
  { id: '1', name: 'Maria Santos (Encoder)', role: 'ENCODER' },
  { id: '2', name: 'Dr. Jose Rizal (Doctor)', role: 'DOCTOR' },
  { id: '3', name: 'Pharmacist Pedro', role: 'PHARMACIST' },
  { id: '4', name: 'Cashier Clara', role: 'CASHIER' },
  { id: '5', name: 'Admin User', role: 'ADMIN' },
];

export function getPermissions(role: UserRole) {
  return {
    canEditDemographics: role === 'ENCODER' || role === 'ADMIN',
    canEditClinical: role === 'DOCTOR' || role === 'ADMIN',
    canViewFullPIN: role === 'ENCODER' || role === 'ADMIN',
    canAccessSync: role === 'ADMIN',
    canAccessInventory: role === 'PHARMACIST' || role === 'ADMIN',
    canAccessBilling: role === 'CASHIER' || role === 'ADMIN',
  };
}
