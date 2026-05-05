# Plan: PhilHealth eClaims Bridge

## Objective
Implement a "Compliance-by-Design" module for real-time PhilHealth eligibility checking and automated claim submission, reducing revenue leakage and manual errors.

## Key Features
- **Real-time Eligibility (RTE):** Seamlessly verify patient eligibility using the existing `EligibilityChecker`.
- **ICD-10 / RVS Lookup:** A searchable database/utility for standardized medical coding.
- **Claim Workflow:** A step-by-step UI for preparing and submitting claims.
- **AI-Ready Audit:** (Infrastructure for) Pre-submission validation of clinical notes against claim requirements.

## Implementation Steps

### 1. PhilHealth Client Utility
- Expand `src/lib/philhealth/client.ts` to include mock API calls for eClaims submission.
- Implement error handling for common PhilHealth API responses.

### 2. ICD-10 / RVS Integration
- Create a local JSON/Mock dataset for common ICD-10 codes used in the Philippines.
- Implement a searchable combo-box component for selecting codes during claim prep.

### 3. Claim Preparation UI
- Create `src/components/patients/claim-form.tsx`.
- Integrate this form into the Patient Detail page under a new "Insurance" or "Claims" tab.

### 4. Eligibility Status Tracking
- Update the `Patient` model or create a `PhilHealthStatus` model to track RTE history.

## Verification & Testing
- **Mock Integration:** Test the end-to-end claim submission workflow using mock endpoints.
- **Code Validation:** Ensure only valid ICD-10/RVS codes can be selected.
- **UX Check:** Verify that the eligibility status is clearly visible to administrative staff.
