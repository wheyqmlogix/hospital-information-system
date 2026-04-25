import { type PatientRecord } from './db';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateForPhilHealth(record: PatientRecord): ValidationResult {
  const errors: string[] = [];

  // 1. Mandatory Demographics
  if (!record.firstName) errors.push('First Name is required.');
  if (!record.lastName) errors.push('Last Name is required.');
  if (!record.birthDate) errors.push('Birth Date is required.');

  // 2. PhilHealth Specifics (eClaims 3.0)
  if (!record.memberPIN || record.memberPIN.length !== 12) {
    errors.push('A valid 12-digit Member PIN is required.');
  }
  if (!record.membershipType) errors.push('Membership Category is required.');

  // 3. Clinical Specifics (DOH/PhilHealth)
  if (!record.chiefComplaint) errors.push('Chief Complaint is required.');
  if (!record.diagnosisCode) errors.push('ICD-10 Diagnosis Code is required.');
  
  // Vitals check
  if (!record.vitals?.bpSystolic || record.vitals.bpSystolic <= 0) {
    errors.push('Valid Blood Pressure (Systolic) is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
