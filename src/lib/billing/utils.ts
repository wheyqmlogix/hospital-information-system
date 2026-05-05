/**
 * Philippine Regulatory Discounts for Healthcare
 * 
 * Senior Citizen & PWD:
 * - 20% discount on medical services, professional fees, and medicines.
 * - VAT Exemption (12%) if the price is VAT-inclusive.
 * 
 * Calculation Formula (VAT-inclusive prices):
 * Discounted Amount = (Base Price / 1.12) * 0.80
 */

export type PatientCategory = "REGULAR" | "SENIOR" | "PWD";

export function calculateDiscounts(baseAmount: number, category: PatientCategory) {
  if (category === "REGULAR") {
    return {
      discountedAmount: baseAmount,
      discountTotal: 0,
      vatExemption: 0,
    };
  }

  // Step 1: Remove 12% VAT
  const vatableAmount = baseAmount / 1.12;
  const vatExemption = baseAmount - vatableAmount;

  // Step 2: Apply 20% Discount on the non-VAT amount
  const discountAmount = vatableAmount * 0.20;
  const finalAmount = vatableAmount - discountAmount;

  return {
    discountedAmount: Math.round(finalAmount * 100) / 100,
    discountTotal: Math.round((discountAmount + vatExemption) * 100) / 100,
    vatExemption: Math.round(vatExemption * 100) / 100,
  };
}

export const hospitalServices = [
  { name: "Private Room (Daily)", category: "ACCOMMODATION", price: 3500 },
  { name: "Semi-Private Room (Daily)", category: "ACCOMMODATION", price: 2500 },
  { name: "Ward Bed (Daily)", category: "ACCOMMODATION", price: 1000 },
  { name: "Complete Blood Count (CBC)", category: "LABORATORY", price: 450 },
  { name: "Urinalysis", category: "LABORATORY", price: 250 },
  { name: "Chest X-Ray", category: "RADIOLOGY", price: 850 },
  { name: "Emergency Room Fee", category: "ER", price: 1200 },
  { name: "Consultation Fee (Specialist)", category: "PROFESSIONAL_FEE", price: 800 },
  { name: "Paracetamol 500mg (Tablet)", category: "PHARMACY", price: 15 },
];
