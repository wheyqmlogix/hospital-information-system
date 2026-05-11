import { Decimal } from "@prisma/client/runtime/library";

export interface BillingItem {
  unitPrice: number;
  quantity: number;
  isVatable: boolean;
}

export interface BillingResult {
  grossAmount: number;
  vatAmount: number;
  discountAmount: number;
  philHealthAmount: number;
  netAmount: number;
}

/**
 * Calculates the bill according to Philippine standards for SC/PWD.
 * 1. Remove 12% VAT from vatable items (Net of VAT).
 * 2. Apply 20% discount on the Net of VAT amount.
 */
export function calculatePHBilling(
  items: BillingItem[],
  isSeniorOrPWD: boolean = false,
  philHealthAmount: number = 0
): BillingResult {
  let grossAmount = 0;
  let vatAmount = 0;
  let discountAmount = 0;

  items.forEach((item) => {
    const itemTotal = item.unitPrice * item.quantity;
    grossAmount += itemTotal;

    if (isSeniorOrPWD) {
      if (item.isVatable) {
        // VAT Exempt: Remove 12% VAT first
        const netOfVat = itemTotal / 1.12;
        const currentVat = itemTotal - netOfVat;
        
        // 20% Discount on Net of VAT
        const discount = netOfVat * 0.20;
        
        vatAmount += 0; // Senior/PWD are VAT exempt
        discountAmount += (currentVat + discount); // Total 'savings' or deduction
      } else {
        // Already non-vatable, just apply 20% discount
        discountAmount += itemTotal * 0.20;
      }
    } else {
      if (item.isVatable) {
        const netOfVat = itemTotal / 1.12;
        vatAmount += itemTotal - netOfVat;
      }
    }
  });

  const netAmount = grossAmount - discountAmount - philHealthAmount;

  return {
    grossAmount: roundToTwo(grossAmount),
    vatAmount: roundToTwo(vatAmount),
    discountAmount: roundToTwo(discountAmount),
    philHealthAmount: roundToTwo(philHealthAmount),
    netAmount: roundToTwo(netAmount),
  };
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
