'use client';

import { useState } from 'react';
import PatientForm from "@/components/PatientForm";
import ClaimsDashboard from "@/components/ClaimsDashboard";
import StockManagement from "@/components/inventory/StockManagement";
import BillingModule from "@/components/billing/BillingModule";
import DOHAnalytics from "@/components/analytics/DOHAnalytics";
import { MOCK_USERS, type User, getPermissions } from "@/lib/auth";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [activeTab, setActiveTab] = useState<'register' | 'claims' | 'inventory' | 'billing' | 'analytics'>('register');

  const permissions = getPermissions(currentUser.role);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Role Switcher & Nav */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-500 uppercase">Current User:</span>
            <p className="text-lg font-bold text-blue-900">{currentUser.name}</p>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-bold uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>
          <div className="flex gap-2">
            {MOCK_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={`px-3 py-1 text-xs rounded border transition-colors ${
                  currentUser.id === user.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                As {user.role}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'register' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            1. Registration
          </button>
          
          <button
            onClick={() => setActiveTab('claims')}
            disabled={!permissions.canAccessSync}
            className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'claims' ? 'border-b-2 border-blue-600 text-blue-600' : 
              !permissions.canAccessSync ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            2. PhilHealth Queue
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            disabled={!permissions.canAccessInventory}
            className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 
              !permissions.canAccessInventory ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            3. Pharmacy / Inventory
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            disabled={!permissions.canAccessBilling}
            className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'billing' ? 'border-b-2 border-blue-600 text-blue-600' : 
              !permissions.canAccessBilling ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            4. Billing / Cashier
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            5. DOH Analytics
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'register' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Hospital Information System</h1>
              <p className="text-lg text-gray-600">PCDI & eClaims 3.0 Standard Implementation</p>
            </div>
            <PatientForm currentUser={currentUser} />
          </div>
        )}
        
        {activeTab === 'claims' && permissions.canAccessSync && <ClaimsDashboard />}
        {activeTab === 'inventory' && permissions.canAccessInventory && <StockManagement />}
        {activeTab === 'billing' && permissions.canAccessBilling && <BillingModule />}
        {activeTab === 'analytics' && <DOHAnalytics />}
      </div>

      <div className="mt-12 max-w-md mx-auto grid grid-cols-1 gap-4 text-center">
        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-sm font-semibold text-blue-800 italic">
            Full Suite Prototype: Registration, PhilHealth Sync, Pharmacy Inventory, Automated Billing, and DOH Analytics.
          </p>
        </div>
      </div>
    </main>
  );
}
