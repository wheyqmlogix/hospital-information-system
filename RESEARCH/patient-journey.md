# Implementation Plan - Patient Journey (Admission, Discharge, Billing)

This plan outlines the implementation of a comprehensive patient journey module, covering admission, discharge, and billing calculations, adhering to HL7 FHIR naming conventions and Philippine-specific requirements.

## 1. Schema Updates

Update `prisma/schema.prisma` to model the patient lifecycle and financial tracking.

### Changes:
- **Admission Model:**
  - One-to-many relationship with `Patient`.
  - Fields: `admittedAt`, `dischargedAt`, `admittingDiagnosis`, `roomNumber`, `ward`.
  - PhilHealth: `isPhilHealthMember` (Boolean), `philHealthPIN` (String).
  - Compliance: `dpaConsentTimestamp` (DateTime).
  - Status: `AdmissionStatus` enum (`ADMITTED`, `DISCHARGED`, `PENDING_BILLING`, `CANCELLED`).
- **Billing Enhancements:**
  - Link `BillingRecord` to `Admission`.
  - Ensure `Decimal` types for all currency fields.
  - Add fields for `caseRateAmount`, `discountAmount`, and `vatExemptAmount`.

## 2. Offline Capability (Dexie.js)

Update `src/lib/offline/db.ts` to support offline admission capture.
- Add `admissions` table to Dexie schema.
- Synchronize offline admissions to the server when connectivity is restored.

## 3. Module 1: Patient Admission (The Entry Point)

**Goal:** Capture clinical and administrative data while maintaining the link between the patient and the attending physician.

- **Server Action (`src/app/api/admissions/actions.ts`):** `createAdmission`
  - **Validation:** Check if the patient status is already `INPATIENT` or has an active `Admission`.
  - **Transaction:** 
    1. Create the `Admission` record.
    2. Update `Patient.status` to `INPATIENT`.
    3. Update `Bed.status` to `OCCUPIED`.
  - **Compliance:** Ensure `dpaConsentTimestamp` is captured.

## 4. Module 2: Patient Discharge (The Transition)

**Goal:** Clinical clearance and summary preparation.

- **Service Logic (`src/lib/clinical/discharge.ts`):** `processDischarge`
  - **Validation:** Check that all `LabRequest` and `RadiologyRequest` records for the admission are `COMPLETED`.
  - **Requirements:** Ensure `DischargeSummary` (Final Diagnosis, Home Medications, Follow-up Instructions) is provided.
  - **Transaction:**
    1. Create discharge record.
    2. Update `Admission.status` to `PENDING_BILLING`.
    3. Set `Admission.dischargedAt`.
    4. Set `Bed.status` to `AVAILABLE`.
  - **Notification:** Trigger a mock billing notification.

## 5. Module 3: Billing & PhilHealth Case Rates (The Financials)

**Goal:** Accurate calculation of totals, deductions, and discounts.

- **Billing Engine (`src/lib/billing/engine.ts`):** `calculateAdmissionBill`
  - **Cost Aggregation:** Sum `ServiceCharge`, `MedicationOrder`, and `RoomRate` records linked to the `AdmissionID`.
  - **PhilHealth Logic:** Lookup 'Case Rates' based on the primary diagnosis (simplified lookup table). Subtract from the Gross Total.
  - **Senior/PWD Discount:** 
    - Identify eligible items (non-VAT items).
    - Apply 20% discount on the remaining balance after PhilHealth deduction.
    - Apply VAT exemption.
  - **Precision:** Use `Decimal.js` for all calculations to avoid floating-point errors.
  - **Output:** JSON object with `GrossAmount`, `PhilHealthDeduction`, `DiscountAmount`, and `NetAmountDue`.

## 6. Master Orchestration & API

**Goal:** RESTful API structure following HL7 FHIR standards.

- **API Routes:**
  - `POST /api/admissions`: Register admission.
  - `PATCH /api/admissions/[id]/discharge`: Process discharge.
  - `GET /api/admissions/[id]/bill`: Generate bill.
- **Standards:** Use FHIR-aligned naming (e.g., `Encounter` for Admission if possible, or mapping internal names).
- **Flexibility:** Support partial payments and promissory notes in the `BillingRecord`.

## 7. Verification Plan

### Automated Tests:
- **Billing Unit Tests:** Verify deduction logic for PhilHealth and Senior discounts using various scenarios.
- **Transaction Integration Tests:** Ensure bed status consistency during admission and discharge.
- **Validation Tests:** Confirm discharge fails if labs are pending or summary is missing.

### Manual Verification:
- **Offline Sync:** Verify an admission captured offline correctly syncs and updates the bed status.
- **Timestamp Accuracy:** Confirm `Asia/Manila` timezones are handled correctly in `date-fns-tz`.
