'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MedicalOrder, type InventoryItem } from '@/lib/db';

export default function PharmacyQueue() {
  const pendingOrders = useLiveQuery(() => db.orders.where('status').equals('PENDING').and(o => o.type === 'MEDICATION').toArray());
  const patients = useLiveQuery(() => db.patients.toArray());
  const inventory = useLiveQuery(() => db.inventory.toArray());
  const stocks = useLiveQuery(() => db.stocks.toArray());

  const handleDispense = async (order: MedicalOrder) => {
    if (!order.id || !order.inventoryId) return;

    const item = inventory?.find(i => i.id === order.inventoryId);
    if (!item) return;

    // 1. FEFO Logic: Get batches for this item, sorted by expiry
    const itemBatches = stocks?.filter(s => s.inventoryId === order.inventoryId)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)) || [];

    const totalAvailable = itemBatches.reduce((acc, b) => acc + b.quantity, 0);

    if (totalAvailable < order.quantity) {
      alert(`Insufficient stock. Only ${totalAvailable} units available.`);
      return;
    }

    // 2. Deduct from Stocks (Sequential Batch Consumption)
    let remainingToDeduct = order.quantity;
    for (const batch of itemBatches) {
      if (remainingToDeduct <= 0) break;

      if (batch.quantity <= remainingToDeduct) {
        remainingToDeduct -= batch.quantity;
        await db.stocks.delete(batch.id!);
      } else {
        await db.stocks.update(batch.id!, { quantity: batch.quantity - remainingToDeduct });
        remainingToDeduct = 0;
      }
    }

    // 3. Mark Order as FILLED
    await db.orders.update(order.id, { status: 'FILLED' });

    // 4. Automatically Add to Patient's Bill
    // Find active billing or create one
    let billing = await db.billing.where('patientId').equals(order.patientId).and(b => b.status === 'unpaid').first();
    
    if (!billing) {
      const billingId = await db.billing.add({
        patientId: order.patientId,
        status: 'unpaid',
        philhealthBenefit: 0,
        seniorDiscount: 0,
        totalActualCharges: 0,
        netAmount: 0,
        createdAt: Date.now()
      });
      billing = await db.billing.get(billingId);
    }

    const subtotal = order.quantity * item.basePrice;
    await db.billingItems.add({
      billingId: billing!.id!,
      inventoryId: item.id,
      serviceName: item.name,
      quantity: order.quantity,
      unitPrice: item.basePrice,
      subtotal: subtotal
    });

    // Update total charges on billing record
    await db.billing.update(billing!.id!, {
      totalActualCharges: billing!.totalActualCharges + subtotal,
      netAmount: billing!.netAmount + subtotal // Simplification for now
    });

    alert(`Dispensed ${order.quantity} ${item.name}. Billing updated automatically.`);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-green-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pharmacy Dispensing Queue</h2>
          <p className="text-green-200 text-sm">Real-time Medication Orders from Physicians</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black">{pendingOrders?.length || 0}</span>
          <p className="text-[10px] uppercase font-bold tracking-widest text-green-300">Pending Doses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pendingOrders?.map(order => {
          const patient = patients?.find(p => p.id === order.patientId);
          const item = inventory?.find(i => i.id === order.inventoryId);
          const available = stocks?.filter(s => s.inventoryId === order.inventoryId).reduce((acc, b) => acc + b.quantity, 0) || 0;

          return (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">ORDER #{order.id}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">{new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900">{patient?.lastName}, {patient?.firstName}</h3>
                <p className="text-sm font-bold text-blue-600 uppercase">{order.item} × {order.quantity}</p>
                <p className="text-xs text-gray-500 italic mt-1">SIG: {order.instructions}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Ordered By: {order.orderedBy}</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Stock Status</p>
                  <p className={`text-sm font-black ${available >= order.quantity ? 'text-green-600' : 'text-red-600'}`}>
                    {available} Units Available
                  </p>
                </div>
                <button 
                  onClick={() => handleDispense(order)}
                  disabled={available < order.quantity}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-green-700 transition-all disabled:bg-gray-200 disabled:text-gray-400 flex-1 md:flex-none"
                >
                  DISPENSE & BILL
                </button>
              </div>
            </div>
          );
        })}

        {pendingOrders?.length === 0 && (
          <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed text-gray-400">
            No pending medication orders.
          </div>
        )}
      </div>
    </div>
  );
}
