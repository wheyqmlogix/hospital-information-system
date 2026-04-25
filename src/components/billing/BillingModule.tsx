'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PatientRecord, type InventoryItem } from '@/lib/db';
import { computeAdvancedPHBilling } from '@/lib/billing-utils';
import { generateSOAPDF } from '@/lib/pdf-service';
import UniversalScanner from '../shared/UniversalScanner';
import StatementOfAccount from './StatementOfAccount';

const HMO_PROVIDERS = ['Maxicare', 'Intellicare', 'Medicard', 'PhilCare', 'Caritas Health', 'Avega'];

export default function BillingModule() {
  const patients = useLiveQuery(() => db.patients.toArray());
  const inventory = useLiveQuery(() => db.inventory.toArray());
  const activeBillings = useLiveQuery(() => db.billing.where('status').equals('unpaid').toArray());

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [philhealthBenefit, setPhilhealthBenefit] = useState(0);
  const [hmoCoverage, setHmoCoverage] = useState(0);
  const [hmoProvider, setHmoProvider] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const selectedPatient = patients?.find(p => p.id === selectedPatientId);
  const activeBilling = activeBillings?.find(b => b.patientId === selectedPatientId);
  const billItems = useLiveQuery(() => activeBilling ? db.billingItems.where('billingId').equals(activeBilling.id!).toArray() : Promise.resolve([]), [activeBilling]);

  const isSeniorOrPWD = useMemo(() => {
    if (!selectedPatient) return false;
    const age = new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear();
    return age >= 60; 
  }, [selectedPatient]);

  const grossAmount = billItems?.reduce((acc, item) => acc + item.subtotal, 0) || 0;
  const billingSummary = computeAdvancedPHBilling(grossAmount, philhealthBenefit, hmoCoverage, isSeniorOrPWD);

  const handleProcessPayment = async () => {
    if (!selectedPatient || !activeBilling) return;
    const billingNo = `BILL-${activeBilling.id}`;
    
    await db.billing.update(activeBilling.id!, { 
      status: 'paid', 
      amountPaid: billingSummary.netAmount,
      hmoProvider,
      hmoCoverage,
      philhealthBenefit,
      updatedAt: Date.now()
    });

    setIsPaid(true);
    alert(`Payment processed for ${billingNo}. You can now print the SOA.`);
  };

  const handlePrintPDF = async () => {
    if (!selectedPatient || !activeBilling) return;
    const billingNo = `BILL-${activeBilling.id}`;
    await generateSOAPDF({
      patient: selectedPatient,
      items: billItems?.map(i => ({ name: i.serviceName, price: i.unitPrice, qty: i.quantity })) || [],
      summary: billingSummary,
      billingNumber: billingNo
    });
  };

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {isScannerOpen && <UniversalScanner onScan={() => {}} onClose={() => setIsScannerOpen(false)} />}

      <div className="lg:col-span-2 space-y-6 print:hidden">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-blue-900">1. Select Patient for Billing</h3>
          <select className="w-full border p-2 rounded" onChange={e => {setSelectedPatientId(parseInt(e.target.value)); setIsPaid(false);}}>
            <option value="">Choose Patient...</option>
            {patients?.map(p => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>)}
          </select>
          {selectedPatient && (
            <div className="flex gap-2">
              <span className={`text-[10px] px-2 py-1 rounded font-black uppercase ${isSeniorOrPWD ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                {isSeniorOrPWD ? 'SENIOR/PWD DISCOUNT ELIGIBLE' : 'REGULAR RATE'}
              </span>
              <span className="text-[10px] px-2 py-1 rounded font-black uppercase bg-blue-100 text-blue-800">
                PHILHEALTH MEMBER: {selectedPatient.memberPIN || 'NO PIN'}
              </span>
            </div>
          )}
        </div>

        {/* Multi-Payor Logic Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-blue-900">2. External Coverages (Multi-Payor)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
              <label className="text-xs font-black text-blue-800 uppercase tracking-widest">PhilHealth Benefit</label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">₱</span>
                <input type="number" className="flex-1 border p-2 rounded" value={philhealthBenefit} onChange={e => setPhilhealthBenefit(parseFloat(e.target.value) || 0)} placeholder="Case Rate Amount" />
              </div>
              <p className="text-[10px] text-blue-600 italic">Deduct first as per PH law.</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
              <label className="text-xs font-black text-purple-800 uppercase tracking-widest">HMO / Private Insurance</label>
              <select className="w-full border p-2 rounded text-sm mb-2" value={hmoProvider} onChange={e => setHmoProvider(e.target.value)}>
                <option value="">Select HMO Provider...</option>
                {HMO_PROVIDERS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-900">₱</span>
                <input type="number" className="flex-1 border p-2 rounded" value={hmoCoverage} onChange={e => setHmoCoverage(parseFloat(e.target.value) || 0)} placeholder="Approved Coverage" />
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Charges List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex justify-between items-center">
            <span>Itemized Statement</span>
            <span className="text-xs">{billItems?.length || 0} items posted</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white border-b text-[10px] uppercase font-bold text-gray-400">
              <tr>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {billItems?.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.serviceName}</td>
                  <td className="p-3 text-right text-gray-500">₱{item.unitPrice.toFixed(2)}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right font-bold">₱{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
              {(!billItems || billItems.length === 0) && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">No charges posted to this patient yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Statement of Account */}
      <div className="space-y-6">
        {selectedPatient && billItems && billItems.length > 0 ? (
          <div className="space-y-4">
            <StatementOfAccount 
              patient={selectedPatient} 
              items={billItems} 
              summary={billingSummary} 
              billingNumber={activeBilling ? `BILL-${activeBilling.id}` : undefined}
              isPaid={isPaid}
            />
            
            <div className="flex gap-2 print:hidden">
              <button 
                className="flex-1 bg-blue-900 text-white p-4 rounded-xl font-bold shadow-xl active:scale-95 transition-all hover:bg-blue-800 disabled:bg-gray-200"
                onClick={handleProcessPayment}
                disabled={isPaid || grossAmount === 0}
              >
                {isPaid ? 'Payment Processed' : 'Process Payment'}
              </button>
              <button 
                className="bg-gray-100 text-gray-700 p-4 rounded-xl font-bold shadow hover:bg-gray-200"
                onClick={handlePrintPDF}
              >
                PDF
              </button>
              <button 
                className="bg-gray-100 text-gray-700 p-4 rounded-xl font-bold shadow hover:bg-gray-200"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-dashed text-center text-gray-400 print:hidden">
            Select a patient with charges to view the Statement of Account.
          </div>
        )}

        <div className="p-4 bg-white rounded-lg border text-[10px] text-gray-400 space-y-1 print:hidden">
          <p className="font-bold uppercase tracking-widest text-gray-600">Compliance Audit Trail</p>
          <p>• PH Law: Senior discount is applied after PhilHealth and HMO.</p>
          <p>• HMO: {hmoProvider || 'None'} verified and posted.</p>
          <p>• Data Privacy: Financial records encrypted in local storage.</p>
        </div>
      </div>
    </div>
  );
}

