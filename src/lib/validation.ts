import { type PatientRecord } from './db';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateForPhilHealth(record: PatientRecord): ValidationResult {
  const errors: string[] = [];

  // 1. Mandatory Demographics (PCDI Release 01)
  if (!record.firstName) errors.push('First Name is required.');
  if (!record.lastName) errors.push('Last Name is required.');
  if (!record.birthDate) errors.push('Birth Date is required.');
  if (!record.sex) errors.push('Sex is required.');
  if (!record.civilStatus) errors.push('Civil Status is required.');
  if (!record.nationality) errors.push('Nationality is required.');

  // 2. PhilHealth Specifics (eClaims 3.0)
  if (!record.memberPIN || record.memberPIN.replace(/-/g, '').length !== 12) {
    errors.push('A valid 12-digit Member PIN is required.');
  }
  if (!record.membershipType) errors.push('Membership Category is required.');
  if (!record.relationshipToMember) errors.push('Relationship to Member is required.');

  // 3. Clinical Specifics (DOH/PhilHealth)
  if (!record.chiefComplaint || record.chiefComplaint.length < 5) {
    errors.push('A valid Chief Complaint is required (min 5 characters).');
  }
  if (!record.diagnosisCode) errors.push('ICD-10 Diagnosis Code is required.');
  
  // Vitals check (Mandatory for DOH/PhilHealth PCDI)
  if (!record.vitals) {
    errors.push('Patient Vitals are missing.');
  } else {
    if (!record.vitals.bpSystolic || record.vitals.bpSystolic <= 0) errors.push('Valid BP Systolic is required.');
    if (!record.vitals.bpDiastolic || record.vitals.bpDiastolic <= 0) errors.push('Valid BP Diastolic is required.');
    if (!record.vitals.temp || record.vitals.temp < 30 || record.vitals.temp > 45) errors.push('Valid Temperature is required.');
    if (!record.vitals.weight || record.vitals.weight <= 0) errors.push('Valid Weight is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
