'use client';

import { db } from './db';

export type UserRole = 'ENCODER' | 'DOCTOR' | 'PHARMACIST' | 'CASHIER' | 'ADMIN' | 'NURSE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  licenseNo?: string;
}

const SESSION_KEY = 'his_session';

export function getPermissions(role: UserRole) {
  return {
    canEditDemographics: role === 'ENCODER' || role === 'ADMIN',
    canEditClinical: role === 'DOCTOR' || role === 'ADMIN' || role === 'NURSE',
    canViewFullPIN: role === 'ENCODER' || role === 'ADMIN',
    canAccessSync: role === 'ADMIN',
    canAccessInventory: role === 'PHARMACIST' || role === 'ADMIN',
    canAccessBilling: role === 'CASHIER' || role === 'ADMIN',
  };
}

export async function login(username: string, password: string): Promise<User | null> {
  // Check Dexie for the user
  const user = await db.users.where('username').equals(username).first();
  
  if (user && user.password === password && user.status === 'active') {
    const sessionUser: User = {
      id: user.id!.toString(),
      name: user.name,
      role: user.role as UserRole,
      licenseNo: user.licenseNo
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    await db.users.update(user.id!, { lastLogin: Date.now() });
    return sessionUser;
  }
  
  return null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

// Keep MOCK_USERS for the very first initialization if needed, 
// but we'll transition to the database.
export const MOCK_USERS: User[] = [
  { id: '1', name: 'Maria Santos (Encoder)', role: 'ENCODER' },
  { id: '2', name: 'Dr. Jose Rizal (Doctor)', role: 'DOCTOR' },
  { id: '3', name: 'Pharmacist Pedro', role: 'PHARMACIST' },
  { id: '4', name: 'Cashier Clara', role: 'CASHIER' },
  { id: '5', name: 'Admin User', role: 'ADMIN' },
];
