export interface DiscountResult {
  grossAmount: number;
  philhealthBenefit: number;
  vatExemption: number;
  seniorDiscount: number;
  netAmount: number;
}

/**
 * Computes billing with Philippine-specific discount sequencing:
 * 1. Deduct PhilHealth Benefit first.
 * 2. Deduct 12% VAT Exemption (on remaining balance).
 * 3. Deduct 20% Senior/PWD Discount (on VAT-exempt balance).
 */
export function computePHBilling(
  actualCharges: number,
  philhealthBenefit: number,
  isSeniorOrPWD: boolean
): DiscountResult {
  const afterPhilHealth = actualCharges - philhealthBenefit;
  
  let vatExemption = 0;
  let seniorDiscount = 0;
  let netAmount = afterPhilHealth;

  if (isSeniorOrPWD) {
    // VAT Exemption: Gross / 1.12 to get VAT-exempt base
    const vatExemptBase = afterPhilHealth / 1.12;
    vatExemption = afterPhilHealth - vatExemptBase;
    
    // 20% Discount on the VAT-exempt base
    seniorDiscount = vatExemptBase * 0.20;
    netAmount = vatExemptBase - seniorDiscount;
  }

  return {
    grossAmount: actualCharges,
    philhealthBenefit,
    vatExemption,
    seniorDiscount,
    netAmount: Math.max(0, netAmount), // Ensure no negative balance
  };
}
