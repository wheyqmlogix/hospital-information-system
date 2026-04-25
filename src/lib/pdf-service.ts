import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type DiscountResult } from './billing-utils';
import { type PatientRecord } from './db';

interface SOARequest {
  patient: PatientRecord;
  items: { name: string; price: number; qty: number }[];
  summary: DiscountResult;
  billingNumber: string;
}

export async function generateSOAPDF({ patient, items, summary, billingNumber }: SOARequest) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102); // Dark Blue
  doc.text('STATEMENT OF ACCOUNT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Philippine Hospital Information System (Prototype)', pageWidth / 2, 28, { align: 'center' });

  // 2. Patient Info Section
  doc.setDrawColor(200);
  doc.line(14, 35, pageWidth - 14, 35);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', 14, 42);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patient.lastName.toUpperCase()}, ${patient.firstName.toUpperCase()}`, 14, 50);
  doc.text(`PhilHealth PIN: ${patient.memberPIN || 'N/A'}`, 14, 56);
  doc.text(`Birth Date: ${patient.birthDate}`, 14, 62);
  
  doc.text(`Billing No: ${billingNumber}`, pageWidth - 60, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 56);

  // 3. Itemized Charges Table
  autoTable(doc, {
    startY: 70,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: items.map(item => [
      item.name,
      item.qty.toString(),
      `P${item.price.toFixed(2)}`,
      `P${(item.qty * item.price).toFixed(2)}`
    ]),
    foot: [['TOTAL ACTUAL CHARGES', '', '', `P${summary.grossAmount.toFixed(2)}`]],
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 102] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
  });

  // 4. Deductions Section (PhilHealth, Senior, VAT)
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('DEDUCTIONS & DISCOUNTS', 14, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Less: PhilHealth Benefit', 14, finalY + 8);
  doc.text(`- P${summary.philhealthBenefit.toFixed(2)}`, pageWidth - 45, finalY + 8, { align: 'right' });

  if (summary.seniorDiscount > 0) {
    doc.text('Less: VAT Exemption (12%)', 14, finalY + 14);
    doc.text(`- P${summary.vatExemption.toFixed(2)}`, pageWidth - 45, finalY + 14, { align: 'right' });
    
    doc.text('Less: Senior/PWD Discount (20%)', 14, finalY + 20);
    doc.text(`- P${summary.seniorDiscount.toFixed(2)}`, pageWidth - 45, finalY + 20, { align: 'right' });
  }

  // 5. Final Net Amount
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(1);
  doc.line(pageWidth - 80, finalY + 25, pageWidth - 14, finalY + 25);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NET AMOUNT DUE:', 14, finalY + 35);
  doc.setTextColor(0, 51, 102);
  doc.text(`PHP ${summary.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, pageWidth - 14, finalY + 35, { align: 'right' });

  // 6. Footer / Signatures
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated document. No signature required for prototype purposes.', pageWidth / 2, 285, { align: 'center' });

  // 7. Save the PDF
  doc.save(`SOA_${patient.lastName}_${billingNumber}.pdf`);
}
