# Plan: Basic Billing & Charge Capture

## Objective
Implement a "Charge Capture" system to prevent revenue leakage, specifically tailored for Philippine hospital billing cycles and mandatory discounts.

## Key Features
- **Service Catalog:** A manageable list of hospital services (Room & Board, Labs, etc.) with pricing.
- **Real-time Charge Capture:** Allow clinicians to add charges directly from the Patient Detail view.
- **Mandatory Discounts:** Automated calculation of Senior Citizen (20% + VAT Exemption) and PWD discounts.
- **Statement of Account (SOA):** Generation of a professional, itemized SOA.

## Implementation Steps

### 1. Service Catalog Schema
- Create a `Service` model in `prisma/schema.prisma`.
- Update `BillingRecord` to link to multiple `BillingItem` entries.

### 2. Charge Capture UI
- Add a "Add Charge" dialog to the Patient Detail page.
- Implement auto-complete for services from the catalog.

### 3. Discount Engine
- Implement a utility function `calculateDiscounts(baseAmount, patientType)` that handles Philippine regulatory requirements.

### 4. SOA Generation
- Create a print-friendly SOA view or PDF generator.
- Ensure the layout matches standard Philippine hospital billing formats.

## Verification & Testing
- **Calculation Accuracy:** Rigorously test discount calculations for various totals and patient categories.
- **Revenue Tracking:** Verify that all "captured" charges appear correctly on the final SOA.
- **Print Layout:** Test the SOA rendering on standard paper sizes.
