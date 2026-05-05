export interface Medication {
  name: string;
  genericName: string;
  form: string;
  strength: string;
}

export const commonMedications: Medication[] = [
  { name: "Biogesic", genericName: "Paracetamol", form: "Tablet", strength: "500mg" },
  { name: "Amoxil", genericName: "Amoxicillin", form: "Capsule", strength: "500mg" },
  { name: "Neozep", genericName: "Phenylephrine HCl + Chlorphenamine Maleate + Paracetamol", form: "Tablet", strength: "5mg/2mg/500mg" },
  { name: "Solmux", genericName: "Carbocisteine", form: "Capsule", strength: "500mg" },
  { name: "Advil", genericName: "Ibuprofen", form: "Softgel", strength: "200mg" },
  { name: "Zyrtec", genericName: "Cetirizine", form: "Tablet", strength: "10mg" },
  { name: "Ascof", genericName: "Lagundi Leaf", form: "Syrup", strength: "300mg/5ml" },
  { name: "Iterax", genericName: "Hydroxyzine dihydrochloride", form: "Tablet", strength: "25mg" },
  { name: "Kremil-S", genericName: "Aluminum Hydroxide + Magnesium Hydroxide + Simethicone", form: "Tablet", strength: "178mg/233mg/30mg" },
  { name: "Enervon", genericName: "Multivitamins", form: "Tablet", strength: "N/A" },
];
