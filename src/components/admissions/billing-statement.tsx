import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard font if needed, but for now we use standard Helvetica
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  hospitalAddress: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 'black',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginVertical: 15,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  colCategory: { width: '20%' },
  colDescription: { width: '45%' },
  colQty: { width: '10%', textAlign: 'center' },
  colAmount: { width: '25%', textAlign: 'right' },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalsSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsContainer: {
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#0f172a',
  },
  grandTotalText: {
    fontSize: 14,
    fontWeight: 'black',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  discountNote: {
    fontSize: 7,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 10,
  }
});

interface BillingStatementProps {
  invoice: any;
}

const formatCurrency = (amount: number) => {
  return `PHP ${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const BillingStatement: React.FC<BillingStatementProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Hospital Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hospitalName}>CLINIQ MEDICAL CENTER</Text>
          <Text style={styles.hospitalAddress}>123 Health Ave, Dasmariñas City, Cavite, Philippines 4114</Text>
          <Text style={styles.hospitalAddress}>Tel: (046) 416-0000 | Email: billing@cliniq.com</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>#{invoice.invoiceNumber}</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <Text style={styles.title}>Statement of Account</Text>

      {/* Patient Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Patient Name:</Text>
          <Text style={styles.value}>{invoice.admission.patient.lastName}, {invoice.admission.patient.firstName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Admission ID:</Text>
          <Text style={styles.value}>{invoice.admission.admissionId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Discount Type:</Text>
          <Text style={styles.value}>
            {invoice.discountType === 'SENIOR_CITIZEN' ? 'Senior Citizen' : invoice.discountType === 'PWD' ? 'PWD' : 'None'}
            {invoice.admission.patient.seniorId && ` (ID: ${invoice.admission.patient.seniorId})`}
            {invoice.admission.patient.pwdId && ` (ID: ${invoice.admission.patient.pwdId})`}
          </Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colCategory]}>Category</Text>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colAmount]}>Total</Text>
        </View>
        {invoice.items.map((item: any) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.colCategory, { fontSize: 8 }]}>{item.category}</Text>
            <Text style={styles.colDescription}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colAmount}>{formatCurrency(item.totalPrice)}</Text>
          </View>
        ))}
      </View>

      {/* Totals Section */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={{ color: '#64748b' }}>Gross Amount</Text>
            <Text style={{ fontWeight: 'bold' }}>{formatCurrency(invoice.grossAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ color: '#64748b' }}>VAT (12%)</Text>
            <Text style={{ fontWeight: 'bold' }}>{formatCurrency(invoice.vatAmount)}</Text>
          </View>
          {Number(invoice.discountAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>PH Mandated Discount</Text>
              <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>-{formatCurrency(invoice.discountAmount)}</Text>
            </View>
          )}
          {Number(invoice.philHealthAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>PhilHealth Benefit</Text>
              <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>-{formatCurrency(invoice.philHealthAmount)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalText}>NET AMOUNT</Text>
            <Text style={styles.grandTotalText}>{formatCurrency(invoice.netAmount)}</Text>
          </View>
        </View>
      </View>

      {/* Discount Note */}
      {invoice.discountType !== 'NONE' && (
        <Text style={styles.discountNote}>
          * Calculations for Senior Citizen/PWD are based on Philippine Law: Total Bill is Net of 12% VAT, 
          followed by a 20% discount on the net amount.
        </Text>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        This is a computer-generated document. No signature required for initial processing.
        Cliniq Medical Center - Empowering Health through Technology.
      </Text>
    </Page>
  </Document>
);
