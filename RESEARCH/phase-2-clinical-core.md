# Plan: Phase 2 - Clinical Core (EMR & Nursing)

## Objective
Digitize the core clinical workflows of the hospital, focusing on structured medical documentation, medication management, and real-time bed occupancy tracking.

## Key Features
- **Structured EMR (SOAP):** Enhanced Digital SOAP notes with templates and ICD-10 linking.
- **e-Prescriptions:** A searchable drug database (PNDF-ready) and electronic prescription generation.
- **Bed Management:** A visual dashboard for room and bed assignments (Admissions/Discharges).
- **Nursing Station (MAR):** Initial Medication Administration Record to track "Who gave What to Whom and When."

## Implementation Steps

### 1. EMR Enhancements
- Update `ClinicalNote` model to support more structured data (e.g., vitals, templates).
- Implement a rich-text or structured editor for SOAP notes in `src/app/patients/[id]/page.tsx`.
- Link diagnoses directly to ICD-10 codes for billing accuracy.

### 2. e-Prescription System
- Create a `Medication` model and a local database of common Philippine medications (PNDF).
- Implement a "New Prescription" dialog with dosage and frequency validation.
- Generate a printable/digital prescription view.

### 3. Bed Management & Occupancy
- Create a `Room` and `Bed` model in Prisma.
- Implement a "Bed Board" component for the main Dashboard.
- Add "Assign Bed" functionality to the Patient Admission workflow.

### 4. Nursing Station (MAR)
- Implement a "Nursing Rounds" view for inpatients.
- Create a simple log for medication administration (MAR).

## Verification & Testing
- **Clinical Accuracy:** Ensure SOAP notes are correctly saved and historical records are easily accessible.
- **Prescription Safety:** Verify that drug dosages and frequencies are captured accurately.
- **Occupancy Logic:** Test bed assignments to ensure no double-booking and accurate real-time status.
