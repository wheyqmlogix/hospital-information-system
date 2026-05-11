# Plan: Master Patient Index (MPI) Implementation - Philippine Standards

## Objective
Implement a high-integrity Master Patient Index (MPI) system tailored for the Philippine healthcare context, prioritizing data integrity, duplicate prevention, and regulatory compliance.

## UI/UX Strategy: "The Gatekeeper"
- **Search-First Entry**: The registration flow starts with a mandatory fuzzy search by Name, PhilHealth PIN, or National ID. The "New Patient" form is only accessible after confirming no existing record exists.
- **Progressive Disclosure Form**:
    - **Step 1: Primary Identifiers**: Mandatory PhilHealth PIN, National ID, and Senior/PWD toggles.
    - **Step 2: PH Demographics**: High-legibility fields for First, Middle, and Last names.
    - **Step 3: Philippine Geographic Hub**: Cascaded selection (Province -> City -> Barangay) for address accuracy.
    - **Step 4: Data Privacy Act (DPA)**: A distinct consent card with timestamping and proxy options.
- **Medical-Grade Aesthetic**: Restrained color palette (Tinted Neutrals + Medical Blue) with high-contrast validation feedback.

## Key Files & Context
- **Schema**: `prisma/schema.prisma` (Define `Patient` model)
- **API**: `src/app/api/patients/route.ts` (Register & Search)
- **Dashboard UI**: `src/app/(dashboard)/patients/page.tsx` (Search hub)
- **Form Component**: `src/components/patients/patient-form.tsx` (Progressive registration)

## Implementation Steps

### Phase 1: Database Schema (PH Identity)
Update `prisma/schema.prisma` with:
- **Identifiers**: `patientId` (Unique/Internal), `philHealthPIN`, `nationalId`, `seniorId`, `pwdId`.
- **PH Geography**: `barangay`, `city`, `province`, `zipCode`.
- **Status**: `PatientStatus` enum (OUTPATIENT, INPATIENT, ER, etc.).
- **Audit**: `dpaConsentTimestamp`, `registeredByUserId`.

### Phase 2: Core API & Fuzzy Search
1. **Fuzzy Search API**: Implement an endpoint that checks for matches across names and multiple ID types.
2. **Registration Action**: Server action with strict Zod validation for PhilHealth formats and duplicate identifier checks.

### Phase 3: Frontend Implementation
1. **Search Dashboard**: Build the landing page for the MPI module with the "Gatekeeper" search bar.
2. **Smart Registration Form**: Implement the multi-step form using `react-hook-form` and `zod`.
3. **PH Address Library Integration**: (Optional/Simulated) Cascaded selection for PH administrative regions.

## Verification & Testing
- **Validation**: Ensure PhilHealth PIN format (XX-XXXXXXXXX-X) is strictly enforced.
- **Duplicate Prevention**: Verify the system blocks registration if a PhilHealth or National ID already exists.
- **UI Responsiveness**: Test the form on tablets and desktop (hospital terminal sizes).
