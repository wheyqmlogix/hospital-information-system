# Plan: Master Patient Index (MPI)

## Objective
Establish a robust, centralized Master Patient Index (MPI) that serves as the "Single Source of Truth" for patient identification, specifically optimized for the Philippine healthcare context.

## Key Features
- **Philippine-Specific Demographics:** Inclusion of Senior Citizen ID, PWD ID, and detailed address fields (Barangay, City, Province).
- **Advanced Patient Form:** A comprehensive form for onboarding patients with validation.
- **Enhanced Profile View:** A 360-degree view of the patient's record.
- **Biometric Ready:** Infrastructure to support future biometric (fingerprint/facial) identification.

## Implementation Steps

### 1. Database Schema Update
- Update `prisma/schema.prisma` to include:
    - `seniorCitizenId`, `pwdId`.
    - `religion`, `occupation`.
    - Structured address: `barangay`, `city`, `province`, `zipCode`.
    - `nationality`.
- Run `npx prisma generate`.

### 2. Patient Onboarding Form
- Implement `src/components/patients/patient-form.tsx`.
- Use `react-hook-form` and `zod` for validation.
- Ensure responsive design for mobile use (Doctor Mobility).

### 3. API Enhancements
- Update `src/app/api/patients/route.ts` to handle new fields.
- Implement search by multiple identifiers (PhilHealth ID, National ID, etc.).

### 4. Patient Detail View Refinement
- Update `src/app/patients/[id]/page.tsx` to display new demographic fields.
- Add a "Print ID Card" feature (placeholder).

## Verification & Testing
- **Data Integrity:** Verify that all new fields are correctly persisted in PostgreSQL.
- **Validation:** Test the form with various edge cases (e.g., missing mandatory fields, invalid ID formats).
- **Searchability:** Ensure patients can be found using any of their unique identifiers.
