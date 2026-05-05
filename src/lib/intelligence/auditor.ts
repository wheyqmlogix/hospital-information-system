export interface AuditResult {
  score: number; // 0 to 100
  status: "PASSED" | "WARNING" | "FAILED";
  findings: string[];
  recommendations: string[];
}

export const aiAuditor = {
  auditClinicalNote: (note: any): AuditResult => {
    const findings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (!note.subjective || note.subjective.length < 10) {
      score -= 20;
      findings.push("Insufficient Subjective documentation.");
      recommendations.push("Ensure patient symptoms and history are clearly detailed.");
    }

    if (!note.objective || note.objective.length < 10) {
      score -= 20;
      findings.push("Insufficient Objective findings.");
      recommendations.push("Document physical examination results or vital signs explicitly.");
    }

    if (!note.assessment) {
      score -= 25;
      findings.push("Missing Assessment/Diagnosis.");
      recommendations.push("Provide a clear medical assessment based on the SOAP format.");
    }

    if (!note.icd10Code) {
      score -= 15;
      findings.push("No ICD-10 code linked to this note.");
      recommendations.push("Select a valid ICD-10 code to ensure claim approval.");
    }

    const status = score >= 80 ? "PASSED" : score >= 50 ? "WARNING" : "FAILED";

    return { score, status, findings, recommendations };
  },

  auditClaimCompliance: (patient: any, claimData: any): AuditResult => {
    const findings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for PhilHealth ID
    if (!patient.philHealthId) {
      score -= 50;
      findings.push("Patient is missing a PhilHealth ID.");
      recommendations.push("Register a valid PhilHealth ID before filing.");
    }

    // Check if diagnosis matches any clinical note
    const hasMatchingNote = patient.clinicalNotes?.some(
      (note: any) => note.icd10Code === claimData.diagnosis || note.diagnosis?.includes(claimData.diagnosis)
    );

    if (!hasMatchingNote) {
      score -= 30;
      findings.push("Claim diagnosis does not match any clinical documentation.");
      recommendations.push("Ensure clinical SOAP notes justify the diagnosis being claimed.");
    }

    const status = score >= 80 ? "PASSED" : score >= 40 ? "WARNING" : "FAILED";

    return { score, status, findings, recommendations };
  }
};
