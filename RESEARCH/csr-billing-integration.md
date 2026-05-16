# Plan: CSR Billing Integration

Automatically add CSR supply items to patient invoices when dispensed.

## Objective
Enable clinical staff to issue CSR items (gauze, syringes, etc.) directly to a patient's admission, which will simultaneously update inventory and the patient's billing statement.

## Key Files & Context
- `src/app/api/admissions/[id]/csr/route.ts`: New endpoint for CSR dispensing.
- `src/components/admissions/csr-issuance.tsx`: New component for dispensing supplies.
- `src/app/(dashboard)/admissions/[id]/page.tsx`: Integrate the new component.
- `src/lib/billing.ts`: Ensure totals calculation handles CSR items correctly.

## Implementation Steps

### 1. API Implementation
- Create `src/app/api/admissions/[id]/csr/route.ts`.
- Implement `POST` for dispensing:
    - Validate stock availability.
    - Perform FEFO (First-Expiry-First-Out) transaction on `SupplyBatch`.
    - Update `SupplyItem` total stock.
    - Create/Get `Invoice` for the admission.
    - Create `InvoiceItem` with category "CSR".
    - Recalculate and update `Invoice` totals.
- Implement `GET` to fetch issued supplies for the admission.

### 2. UI Component
- Create `src/components/admissions/csr-issuance.tsx`.
- Use the **Institutional Calm** aesthetic:
    - 2px/4px corners.
    - Midnight navy accents.
    - All-caps technical labels.
- Provide a searchable selector for CSR items.
- Display a high-density list of issued supplies.

### 3. Page Integration
- Update the admission details page (`src/app/(dashboard)/admissions/[id]/page.tsx`) to include a new tab or section for "Central Supply / CSR".

### 4. Verification & Testing
- **Manual Test**: Issue a "Surgical Glove" to an active admission.
- **Verification**: Check if CSR stock decreases.
- **Verification**: Check if the item appears on the patient's Billing Statement with the correct price.
- **Verification**: Ensure SC/PWD discounts apply correctly to CSR items.
