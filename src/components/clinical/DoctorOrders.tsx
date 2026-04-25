'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PatientRecord, type InventoryItem } from '@/lib/db';

export default function DoctorOrders({ currentDoctor }: { currentDoctor: string }) {
  const admissions = useLiveQuery(() => db.admissions.where('status').equals('ADMITTED').toArray());
  const patients = useLiveQuery(() => db.patients.toArray());
  const inventory = useLiveQuery(() => db.inventory.toArray());
  const allOrders = useLiveQuery(() => db.orders.where('status').equals('PENDING').toArray());

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<'MEDICATION' | 'LABORATORY'>('MEDICATION');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');

  const activeAdmissions = admissions?.map(a => ({
    ...a,
    patient: patients?.find(p => p.id === a.patientId)
  })) || [];

  const selectedInventoryItem = inventory?.find(i => i.name === selectedItem);
  
  const interactionWarning = (() => {
    if (!selectedPatientId || !selectedInventoryItem?.drugClass || orderType !== 'MEDICATION') return null;
    
    const patientActiveOrders = allOrders?.filter(o => o.patientId === selectedPatientId && o.type === 'MEDICATION') || [];
    const activeDrugClasses = patientActiveOrders.map(o => {
      const item = inventory?.find(i => i.id === o.inventoryId);
      return item?.drugClass;
    }).filter(Boolean);

    if (activeDrugClasses.includes(selectedInventoryItem.drugClass)) {
      return `DUPLICATE DRUG CLASS: Patient is already prescribed another ${selectedInventoryItem.drugClass}. Please review for potential interactions or therapeutic duplication.`;
    }
    return null;
  })();

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedItem) return;

    const inventoryItem = inventory?.find(i => i.name === selectedItem);

    await db.orders.add({
      patientId: selectedPatientId,
      type: orderType,
      item: selectedItem,
      inventoryId: inventoryItem?.id,
      quantity: qty,
      instructions,
      status: 'PENDING',
      orderedBy: currentDoctor,
      createdAt: Date.now()
    });

    setSelectedItem('');
    setQty(1);
    setInstructions('');
    alert('Order sent to Clinical Queue.');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
          <span>🩺</span> Physician Order Entry
        </h2>
        
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Admitted Patient</label>
              <select 
                className="w-full border p-2 rounded" 
                onChange={e => setSelectedPatientId(parseInt(e.target.value))}
                required
              >
                <option value="">Choose Patient...</option>
                {activeAdmissions.map(a => (
                  <option key={a.id} value={a.patientId}>{a.patient?.lastName}, {a.patient?.firstName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order Type</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setOrderType('MEDICATION')}
                  className={`flex-1 p-2 rounded border font-bold text-xs ${orderType === 'MEDICATION' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}
                >MEDICATION</button>
                <button 
                  type="button" 
                  onClick={() => setOrderType('LABORATORY')}
                  className={`flex-1 p-2 rounded border font-bold text-xs ${orderType === 'LABORATORY' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}
                >LABORATORY</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Item / Test Name</label>
              {orderType === 'MEDICATION' ? (
                <>
                  <select 
                    className="w-full border p-2 rounded" 
                    value={selectedItem} 
                    onChange={e => setSelectedItem(e.target.value)}
                    required
                  >
                    <option value="">Search Pharmacy Inventory...</option>
                    {inventory?.map(i => <option key={i.id} value={i.name}>{i.name} ({i.genericName})</option>)}
                  </select>
                  {selectedItem && inventory?.find(i => i.name === selectedItem) && !inventory.find(i => i.name === selectedItem)?.pndfCode && (
                    <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-[10px] text-yellow-800 font-bold">
                      ⚠️ NON-PNDF WARNING: This medication is not in the National Formulary. Justification may be required for PhilHealth reimbursement.
                    </div>
                  )}
                  {interactionWarning && (
                    <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-[10px] text-red-800 font-black animate-pulse">
                      ⛔ {interactionWarning}
                    </div>
                  )}
                </>
              ) : (
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="e.g. CBC, Urinalysis, Chest X-Ray" 
                  value={selectedItem}
                  onChange={e => setSelectedItem(e.target.value)}
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity / Doses</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded" 
                value={qty} 
                onChange={e => setQty(parseInt(e.target.value))} 
                min={1} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Instructions / SIG</label>
            <textarea 
              className="w-full border p-2 rounded h-20" 
              placeholder="e.g. 500mg tab, 3x a day for 7 days" 
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-700 text-white p-3 rounded-lg font-bold shadow-lg hover:bg-blue-800">
            Submit Clinical Order
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Recent Pending Orders</div>
        <div className="divide-y">
          {activeAdmissions.map(a => (
            <div key={a.id} className="p-4">
              <h4 className="font-bold text-blue-900 mb-2">{a.patient?.lastName}, {a.patient?.firstName}</h4>
              <div className="space-y-1">
                {/* We'd normally filter orders by patientId here */}
                <p className="text-xs text-gray-400 italic">No historical orders shown in prototype view.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
