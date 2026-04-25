export interface DiscountResult {
  grossAmount: number;
  philhealthBenefit: number;
  hmoCoverage: number;
  vatExemption: number;
  seniorDiscount: number;
  netAmount: number;
}

/**
 * Advanced Multi-Payor Billing (Philippine Standard)
 * Logic Sequence:
 * 1. Start with Total Actual Charges.
 * 2. Deduct PhilHealth Case Rate.
 * 3. Deduct HMO Coverage (if any).
 * 4. Apply 12% VAT Exemption on the remaining balance (if Senior/PWD).
 * 5. Apply 20% Senior/PWD Discount on the VAT-exempt balance.
 * 6. Result is the Final Out-of-Pocket Balance.
 */
export function computeAdvancedPHBilling(
  actualCharges: number,
  philhealthBenefit: number,
  hmoCoverage: number,
  isSeniorOrPWD: boolean
): DiscountResult {
  // Deduct Primary Payors first
  const afterPrimary = actualCharges - philhealthBenefit - hmoCoverage;
  
  let vatExemption = 0;
  let seniorDiscount = 0;
  let netAmount = Math.max(0, afterPrimary);

  if (isSeniorOrPWD && netAmount > 0) {
    // VAT Exemption: Current Balance / 1.12 to get VAT-exempt base
    const vatExemptBase = netAmount / 1.12;
    vatExemption = netAmount - vatExemptBase;
    
    // 20% Discount on the VAT-exempt base
    seniorDiscount = vatExemptBase * 0.20;
    netAmount = vatExemptBase - seniorDiscount;
  }

  return {
    grossAmount: actualCharges,
    philhealthBenefit,
    hmoCoverage,
    vatExemption,
    seniorDiscount,
    netAmount: Math.max(0, netAmount),
  };
}
