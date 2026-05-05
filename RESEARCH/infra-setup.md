# Plan: Technical Infrastructure (Prisma, PostgreSQL, PWA & Offline)

## Objective
Establish the technical foundation for the HIS, ensuring data persistence with Prisma/PostgreSQL and high availability/offline support via PWA features.

## Key Technologies
- **ORM:** Prisma
- **Database:** PostgreSQL
- **PWA:** `next-pwa` or native Service Workers.
- **State Management/Sync:** TanStack Query (React Query) for caching and offline data synchronization.
- **Local Storage:** IndexedDB (via `idb` or similar) for persistent offline storage of clinical data.

## Implementation Steps

### 1. Prisma & PostgreSQL Setup
- Install `@prisma/client` and `prisma`.
- Initialize Prisma: `npx prisma init`.
- Define the initial schema:
    - `Patient` (Master Patient Index fields).
    - `Appointment`
    - `BillingRecord`
    - `ClinicalNote` (EMR).
- Configure environment variables for PostgreSQL.

### 2. PWA Configuration
- Configure `next.config.js` to support PWA.
- Create `manifest.json` with hospital-branded icons and theme colors.
- Implement Service Worker for caching static assets and API routes.

### 3. Offline-First Strategy
- **TanStack Query:** Configure with `persistQueryClient` to cache API responses in `localStorage` or `IndexedDB`.
- **Synchronization Logic:**
    - Implement a queue for "Pending Sync" actions (e.g., newly created patient records while offline).
    - Use a Background Sync API (if supported) or a "Manual Sync" trigger when the connection is restored.
- **UI Indicators:** Add a "Connection Status" indicator in the Header (Online/Offline/Syncing).

### 4. Mobile & Tablet Optimization
- Audit and refine existing Tailwind classes for touch targets (larger buttons).
- Implement "Pull-to-Refresh" for clinical lists.
- Responsive layout adjustments for tablet-sized charts and data tables.

## Verification & Testing
- **Offline Simulation:** Use Chrome DevTools to simulate "Offline" mode and verify data availability.
- **Database Persistence:** Verify that records are correctly saved to PostgreSQL via Prisma.
- **PWA Install:** Verify the "Install App" prompt appears on mobile devices.
