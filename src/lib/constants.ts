export const MEMBERSHIP_TYPES = [
  { code: 'S', label: 'Employed - Private' },
  { code: 'G', label: 'Employed - Government' },
  { code: 'I', label: 'Indigent' },
  { code: 'NS', label: 'Individually Paying' },
  { code: 'NO', label: 'OFW' },
  { code: 'PS', label: 'Non-Paying Private' },
  { code: 'PG', label: 'Non-Paying Government' },
  { code: 'P', label: 'Lifetime Member' },
] as const;

export const RELATIONSHIPS = [
  { code: 'M', label: 'Self (Member)' },
  { code: 'S', label: 'Spouse' },
  { code: 'C', label: 'Child' },
  { code: 'P', label: 'Parent' },
] as const;

export const COMMON_DIAGNOSES = [
  { code: 'J18.9', description: 'Pneumonia, unspecified' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'A09.0', description: 'Infectious gastroenteritis and colitis, unspecified' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'A97.9', description: 'Dengue, unspecified' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified' },
  { code: 'A16.2', description: 'Tuberculosis of lung, without mention of bacteriological or histological confirmation' },
  { code: 'I64', description: 'Stroke, not specified as haemorrhage or infarction' },
  { code: 'N18.9', description: 'Chronic kidney disease, unspecified' },
  { code: 'J45.9', description: 'Asthma, unspecified' },
] as const;
