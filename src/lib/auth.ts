import { StaffRole } from "@prisma/client";

export type Role = StaffRole;

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
}

export type Permission = 
  | "view_patients"
  | "edit_patients"
  | "view_admissions"
  | "create_admissions"
  | "view_vitals"
  | "add_vitals"
  | "view_clinical_notes"
  | "add_clinical_notes"
  | "view_lab_orders"
  | "create_lab_orders"
  | "manage_lab_results"
  | "view_billing"
  | "manage_billing"
  | "manage_inventory"
  | "manage_staff"
  | "system_admin";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "view_patients", "edit_patients", "view_admissions", "create_admissions",
    "view_vitals", "add_vitals", "view_clinical_notes", "add_clinical_notes",
    "view_lab_orders", "create_lab_orders", "manage_lab_results",
    "view_billing", "manage_billing", "manage_inventory", "manage_staff",
    "system_admin"
  ],
  DOCTOR: [
    "view_patients", "edit_patients", "view_admissions", "create_admissions",
    "view_vitals", "add_vitals", "view_clinical_notes", "add_clinical_notes",
    "view_lab_orders", "create_lab_orders", "manage_lab_results"
  ],
  NURSE: [
    "view_patients", "edit_patients", "view_admissions", "view_vitals", "add_vitals",
    "view_clinical_notes", "add_clinical_notes", "view_lab_orders"
  ],
  BILLING: [
    "view_patients", "view_admissions", "view_billing", "manage_billing"
  ],
  PHARMACY: [
    "view_patients", "view_admissions", "manage_inventory"
  ],
  LABORATORY: [
    "view_patients", "view_admissions", "view_lab_orders", "manage_lab_results"
  ]
};

export function hasPermission(user: User, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const allowed = permissions.includes(permission);
  console.log(`Auth Check: User ${user.name} (${user.role}) -> ${permission}: ${allowed}`);
  return allowed;
}

// Client-side only - should not be used for real auth decisions
export function getCurrentUser(): User | null {
  return null;
}
