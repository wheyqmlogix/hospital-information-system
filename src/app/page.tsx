'use client';

import { useState, useEffect } from 'react';
import PatientForm from "@/components/PatientForm";
import ClaimsDashboard from "@/components/ClaimsDashboard";
import StockManagement from "@/components/inventory/StockManagement";
import PharmacyQueue from "@/components/inventory/PharmacyQueue";
import BillingModule from "@/components/billing/BillingModule";
import DOHAnalytics from "@/components/analytics/DOHAnalytics";
import BedManagement from "@/components/adt/BedManagement";
import DoctorOrders from "@/components/clinical/DoctorOrders";
import ProcedureEncoding from "@/components/clinical/ProcedureEncoding";
import { MOCK_USERS, type User, getPermissions } from "@/lib/auth";
import { startAutoSync } from '@/lib/sync-service';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [activeTab, setActiveTab] = useState<'register' | 'adt' | 'orders' | 'procedures' | 'pharmacy' | 'billing' | 'analytics' | 'admin'>('register');

  const pendingSyncCount = useLiveQuery(() => db.patients.where('status').equals('draft').count(), []);

  useEffect(() => {
    const cleanup = startAutoSync(60000);
    return cleanup;
  }, []);

  const permissions = getPermissions(currentUser.role);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Staff</span>
              <p className="text-lg font-bold text-blue-900 leading-tight">{currentUser.name}</p>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-black uppercase">{currentUser.role}</span>
            </div>
            <div className="border-l pl-6 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${pendingSyncCount === 0 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Database</span>
                <p className="text-sm font-bold text-gray-700">{pendingSyncCount === 0 ? 'Cloud Synced' : `${pendingSyncCount} Local`}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {MOCK_USERS.map(user => (
              <button key={user.id} onClick={() => {setCurrentUser(user); setActiveTab('register');}} className={`px-3 py-1 text-xs rounded border transition-all ${currentUser.id === user.id ? 'bg-blue-600 text-white shadow-md scale-105' : 'hover:bg-gray-100 text-gray-500'}`}>{user.role}</button>
            ))}
          </div>
        </div>

        <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-lg">
          <button onClick={() => setActiveTab('register')} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'register' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}>REGISTRATION</button>
          <button onClick={() => setActiveTab('adt')} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'adt' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}>BED MAP</button>
          <button onClick={() => setActiveTab('orders')} disabled={!permissions.canEditClinical} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'orders' ? 'border-b-4 border-blue-600 text-blue-600' : !permissions.canEditClinical ? 'opacity-30 cursor-not-allowed' : 'text-gray-400'}`}>DR ORDERS</button>
          <button onClick={() => setActiveTab('procedures')} disabled={!permissions.canEditClinical} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'procedures' ? 'border-b-4 border-blue-600 text-blue-600' : !permissions.canEditClinical ? 'opacity-30 cursor-not-allowed' : 'text-gray-400'}`}>RVS ENCODING</button>
          <button onClick={() => setActiveTab('pharmacy')} disabled={!permissions.canAccessInventory} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'pharmacy' ? 'border-b-4 border-blue-600 text-blue-600' : !permissions.canAccessInventory ? 'opacity-30 cursor-not-allowed' : 'text-gray-400'}`}>PHARMACY</button>
          <button onClick={() => setActiveTab('billing')} disabled={!permissions.canAccessBilling} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'billing' ? 'border-b-4 border-blue-600 text-blue-600' : !permissions.canAccessBilling ? 'opacity-30 cursor-not-allowed' : 'text-gray-400'}`}>BILLING</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}>ANALYTICS</button>
          <button onClick={() => setActiveTab('admin')} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'admin' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}>INVENTORY MGMT</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'register' && <PatientForm currentUser={currentUser} />}
        {activeTab === 'adt' && <BedManagement />}
        {activeTab === 'orders' && <DoctorOrders currentDoctor={currentUser.name} />}
        {activeTab === 'procedures' && <ProcedureEncoding currentDoctor={currentUser.name} />}
        {activeTab === 'pharmacy' && <PharmacyQueue />}
        {activeTab === 'billing' && <BillingModule />}
        {activeTab === 'analytics' && <DOHAnalytics />}
        {activeTab === 'admin' && <StockManagement />}
      </div>
    </main>
  );
}
