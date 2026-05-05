import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Mock Case Rate Lookup Table for Philippine HIS.
 * In a real system, this would be a database table with thousands of ICD-10 codes.
 */
const CASE_RATES: Record<string, { level1: number; level2: number }> = {
  "PNEUMONIA": { level1: 15000, level2: 25000 },
  "HYPERTENSION": { level1: 9000, level2: 12000 },
  "DIABETES": { level1: 10000, level2: 15000 },
  "GASTROENTERITIS": { level1: 6000, level2: 9000 },
  "UTI": { level1: 7500, level2: 11000 },
};

/**
 * Billing Calculation Engine for a Philippine HIS.
 * Handles aggregation, PhilHealth deductions, and Senior/PWD discounts.
 */
export async function calculateAdmissionBill(admissionId: string, hospitalLevel: 1 | 2 = 1) {
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: {
      billingRecords: {
        include: { items: true }
      },
      patient: true
    }
  });

  if (!admission) throw new Error("Admission record not found");

  let grossTotal = new Decimal(0);
  let vatableTotal = new Decimal(0);

  // 1. Aggregate Costs: Sum up all ServiceCharge, MedicationOrder, and RoomRate
  // In this schema, they are stored as BillingItems under BillingRecords
  admission.billingRecords.forEach(record => {
    record.items.forEach(item => {
      grossTotal = grossTotal.plus(item.totalAmount);
      if (item.isVatable) {
        vatableTotal = vatableTotal.plus(item.totalAmount);
      }
    });
  });

  // 2. PhilHealth Logic: Implement lookup for 'Case Rates'
  const diagnosis = (admission.finalDiagnosis || admission.admittingDiagnosis).toUpperCase();
  let philHealthDeduction = new Decimal(0);
  
  if (admission.isPhilHealthMember) {
    const rateMatch = Object.keys(CASE_RATES).find(key => diagnosis.includes(key));
    if (rateMatch) {
      const amount = hospitalLevel === 1 ? CASE_RATES[rateMatch].level1 : CASE_RATES[rateMatch].level2;
      philHealthDeduction = new Decimal(amount);
    }
  }

  // 3. Senior/PWD Discount: Apply 20% discount on remaining balance and VAT exemption
  const isEligibleForDiscount = admission.patient.seniorCitizenId || admission.patient.pwdId;
  let discountAmount = new Decimal(0);
  let vatExemptionAmount = new Decimal(0);

  if (isEligibleForDiscount) {
    // VAT Exemption: Remove 12% VAT from vatable items (VAT-inclusive to VAT-exclusive)
    const amountWithoutVat = vatableTotal.dividedBy(1.12);
    vatExemptionAmount = vatableTotal.minus(amountWithoutVat);
    
    // Remaining Balance for Discount = (Gross - PhilHealth - VAT Exemption)
    const remainingForDiscount = grossTotal.minus(philHealthDeduction).minus(vatExemptionAmount);
    
    // Apply 20% discount on the remaining balance (statutory benefit)
    if (remainingForDiscount.greaterThan(0)) {
      discountAmount = remainingForDiscount.times(0.20);
    }
  }

  // Final Net Amount
  const netAmountDue = grossTotal
    .minus(philHealthDeduction)
    .minus(vatExemptionAmount)
    .minus(discountAmount);

  // Return a structured JSON object
  return {
    billingRecordId: admission.billingRecords[0]?.id,
    GrossAmount: grossTotal.toFixed(2),
    PhilHealthDeduction: philHealthDeduction.toFixed(2),
    VATExemption: vatExemptionAmount.toFixed(2),
    DiscountAmount: discountAmount.toFixed(2),
    NetAmountDue: netAmountDue.greaterThan(0) ? netAmountDue.toFixed(2) : "0.00",
    PaidAmount: admission.billingRecords[0]?.paidAmount.toFixed(2) || "0.00",
    BalanceAmount: admission.billingRecords[0]?.balanceAmount.toFixed(2) || netAmountDue.toFixed(2),
    Status: admission.billingRecords[0]?.status || "UNPAID",
    Metadata: {
      isPhilHealthApplied: philHealthDeduction.greaterThan(0),
      isDiscountApplied: discountAmount.greaterThan(0),
      hospitalLevel
    }
  };
}
