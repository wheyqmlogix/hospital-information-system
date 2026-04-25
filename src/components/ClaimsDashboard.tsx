'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PatientRecord } from '@/lib/db';
import { validateForPhilHealth } from '@/lib/validation';
import { useState } from 'react';

export default function ClaimsDashboard() {
  const records = useLiveQuery(() => db.patients.orderBy('updatedAt').reverse().toArray());
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleSync = async (record: PatientRecord) => {
    if (!record.id) return;
    
    const validation = validateForPhilHealth(record);
    if (!validation.isValid) {
      alert(`Cannot sync. Errors found:\n- ${validation.errors.join('\n- ')}`);
      return;
    }

    setSyncingId(record.id);
    
    // Simulate API call to PhilHealth
    setTimeout(async () => {
      await db.patients.update(record.id!, { 
        status: 'synced',
        updatedAt: Date.now() 
      });
      setSyncingId(null);
      alert('Record synchronized with PhilHealth successfully.');
    }, 1500);
  };

  if (!records) return <div className="p-8 text-center">Loading records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-900">PhilHealth Sync Queue</h2>
        <span className="text-sm text-gray-500">{records.length} total records</span>
      </div>

      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-4">Patient Name</th>
              <th className="p-4">Diagnosis</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map(record => {
              const validation = validateForPhilHealth(record);
              return (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{record.lastName}, {record.firstName}</div>
                    <div className="text-[10px] text-gray-400">PIN: {record.memberPIN || 'N/A'}</div>
                  </td>
                  <td className="p-4 italic text-gray-600">
                    {record.diagnosisCode} - {record.diagnosisDescription}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      record.status === 'synced' ? 'bg-green-100 text-green-700' :
                      validation.isValid ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.status === 'synced' ? 'SYNCED' : validation.isValid ? 'READY' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="p-4">
                    {record.status !== 'synced' && (
                      <button
                        onClick={() => handleSync(record)}
                        disabled={syncingId === record.id}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          validation.isValid 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {syncingId === record.id ? 'Syncing...' : 'Sync Now'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="p-8 text-center text-gray-400 italic">No records found. Register a patient to begin.</div>
        )}
      </div>
    </div>
  );
}
