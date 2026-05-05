export interface ICD10Code {
  code: string;
  description: string;
}

export interface RVSCode {
  code: string;
  description: string;
  rvu: number; // Relative Value Unit
}

export const commonICD10: ICD10Code[] = [
  { code: "A09.0", description: "Other and unspecified gastroenteritis and colitis of infectious origin" },
  { code: "J18.9", description: "Pneumonia, unspecified organism" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "K29.7", description: "Gastritis, unspecified" },
  { code: "N39.0", description: "Urinary tract infection, site not specified" },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
  { code: "Z00.0", description: "General adult medical examination" },
  { code: "O80.9", description: "Single spontaneous delivery, unspecified" },
  { code: "A01.0", description: "Typhoid fever" },
];

export const commonRVS: RVSCode[] = [
  { code: "99201", description: "Office or other outpatient visit (New Patient)", rvu: 1.2 },
  { code: "59400", description: "Routine obstetric care (Vaginal Delivery)", rvu: 15.0 },
  { code: "47562", description: "Laparoscopic cholecystectomy", rvu: 25.0 },
  { code: "44950", description: "Appendectomy", rvu: 18.0 },
  { code: "36415", description: "Routine venipuncture", rvu: 0.5 },
];
