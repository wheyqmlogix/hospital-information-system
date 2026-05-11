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
  | "view_lab_orders"
  | "create_lab_orders"
  | "view_billing"
  | "manage_billing"
  | "manage_inventory"
  | "manage_staff"
  | "system_admin";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "view_patients", "edit_patients", "view_admissions", "create_admissions",
    "view_vitals", "add_vitals", "view_lab_orders", "create_lab_orders",
    "view_billing", "manage_billing", "manage_inventory", "manage_staff",
    "system_admin"
  ],
  DOCTOR: [
    "view_patients", "edit_patients", "view_admissions", "create_admissions",
    "view_vitals", "add_vitals", "view_lab_orders", "create_lab_orders"
  ],
  NURSE: [
    "view_patients", "view_admissions", "view_vitals", "add_vitals",
    "view_lab_orders"
  ],
  BILLING: [
    "view_patients", "view_admissions", "view_billing", "manage_billing"
  ],
  PHARMACY: [
    "view_patients", "view_admissions", "manage_inventory"
  ],
  LABORATORY: [
    "view_patients", "view_admissions", "view_lab_orders"
  ]
};

export function hasPermission(user: User, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const allowed = permissions.includes(permission);
  console.log(`Auth Check: User ${user.name} (${user.role}) -> ${permission}: ${allowed}`);
  return allowed;
}

// Mock function to get current user - to be replaced with real auth later
export function getCurrentUser(): User {
  return {
    id: "1",
    name: "Admin User",
    role: "ADMIN"
  };
}

// Server-side version - in a real app, this would check cookies/headers
export async function getServerUser(): Promise<User | null> {
  // Mocking a successful auth check for now
  return {
    id: "1",
    name: "Admin User",
    role: "ADMIN"
  };
}

/**
 * Helper to require a permission in a server-side route.
 * Returns the user if authorized, otherwise throws an error or returns null.
 */
export async function authorize(permission: Permission): Promise<User> {
  console.log(`Authorize Helper called for: ${permission}`);
  const user = await getServerUser();
  if (!user) {
    console.warn("Authorize: No user found");
    throw new Error("Unauthorized: No user session found");
  }
  if (!hasPermission(user, permission)) {
    console.warn(`Authorize: User ${user.role} lacks permission ${permission}`);
    throw new Error(`Unauthorized: Insufficient permissions for ${permission}`);
  }
  console.log("Authorize: Success");
  return user;
}
