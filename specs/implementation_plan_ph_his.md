# Implementation Plan: Philippine Hospital Information System (PH-HIS)

This plan transforms the market research findings into a functional, compliant, and offline-resilient architecture for the Philippine healthcare landscape.

## 1. Objective
Establish a baseline HIS that complies with **DOH (PCDI)** and **PhilHealth (eClaims 3.0)** standards while maintaining **Offline-First** capabilities for areas with unstable internet.

## 2. Key Files & Context
- `src/lib/db.ts`: Local database schema (Dexie/IndexedDB).
- `src/components/PatientForm.tsx`: Compliance-ready data entry.
- `src/lib/constants.ts`: Standardized codes (ICD-10, Member Categories).

## 3. Phased Implementation Plan

### Phase 1: Compliance-Ready Data Schema
**Goal:** Expand the local database to hold all mandatory fields for PhilHealth and DOH reporting.
- **Changes in `src/lib/db.ts`**:
    - Add `memberPIN`, `patientPIN`, `membershipType` (S, G, I, etc.).
    - Add `relationshipToMember` (M, S, C, P).
    - Add `clinicalData`: Vitals (BP, Temp, Weight), Chief Complaint.
    - Add `diagnosis`: ICD-10 code and description.
    - Add `syncStatus`: `draft`, `validated`, `synced`.

### Phase 2: Localized Clinical & Compliance Forms
**Goal:** Create UI components that enforce Philippine medical standards.
- **New Component `ICD10Search.tsx`**: Searchable dropdown pre-populated with common PH diagnoses (Dengue, Pneumonia, etc.).
- **New Component `PhilHealthSection.tsx`**: Dedicated form section for PINs and Membership Categories.
- **Update `PatientForm.tsx`**: Integrate new sections and add validation for mandatory DOH fields.

### Phase 3: Role-Based Access Control (RBAC)
**Goal:** Address the Data Privacy Act (RA 10173).
- Implement a simple role system:
    - `ENCODER`: Can edit demographics and PhilHealth info.
    - `DOCTOR`: Can edit clinical data and ICD-10 codes.
    - `ADMIN`: Full access to data and logs.

### Phase 4: eClaims Dashboard & Sync Logic
**Goal:** Prepare data for XML submission to PhilHealth.
- Create a dashboard to filter records by `syncStatus`.
- Implement a "Validation" step that checks if a record meets the PhilHealth eClaims 3.0 requirements before syncing.

## 4. Verification & Testing
- **Compliance Check**: Verify that all fields in the `PatientRecord` match the PCDI Release 01.
- **Offline Test**: Save a record in "Offline" mode and verify it persists in IndexedDB.
- **Validation Test**: Ensure the form prevents submission if mandatory fields (e.g., ICD-10 for encounters) are missing.
