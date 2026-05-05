# Plan: Clinical User Management & RBAC Implementation

## Background & Motivation
The Hospital Information System (HIS) requires a robust authentication and authorization system to protect sensitive patient health information (PHI) and comply with the Philippine Data Privacy Act of 2012 (DPA). This module establishes the identity and access management (IAM) foundation for all clinical and administrative staff.

## Scope & Impact
- **Database:** Significant schema update to include IAM entities (Users, Roles, Permissions, Departments, Audit Logs).
- **Security:** Introduction of `NextAuth.js` for session management and RBAC.
- **Offline:** Local persistence of permissions via `Dexie` for low-connectivity environments (e.g., Radiology).
- **Compliance:** Automated audit logging and PST timezone enforcement.

## Proposed Solution
- **IAM Schema:** Implements a nested RBAC model where Roles contain Permissions. Users have a Primary Department but can be assigned to multiple via a many-to-many junction table.
- **Authentication:** `NextAuth.js` with Credentials Provider. Sessions expire after 30 mins of inactivity.
- **Redirection Logic:** Middleware-level routing based on user roles.
- **Audit System:** A centralized utility to record mutations for compliance.

## Alternatives Considered
- **Simple Role Column:** Rejected. Clinical environments require granular permissions (e.g., "can_prescribe" vs "can_view_records") that a single role string cannot provide.
- **Standard `localStorage` for Offline:** Rejected. `Dexie` (IndexedDB) provides better performance and structured querying for complex permission sets.

## Phased Implementation Plan

### Phase 1: Infrastructure & Schema
1.  **Dependencies:** Install `next-auth`, `dexie`, `bcryptjs`, `date-fns-tz`.
2.  **Prisma Fix:** Fix the `datasource` URL in `schema.prisma` and append IAM models (`User`, `Role`, `Permission`, `Department`, `AuditLog`, `UserDepartment`).
3.  **Seed Script:** Create `prisma/seed.ts` with default HIS roles and departments.
4.  **Prisma Client:** Regenerate and verify connection.

### Phase 2: Security & Authentication
1.  **NextAuth Setup:** Configure `src/app/api/auth/[...nextauth]/route.ts` with 30-min expiration.
2.  **Middleware:** Implement `src/middleware.ts` for role-based redirection and access control.
3.  **Audit Utility:** Create `src/lib/audit.ts` to capture DPA-compliant logs.
4.  **PST Utility:** Create `src/lib/date-utils.ts` for consistent timezone handling.

### Phase 3: API & Offline
1.  **User API:** Implement `/api/users` with department/role filtering and clinical validation.
2.  **Dexie Setup:** Create `src/lib/offline/db.ts` to sync user metadata and permissions.
3.  **Permissions Hook:** Create `usePermissions` hook that checks local Dexie storage.

### Phase 4: Frontend Implementation
1.  **Staff Directory:** Build `src/app/staff/page.tsx` with filtering and status indicators.
2.  **Provisioning Form:** Build `src/components/staff/user-provisioning-form.tsx` (multi-step).
3.  **Login Page:** Implement a professional, medical-grade login interface.
4.  **403 Page:** Create a custom "Access Denied" page for unauthorized attempts.

## Verification
- **RBAC Test:** Verify a 'Nurse' cannot access 'Admin' settings.
- **Audit Test:** Verify every user creation/edit generates an entry in the `AuditLog`.
- **Offline Test:** Simulate network loss and verify `usePermissions` still works via Dexie.
- **Security Test:** Verify session timeout after 30 minutes.

## Migration & Rollback
- **Migration:** Run `npx prisma migrate dev` to apply schema changes.
- **Rollback:** Revert schema changes and restore DB backup.
