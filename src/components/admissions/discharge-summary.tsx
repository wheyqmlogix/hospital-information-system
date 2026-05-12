import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  hospitalAddress: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: 'black',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginVertical: 10,
    color: '#0f172a',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#f8fafc',
    padding: 4,
    marginBottom: 6,
    textTransform: 'uppercase',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 6,
  },
  contentBlock: {
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    marginBottom: 8,
  },
  noteMeta: {
    fontSize: 7,
    color: '#94a3b8',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 8,
    color: '#334155',
  },
  table: {
    marginTop: 5,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f8fafc',
  },
  tableCol: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    marginTop: 30,
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 4,
  }
});

interface DischargeSummaryProps {
  data: any;
}

export const DischargeSummary: React.FC<DischargeSummaryProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hospitalName}>CLINIQ MEDICAL CENTER</Text>
          <Text style={styles.hospitalAddress}>123 Health Ave, Dasmariñas City, Cavite</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>ADMISSION ID: {data.admissionId}</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>Generated: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <Text style={styles.documentTitle}>Clinical Discharge Summary</Text>

      {/* Patient Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Profile</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Full Name:</Text>
              <Text style={styles.value}>{data.patient.lastName}, {data.patient.firstName}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Patient ID:</Text>
              <Text style={styles.value}>{data.patient.patientId}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Age / Gender:</Text>
              <Text style={styles.value}>{data.patient.gender}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>PhilHealth PIN:</Text>
              <Text style={styles.value}>{data.patient.philHealthPIN || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Admission Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admission Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Admitted Date:</Text>
          <Text style={styles.value}>{new Date(data.admittedAt).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Discharged Date:</Text>
          <Text style={styles.value}>{data.dischargedAt ? new Date(data.dischargedAt).toLocaleString() : 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Chief Complaint:</Text>
          <Text style={styles.value}>{data.chiefComplaint}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Admitting Diagnosis:</Text>
          <Text style={styles.value}>{data.admittingDiagnosis || 'Pending'}</Text>
        </View>
      </View>

      {/* Course in the Ward */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course in the Ward / Clinical Progress</Text>
        {data.nursingNotes.filter((n: any) => n.type !== 'SHIFT_REPORT').slice(0, 5).map((note: any) => (
          <View key={note.id} style={styles.contentBlock}>
            <Text style={styles.noteMeta}>{new Date(note.createdAt).toLocaleString()} - CLINICAL PROGRESS</Text>
            <Text style={styles.noteText}>{note.note}</Text>
          </View>
        ))}
        {data.nursingNotes.length === 0 && <Text style={{ fontStyle: 'italic', color: '#94a3b8' }}>No clinical notes recorded.</Text>}
      </View>

      {/* Diagnostic Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostic Results Summary</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>Test Name</Text>
            <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>Date</Text>
            <Text style={[styles.tableCol, { flex: 2, fontWeight: 'bold' }]}>Result / Finding</Text>
          </View>
          {data.labOrders.filter((l: any) => l.status === 'COMPLETED').map((order: any) => (
            <View key={order.id} style={styles.tableRow}>
              <Text style={styles.tableCol}>{order.test.name}</Text>
              <Text style={styles.tableCol}>{new Date(order.createdAt).toLocaleDateString()}</Text>
              <Text style={[styles.tableCol, { flex: 2 }]}>{order.result}</Text>
            </View>
          ))}
        </View>
        {data.labOrders.length === 0 && <Text style={{ fontStyle: 'italic', color: '#94a3b8', marginTop: 4 }}>No diagnostic tests recorded.</Text>}
      </View>

      {/* Final Assessment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Final Assessment & Disposition</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Final Diagnosis:</Text>
          <Text style={[styles.value, { fontSize: 10 }]}>{data.finalDiagnosis || 'PENDING FINAL ASSESSMENT'}</Text>
        </View>
        {data.primaryCaseRate && (
          <View style={styles.row}>
            <Text style={styles.label}>PhilHealth Case Rate:</Text>
            <Text style={styles.value}>{data.primaryCaseRate.code}: {data.primaryCaseRate.description}</Text>
          </View>
        )}
      </View>

      {/* Signatures */}
      <View style={styles.signatureSection}>
        <View>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Attending Physician</Text>
          <Text style={[styles.signatureLabel, { color: '#94a3b8' }]}>Signature over Printed Name / License No.</Text>
        </View>
        <View>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Medical Records Officer</Text>
          <Text style={[styles.signatureLabel, { color: '#94a3b8' }]}>Signature over Printed Name</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        CLINIQ MEDICAL CENTER - This is a formal medical document. Confidentiality and proper disposal of this document must be observed.
        Page 1 of 1
      </Text>
    </Page>
  </Document>
);
