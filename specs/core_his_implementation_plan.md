# Master Implementation Plan: Philippine Core Hospital Information System (HIS)

This plan outlines the transformation of the current prototype into a comprehensive, multi-module "Backbone" system designed for Philippine secondary and tertiary hospitals.

## 1. Core Objectives
- **ADT Lifecycle**: Move from simple registration to a full Admission-Discharge-Transfer (ADT) workflow.
- **Financial Integrity**: Automate complex Philippine billing (PhilHealth, Senior, PWD, and HMO).
- **Clinical Continuity**: Provide doctors and nurses with tools for real-time orders and dietary management.
- **Supply Chain Control**: Integrate pharmacy dispensing directly with patient billing and inventory.

---

## 2. Module Roadmap

### Module A: Patient Management (ADT Lifecycle)
**Goal:** Track the patient's physical location and status within the facility.
- **Features:**
    - **Admission Dashboard**: Assign patients to specific Rooms/Beds (Ward, Semi-Private, Private, ICU).
    - **Room Transfers**: Log moves between departments (e.g., ER to Ward).
    - **Discharge Workflow**: Trigger a "Clearance" process that involves Pharmacy, Lab, and Billing.
- **Technical Entity**: `Confinement` (links Patient to Bed, Doctor, and Timeframe).

### Module B: Billing & Cashiering (Advanced Deductions)
**Goal:** Seamlessly handle the "Multi-Payor" reality of Philippine healthcare.
- **Features:**
    - **HMO Posting**: Deduct fixed amounts or percentages covered by providers (Maxicare, Intellicare, etc.).
    - **Partial Payments**: Support downpayments during confinement.
    - **Official Receipt (OR) Generation**: Create BIR-compliant receipts after payment.
- **Logic**: Sequence = Actual Charges -> PhilHealth Case Rate -> HMO Coverage -> Senior/PWD Discount -> Final Balance.

### Module C: Medical Records (Expanded EMR)
**Goal:** Digitize the physician's clinical workflow.
- **Features:**
    - **Procedure Encoding (RVS)**: Integrate the PhilHealth Relative Value Scale (RVS) for surgical procedures.
    - **Order Management**: Allow doctors to "order" labs or meds, which then appear in the Nurse/Pharmacy queues.
    - **Longitudinal History**: View all previous encounters and labs in a single timeline.

### Module D: Nursing Service & Room Management
**Goal:** Coordinate bedside care and facility logistics.
- **Features:**
    - **Bed Map**: Visual grid of all hospital beds (Occupied vs. Vacant vs. Cleaning).
    - **Dietary Requirements**: Tag patients for specific diets (NPO, Low Salt, Diabetic) for the kitchen.
    - **Vitals Monitoring**: Regular plotting of Temp/BP/Pulse on a clinical chart.

### Module E: Integrated Pharmacy & Inventory
**Goal:** Eliminate "lost charges" by linking dispensing to billing.
- **Features:**
    - **Pharmacy Dispensing**: Pharmacists "fill" orders from doctors; the cost is automatically added to the Patient's SOA.
    - **PNDF Alerts**: Flag non-formulary drug requests.
    - **Low-Stock Notifications**: Automatic alerts when life-saving meds reach reorder points.

---

## 3. Phased Execution

| Phase | Module | Primary Compliance |
| :--- | :--- | :--- |
| **Phase 1** | **ADT & Bed Management** | DOH Licensing (Room Standards) |
| **Phase 2** | **Orders & Pharmacy Link** | PNDF & PDEA (Dangerous Drugs) |
| **Phase 3** | **Advanced Billing & HMO** | PhilHealth Circular 2023-0011 |
| **Phase 4** | **Medical Records (RVS)** | PhilHealth Case Rate System |

---

## 4. Verification & Testing
- **Concurrency Test**: Ensure two nurses can't assign different patients to the same bed.
- **Billing Audit**: Verify that HMO deductions are applied *before* the Senior Citizen discount (as per BIR ruling).
- **Offline Integrity**: Ensure a nurse can encode vitals in a "dead zone" (ICU) and it syncs once at the station.
