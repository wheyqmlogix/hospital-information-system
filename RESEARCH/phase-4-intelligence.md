# Plan: Phase 4 - Intelligence & Analytics

## Objective
Transform the HIS from a "System of Record" to a "System of Intelligence" by providing AI-driven auditing and real-time executive insights.

## Key Features
- **Agentic AI Auditor (Infrastructure):** A pre-submission audit tool that scans clinical notes and billing items for PhilHealth compliance errors.
- **Executive KPI Dashboard:** Real-time visualization of Revenue Leakage, Average Length of Stay (ALOS), and Bed Turnover.
- **Financial Analytics:** Deep dive into "PhilHealth Share" vs. "HMO Share" vs. "Patient Share" to optimize revenue cycle management (RCM).
- **Advanced Patient Portal:** Secure document sharing (Lab results/Prescriptions) and digital payments integration placeholder.

## Implementation Steps

### 1. AI Auditor Utility
- Create `src/lib/intelligence/auditor.ts`.
- Implement heuristic-based "Compliance Scores" for clinical notes (e.g., checking for ICD-10 presence if billed).
- Add an "AI Audit" status to the Claim Preparation UI.

### 2. Executive Analytics Route
- Create `src/app/analytics/page.tsx`.
- Implement high-level stats cards for "Hospital Revenue (MTD)" and "Total PhilHealth Claims".
- Add charts for Occupancy Trends and Revenue Breakdown.

### 3. Patient Portal Expansion
- Build `/portal/results` and `/portal/prescriptions` views.
- Implement a "Patient Timeline" view to show their medical journey.

### 4. Revenue Leakage Tracker
- Implement logic to identify "Unbilled Services" (orders with no corresponding billing item).
- Add a "Leakage Alert" to the Executive Dashboard.

## Verification & Testing
- **Audit Accuracy:** Verify that the AI Auditor correctly flags missing documentation.
- **Data Visualization:** Ensure charts correctly reflect the data in PostgreSQL/Prisma.
- **Portal Security:** Basic check for data isolation (patients can only see their own records).
