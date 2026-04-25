# Implementation Plan: User Module for HIS

This plan implements a complete User Management and Authentication module for the Hospital Information System, replacing the current mock authentication with a persistent, role-based system.

## 1. Objectives
- **Persistence**: Store user accounts in both PostgreSQL (via Prisma) and IndexedDB (via Dexie) for offline-first capability.
- **User Management**: provide an interface for Admins to manage staff accounts.
- **Authentication**: Implement a secure-ish (prototype level) login flow.
- **RBAC**: Refine the Role-Based Access Control system.

## 2. Technical Strategy

### Phase 1: Data Model Expansion
**Goal:** Define the User entity in both databases.

- **`prisma/schema.prisma`**:
    - Add `User` model: `id, username, password, name, role, licenseNo, status`.
- **`src/lib/db.ts`**:
    - Add `UserAccount` interface.
    - Add `users` table to Dexie stores: `++id, username, role, status`.

### Phase 2: User Management UI
**Goal:** Create an administrative interface for managing staff.

- **New Component `UserManagement.tsx`**:
    - Table of users with their roles.
    - Form to create new users.
    - Ability to reset passwords or deactivate accounts.
- **Integration**:
    - Add a "STAFF MGMT" tab to the `Home` component, restricted to `ADMIN`.

### Phase 3: Authentication & Session
**Goal:** Implement a login screen and session management.

- **New Component `Login.tsx`**:
    - Simple credentials form.
- **Update `src/lib/auth.ts`**:
    - Add functions: `login(username, password)`, `logout()`, `getCurrentUser()`.
    - Use local storage or Dexie to persist the current session for offline use.
- **Update `src/app/page.tsx`**:
    - Show `Login` if no user is authenticated.

### Phase 4: Security & Compliance
- Ensure `licenseNo` is captured for Doctors (PRC License) and Pharmacists (PDEA/S2 License).
- Audit logs for user actions (already partially implemented for Dangerous Drugs).

## 3. Verification & Testing
- **Login Test**: Verify that valid credentials grant access and invalid ones are rejected.
- **RBAC Test**: Ensure a user with role `CASHIER` cannot access the `Bed Map` or `Doctor Orders`.
- **Offline Auth**: Verify that a user can "log in" (if previously authenticated) while offline.
