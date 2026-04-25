# Implementation Plan: Inventory & Billing Modules (PH-HIS Expansion)

This expansion adds pharmacy inventory management and patient billing modules to the PH-HIS, strictly adhering to **DOH Pharmacy Standards (HPMM 4th Ed)** and **PhilHealth/Senior/PWD Billing Laws**.

## 1. Objectives
- **Inventory:** Implement FEFO (First-Expiry-First-Out) stock tracking and PNDF compliance.
- **Billing:** Automate "Statement of Account" generation with proper PhilHealth, Senior, and PWD discount sequencing.

## 2. Technical Strategy

### Phase 1: Data Model Expansion (`src/lib/db.ts`)
Add new tables for Inventory and Billing:
- **`inventory`**: `id, name, genericName, pndfCode, vatExempt, isDangerousDrug, price`.
- **`stocks`**: `id, inventoryId, batchNumber, expiryDate, quantity` (for FEFO logic).
- **`billing`**: `id, encounterId, patientId, status (paid/unpaid), totalActualCharges, philhealthBenefit, seniorDiscount, netAmount`.
- **`billingItems`**: `id, billingId, inventoryId, quantity, unitPrice, subtotal`.

### Phase 2: Pharmacy & Inventory Module
- **Component `StockManagement.tsx`**: Add/edit items, track batches, and highlight soon-to-expire drugs.
- **Logic**: Implement a helper function to deduct stock using FEFO (consuming batches with earliest expiry first).

### Phase 3: Billing & Discount Engine
- **Component `BillingModule.tsx`**: Interface to add charges (room, labs, medicines) to a patient's bill.
- **Computation Logic**:
    1. Apply PhilHealth Case Rate (if applicable).
    2. Apply 12% VAT exemption (Amount / 1.12).
    3. Apply 20% Senior/PWD Discount on the VAT-exempt balance.
- **Component `StatementOfAccount.tsx`**: A printable, compliant SOA layout.

### Phase 4: Integration
- Add "Pharmacy" and "Billing" tabs to the main navigation.
- Restrict access to these modules via the RBAC system (PHARMACIST and CASHIER roles).

## 3. Compliance Checklist
- [ ] **VAT Exemption**: Formula `Gross / 1.12`.
- [ ] **Discount Seq**: PhilHealth -> VAT Exemption -> 20% Discount.
- [ ] **FEFO**: Stock deduction logic always picks earliest expiry.
- [ ] **PNDF**: Medicines flagged if not in National Formulary.
