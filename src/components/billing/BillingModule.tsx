'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PatientRecord, type InventoryItem } from '@/lib/db';
import { computePHBilling } from '@/lib/billing-utils';
import { generateSOAPDF } from '@/lib/pdf-service';
import UniversalScanner from '../shared/UniversalScanner';

export default function BillingModule() {
  const patients = useLiveQuery(() => db.patients.toArray());
  const inventory = useLiveQuery(() => db.inventory.toArray());

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [philhealthBenefit, setPhilhealthBenefit] = useState(0);
  const [billItems, setBillItems] = useState<{name: string, price: number, qty: number}[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const selectedPatient = patients?.find(p => p.id === selectedPatientId);
  const isSeniorOrPWD = useMemo(() => {
    if (!selectedPatient) return false;
    const age = new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear();
    return age >= 60; // Simplified check for Senior
  }, [selectedPatient]);

  const grossAmount = billItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const billingSummary = computePHBilling(grossAmount, philhealthBenefit, isSeniorOrPWD);

  const addItem = (item: InventoryItem) => {
    setBillItems([...billItems, { name: item.name, price: item.basePrice, qty: 1 }]);
  };

  const addManualItem = (name: string, price: number) => {
    setBillItems([...billItems, { name, price, qty: 1 }]);
  };

  const handleBarcodeScan = (barcode: string) => {
    // In a real system, you'd have a barcode field in the inventory table
    // For this prototype, we'll simulate finding by name or ID
    const item = inventory?.find(i => i.id.toString() === barcode || i.name.toLowerCase().includes(barcode.toLowerCase()));
    if (item) {
      addItem(item);
      alert(`Added: ${item.name}`);
    } else {
      alert(`Barcode ${barcode} not found in inventory.`);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    
    if (billItems.length === 0) {
      alert('Add at least one charge item.');
      return;
    }

    const billingNo = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await generateSOAPDF({
      patient: selectedPatient,
      items: billItems,
      summary: billingSummary,
      billingNumber: billingNo
    });

    alert(`Professional SOA ${billingNo} generated and downloaded.`);
  };

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {isScannerOpen && (
        <UniversalScanner onScan={handleBarcodeScan} onClose={() => setIsScannerOpen(false)} />
      )}

      {/* Left: Item Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-blue-900">1. Select Patient</h3>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <span>📷</span> Scan Barcode
            </button>
          </div>
          <select 
            className="w-full border p-2 rounded" 
            onChange={e => setSelectedPatientId(parseInt(e.target.value))}
          >
            <option>Select Patient for Billing...</option>
            {patients?.map(p => (
              <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>
            ))}
          </select>
          {selectedPatient && (
            <div className="text-xs p-2 bg-blue-50 text-blue-800 rounded">
              <b>Patient Info:</b> {isSeniorOrPWD ? 'SENIOR CITIZEN (Discount Applicable)' : 'Regular Patient'}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-blue-900">2. Add Charges</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">Inventory Items</label>
              <div className="max-h-40 overflow-y-auto border rounded divide-y">
                {inventory?.map(item => (
                  <div key={item.id} className="p-2 flex justify-between items-center text-sm">
                    <span>{item.name}</span>
                    <button onClick={() => addItem(item)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">+ Add</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">Standard Services</label>
              <div className="space-y-2">
                <button onClick={() => addManualItem('Room & Board (Ward)', 1500)} className="w-full text-left p-2 border rounded text-sm hover:bg-gray-50">Room & Board (Ward) - ₱1,500</button>
                <button onClick={() => addManualItem('Professional Fee (Consultation)', 500)} className="w-full text-left p-2 border rounded text-sm hover:bg-gray-50">PF (Consultation) - ₱500</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">Item Description</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {billItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-right">₱{item.price.toFixed(2)}</td>
                  <td className="p-3 text-right">{item.qty}</td>
                  <td className="p-3 text-right">₱{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Summary & SOA */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-2xl border-2 border-blue-900 space-y-4">
          <h3 className="font-bold text-xl text-blue-900 border-b pb-2">Statement of Account</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total Actual Charges:</span>
              <span className="font-bold">₱{billingSummary.grossAmount.toFixed(2)}</span>
            </div>
            
            <div className="space-y-1 py-2 border-y border-dashed">
              <div className="flex justify-between text-blue-700 font-bold">
                <label className="flex items-center gap-2">
                  <span>PhilHealth Benefit:</span>
                  <input 
                    type="number" 
                    className="w-20 border rounded px-1 text-right" 
                    value={philhealthBenefit} 
                    onChange={e => setPhilhealthBenefit(parseFloat(e.target.value) || 0)}
                  />
                </label>
                <span>-₱{billingSummary.philhealthBenefit.toFixed(2)}</span>
              </div>
              
              {isSeniorOrPWD && (
                <>
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>VAT Exemption (12%):</span>
                    <span>-₱{billingSummary.vatExemption.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Senior/PWD Discount (20%):</span>
                    <span>-₱{billingSummary.seniorDiscount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between text-lg font-extrabold pt-2">
              <span>NET AMOUNT DUE:</span>
              <span className="text-blue-900 underline decoration-double">₱{billingSummary.netAmount.toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold shadow-lg mt-4 active:scale-95 transition-transform"
            onClick={handleProcessPayment}
          >
            Process & Print Invoice (PDF)
          </button>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-800 space-y-2">
          <p className="font-bold underline italic">Compliance Note:</p>
          <p>This SOA follows the <b>PhilHealth Circular 2023-0011</b> requirements.</p>
          <p>Discount Sequencing: PhilHealth Benefit is deducted first, followed by VAT Exemption, then the 20% Senior Citizen discount.</p>
        </div>
      </div>
    </div>
  );
}
