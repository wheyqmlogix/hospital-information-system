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
import UserManagement from "@/components/UserManagement";
import Login from "@/components/Login";
import { getCurrentUser, logout, type User, getPermissions } from "@/lib/auth";
import { startAutoSync } from '@/lib/sync-service';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'register' | 'adt' | 'orders' | 'procedures' | 'pharmacy' | 'billing' | 'analytics' | 'admin' | 'users'>('register');
  const [isClient, setIsClient] = useState(false);

  const pendingSyncCount = useLiveQuery(() => db.patients.where('status').equals('draft').count(), []);

  useEffect(() => {
    setIsClient(true);
    const user = getCurrentUser();
    if (user) setCurrentUser(user);

    const cleanup = startAutoSync(60000);
    return cleanup;
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  if (!isClient) return null;
  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  const permissions = getPermissions(currentUser.role);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medical Staff</span>
              <p className="text-lg font-bold text-blue-900 leading-tight">{currentUser.name}</p>
              <div className="flex gap-2 items-center mt-1">
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-black uppercase">{currentUser.role}</span>
                {currentUser.licenseNo && <span className="text-[10px] text-gray-400 font-bold uppercase">Lic: {currentUser.licenseNo}</span>}
              </div>
            </div>
            <div className="border-l pl-6 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${pendingSyncCount === 0 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Database</span>
                <p className="text-sm font-bold text-gray-700">{pendingSyncCount === 0 ? 'Cloud Synced' : `${pendingSyncCount} Local`}</p>
              </div>
            </div>
          </div>
          <div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-100 uppercase tracking-widest"
            >
              Log Out
            </button>
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
          {currentUser.role === 'ADMIN' && (
            <button onClick={() => setActiveTab('users')} className={`px-4 py-4 font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'users' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}>STAFF MGMT</button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'register' && <PatientForm currentUser={currentUser} />}
        {activeTab === 'adt' && <BedManagement />}
        {activeTab === 'orders' && <DoctorOrders currentUser={currentUser} />}
        {activeTab === 'procedures' && <ProcedureEncoding currentUser={currentUser} />}
        {activeTab === 'pharmacy' && <PharmacyQueue currentStaff={currentUser.name} />}
        {activeTab === 'billing' && <BillingModule />}
        {activeTab === 'analytics' && <DOHAnalytics />}
        {activeTab === 'admin' && <StockManagement />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </main>
  );
}
