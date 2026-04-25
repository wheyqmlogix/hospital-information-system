'use client';

import { useState, useEffect } from 'react';
import PatientForm from "@/components/PatientForm";
import ClaimsDashboard from "@/components/ClaimsDashboard";
import StockManagement from "@/components/inventory/StockManagement";
import BillingModule from "@/components/billing/BillingModule";
import DOHAnalytics from "@/components/analytics/DOHAnalytics";
import { MOCK_USERS, type User, getPermissions } from "@/lib/auth";
import { startAutoSync } from '@/lib/sync-service';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [activeTab, setActiveTab] = useState<'register' | 'claims' | 'inventory' | 'billing' | 'analytics'>('register');

  // Track pending sync items for the UI indicator
  const pendingSyncCount = useLiveQuery(
    () => db.patients.where('status').equals('draft').count(),
    []
  );

  useEffect(() => {
    // Start the background sync worker
    const cleanup = startAutoSync(60000); // Sync every minute
    return cleanup;
  }, []);

  const permissions = getPermissions(currentUser.role);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Top Bar with Role & Sync Status */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Profile</span>
              <p className="text-lg font-bold text-blue-900 leading-tight">{currentUser.name}</p>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-black uppercase">
                {currentUser.role}
              </span>
            </div>
            
            {/* Sync Status Indicator */}
            <div className="border-l pl-6 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${pendingSyncCount === 0 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cloud Sync</span>
                <p className="text-sm font-bold text-gray-700">
                  {pendingSyncCount === 0 ? 'Fully Synced' : `${pendingSyncCount} Pending...`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {MOCK_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={`px-3 py-1 text-xs rounded border transition-all ${
                  currentUser.id === user.id ? 'bg-blue-600 text-white shadow-md scale-105' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                {user.role}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto bg-white rounded-t-lg">
          <button onClick={() => setActiveTab('register')} className={`px-6 py-4 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'register' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>1. Registration</button>
          <button onClick={() => setActiveTab('claims')} disabled={!permissions.canAccessSync} className={`px-6 py-4 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'claims' ? 'border-b-4 border-blue-600 text-blue-600' : !permissions.canAccessSync ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}>2. PhilHealth Queue</button>
          <button onClick={() => setActiveTab('inventory')} disabled={!permissions.canAccessInventory} className={`px-6 py-4 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'border-b-4 border-blue-600 text-blue-600' : !permissions.canAccessInventory ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}>3. Pharmacy</button>
          <button onClick={() => setActiveTab('billing')} disabled={!permissions.canAccessBilling} className={`px-6 py-4 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'billing' ? 'border-b-4 border-blue-600 text-blue-600' : !permissions.canAccessBilling ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}>4. Billing</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-6 py-4 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>5. DOH Analytics</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'register' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">Hospital Information System</h1>
              <p className="text-lg text-gray-600">Secure Offline-First Architecture with PostgreSQL Persistent Cloud</p>
            </div>
            <PatientForm currentUser={currentUser} />
          </div>
        )}
        
        {activeTab === 'claims' && permissions.canAccessSync && <ClaimsDashboard />}
        {activeTab === 'inventory' && permissions.canAccessInventory && <StockManagement />}
        {activeTab === 'billing' && permissions.canAccessBilling && <BillingModule />}
        {activeTab === 'analytics' && <DOHAnalytics />}
      </div>
    </main>
  );
}
