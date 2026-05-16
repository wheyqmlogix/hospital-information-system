# Plan: Central Supply Room (CSR) Module

Add a dedicated inventory management module for the Central Supply Room (CSR) to track medical supplies (non-medications).

## Objective
Implement a robust inventory system for CSR items like gauze, syringes, gloves, and surgical tools, mirroring the existing pharmacy logic but optimized for general supplies.

## Key Files & Context
- `prisma/schema.prisma`: New models for `SupplyItem`, `SupplyBatch`, and `SupplyTransaction`.
- `src/app/api/csr/route.ts`: API for supply items.
- `src/app/api/csr/transactions/route.ts`: API for activity tracking.
- `src/app/api/csr/restock/route.ts`: API for stock intake.
- `src/app/(dashboard)/csr/page.tsx`: Main CSR dashboard.
- `src/components/layout/sidebar.tsx`: Navigation update.

## Implementation Steps

### 1. Schema Update
- Add `SupplyItem` model to track base supply details.
- Add `SupplyBatch` model for FEFO (First-Expiry-First-Out) tracking.
- Add `SupplyTransaction` model for audit trails (STOCK_IN, DISPENSE, etc.).
- Update `StaffRole` enum to include `CSR`.

### 2. API Routes
- Implement standard CRUD for `SupplyItem`.
- Implement a restocking endpoint that creates `SupplyBatch` and `SupplyTransaction` records.
- Implement a transaction history endpoint.

### 3. UI Components
- **CSR Inventory Page**: A high-density grid for monitoring stock levels, reorder alerts, and recent activity.
- **Supply Form**: Modal for registering new items.
- **Restock Modal**: Modal for adding batch-specific stock.

### 4. Navigation
- Add "Central Supply (CSR)" to the Sidebar under the "Core Operations" section.

## Verification & Testing
- **Manual Test**: Register a new supply item (e.g., "Surgical Gloves").
- **Manual Test**: Perform a "Stock In" for a batch with an expiry date.
- **Manual Test**: Verify stock levels update correctly and transactions appear in the feed.
- **Visual Audit**: Ensure the CSR module matches the "Institutional Swiss" aesthetic (sharp edges, all-caps labels, midnight navy accents).
