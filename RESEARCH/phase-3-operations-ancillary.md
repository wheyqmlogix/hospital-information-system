# Plan: Phase 3 - Operations & Ancillary

## Objective
Streamline hospital operations by integrating ancillary services (Lab/Radiology) and implementing tight inventory controls for the pharmacy and medical supplies.

## Key Features
- **Inventory/Pharmacy Management:** Batch tracking, expiry alerts, and "Order-to-Dispense" workflow.
- **Ancillary Services (LIS/RIS):** Digital request system for Laboratory and Radiology with status tracking (Pending, In-Progress, Completed).
- **Results Management:** Ability to upload/input results and link them to the patient's EMR.
- **Patient Portal (Phase 1):** Secure login for patients to view their history and schedule appointments.

## Implementation Steps

### 1. Inventory & Pharmacy Schema
- Create `InventoryItem`, `StockTransaction`, and `PharmacyOrder` models in Prisma.
- Implement batch tracking (Batch No, Expiry Date) to prevent wastage.

### 2. Ancillary Request Workflow
- Create `LabRequest` and `RadiologyRequest` models.
- Implement a "New Order" UI on the Patient Detail page for clinicians.
- Create an "Ancillary Dashboard" for lab/rad technicians to manage pending tasks.

### 3. Inventory Management UI
- Build an "Inventory Overview" page for hospital administrators.
- Implement "Low Stock" and "Near Expiry" indicators.

### 4. Patient Portal Foundation
- Set up a separate layout/route for `/portal`.
- Implement a simple "Appointment Request" form for patients.

## Verification & Testing
- **Fulfillment Loop:** Verify that a clinical order (e.g., CBC) correctly appears in the Lab Dashboard and its completion updates the patient record.
- **Stock Accuracy:** Test stock deductions when items are dispensed from the pharmacy.
- **Expiry Logic:** Ensure near-expiry items are flagged correctly in the system.
