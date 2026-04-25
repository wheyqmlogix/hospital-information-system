'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type InventoryItem, type StockBatch } from '@/lib/db';

export default function StockManagement() {
  const inventory = useLiveQuery(() => db.inventory.toArray());
  const stocks = useLiveQuery(() => db.stocks.toArray());

  const [newItem, setNewItem] = useState({
    name: '',
    genericName: '',
    pndfCode: '',
    vatExempt: true,
    isDangerousDrug: false,
    basePrice: 0,
  });

  const [newBatch, setNewBatch] = useState({
    inventoryId: 0,
    batchNumber: '',
    expiryDate: '',
    quantity: 0,
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.inventory.add(newItem);
    setNewItem({ name: '', genericName: '', pndfCode: '', vatExempt: true, isDangerousDrug: false, basePrice: 0 });
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBatch.inventoryId === 0) return;
    await db.stocks.add(newBatch);
    setNewBatch({ inventoryId: 0, batchNumber: '', expiryDate: '', quantity: 0 });
  };

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add New Product */}
        <form onSubmit={handleAddItem} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-lg text-blue-900">Add New Product (PNDF Standards)</h3>
          <div className="grid grid-cols-1 gap-3">
            <input 
              placeholder="Brand Name" 
              className="border p-2 rounded" 
              value={newItem.name} 
              onChange={e => setNewItem({...newItem, name: e.target.value})} 
              required 
            />
            <input 
              placeholder="Generic Name" 
              className="border p-2 rounded" 
              value={newItem.genericName} 
              onChange={e => setNewItem({...newItem, genericName: e.target.value})} 
            />
            <div className="flex gap-4 items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newItem.vatExempt} onChange={e => setNewItem({...newItem, vatExempt: e.target.checked})} />
                VAT Exempt
              </label>
              <label className="flex items-center gap-2 text-red-600 font-bold">
                <input type="checkbox" checked={newItem.isDangerousDrug} onChange={e => setNewItem({...newItem, isDangerousDrug: e.target.checked})} />
                Dangerous Drug
              </label>
            </div>
            <input 
              type="number" 
              placeholder="Base Price (₱)" 
              className="border p-2 rounded" 
              value={newItem.basePrice} 
              onChange={e => setNewItem({...newItem, basePrice: parseFloat(e.target.value)})} 
              required 
            />
          </div>
          <button className="w-full bg-blue-600 text-white p-2 rounded font-bold">Add to Inventory</button>
        </form>

        {/* Add Stock Batch */}
        <form onSubmit={handleAddBatch} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-lg text-green-900">Receive Stocks (FEFO Batch)</h3>
          <div className="grid grid-cols-1 gap-3">
            <select 
              className="border p-2 rounded" 
              value={newBatch.inventoryId} 
              onChange={e => setNewBatch({...newBatch, inventoryId: parseInt(e.target.value)})}
              required
            >
              <option value={0}>Select Product...</option>
              {inventory?.map(item => (
                <option key={item.id} value={item.id}>{item.name} ({item.genericName})</option>
              ))}
            </select>
            <input 
              placeholder="Batch Number" 
              className="border p-2 rounded" 
              value={newBatch.batchNumber} 
              onChange={e => setNewBatch({...newBatch, batchNumber: e.target.value})} 
              required 
            />
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
              <input 
                type="date" 
                className="w-full border p-2 rounded" 
                value={newBatch.expiryDate} 
                onChange={e => setNewBatch({...newBatch, expiryDate: e.target.value})} 
                required 
              />
            </div>
            <input 
              type="number" 
              placeholder="Quantity Received" 
              className="border p-2 rounded" 
              value={newBatch.quantity} 
              onChange={e => setNewBatch({...newBatch, quantity: parseInt(e.target.value)})} 
              required 
            />
          </div>
          <button className="w-full bg-green-600 text-white p-2 rounded font-bold">Receive Batch</button>
        </form>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Generic / PNDF</th>
              <th className="p-4">On Hand</th>
              <th className="p-4">Nearest Expiry</th>
              <th className="p-4">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inventory?.map(item => {
              const itemStocks = stocks?.filter(s => s.inventoryId === item.id) || [];
              const totalQty = itemStocks.reduce((acc, s) => acc + s.quantity, 0);
              const nearestExpiry = [...itemStocks].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0]?.expiryDate;
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-blue-900">{item.name}</div>
                    {item.isDangerousDrug && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded font-bold">DANGEROUS DRUG</span>}
                  </td>
                  <td className="p-4 text-gray-500 italic">{item.genericName || 'N/A'}</td>
                  <td className="p-4 font-bold">{totalQty} units</td>
                  <td className={`p-4 ${nearestExpiry && new Date(nearestExpiry) < new Date() ? 'text-red-600 font-bold' : ''}`}>
                    {nearestExpiry || 'N/A'}
                  </td>
                  <td className="p-4 font-mono text-green-700">₱{item.basePrice.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
