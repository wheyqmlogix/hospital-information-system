import { type PatientRecord } from './db';

export interface MorbidityData {
  code: string;
  description: string;
  count: number;
}

export function getMorbidityStats(records: PatientRecord[]): MorbidityData[] {
  const stats: Record<string, { description: string, count: number }> = {};

  records.forEach(record => {
    if (record.diagnosisCode) {
      if (!stats[record.diagnosisCode]) {
        stats[record.diagnosisCode] = {
          description: record.diagnosisDescription || 'Unknown',
          count: 0
        };
      }
      stats[record.diagnosisCode].count += 1;
    }
  });

  return Object.entries(stats)
    .map(([code, data]) => ({
      code,
      description: data.description,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 as required by DOH
}

export function getDemographicStats(records: PatientRecord[]) {
  const sex = { Male: 0, Female: 0 };
  const ageGroups = {
    Pediatric: 0, // 0-18
    Adult: 0,     // 19-59
    Senior: 0     // 60+
  };

  const currentYear = new Date().getFullYear();

  records.forEach(record => {
    if (record.sex) sex[record.sex]++;
    
    if (record.birthDate) {
      const age = currentYear - new Date(record.birthDate).getFullYear();
      if (age <= 18) ageGroups.Pediatric++;
      else if (age < 60) ageGroups.Adult++;
      else ageGroups.Senior++;
    }
  });

  return { sex, ageGroups };
}
