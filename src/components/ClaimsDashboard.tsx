'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PatientRecord } from '@/lib/db';
import { validateForPhilHealth } from '@/lib/validation';
import { useState, Fragment } from 'react';

export default function ClaimsDashboard() {
  const records = useLiveQuery(() => db.patients.orderBy('updatedAt').reverse().toArray());
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showXml, setShowXml] = useState<number | null>(null);

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
              const isExpanded = expandedId === record.id;
              
              return (
                <Fragment key={record.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : record.id!)}>
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-2">
                        {record.lastName}, {record.firstName}
                        {!validation.isValid && <span className="text-red-500" title="Has Validation Errors">⚠️</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {record.id} | PIN: {record.memberPIN || 'N/A'}</div>
                    </td>
                    <td className="p-4 italic text-gray-600 text-xs">
                      {record.diagnosisCode ? (
                        <span><b>{record.diagnosisCode}</b> - {record.diagnosisDescription}</span>
                      ) : <span className="text-red-400">MISSING DIAGNOSIS</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                        record.status === 'synced' ? 'bg-green-100 text-green-700' :
                        validation.isValid ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status === 'synced' ? '✓ SYNCED' : validation.isValid ? '● READY' : '✖ INCOMPLETE'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2" onClick={e => e.stopPropagation()}>
                      {record.status !== 'synced' ? (
                        <>
                          <button
                            onClick={() => handleSync(record)}
                            disabled={syncingId === record.id || !validation.isValid}
                            className={`px-3 py-1 rounded text-[10px] font-black transition-all ${
                              validation.isValid 
                                ? 'bg-blue-900 text-white hover:bg-blue-800 shadow-md active:scale-95' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {syncingId === record.id ? 'SYNCING...' : 'SYNC TO PHILHEALTH'}
                          </button>
                          <button 
                            onClick={() => setShowXml(showXml === record.id ? null : record.id!)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Preview eClaims XML"
                          >
                            <span className="text-xs font-bold font-mono">XML</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Transaction Verified</span>
                      )}
                    </td>
                  </tr>
                  
                  {isExpanded && !validation.isValid && (
                    <tr className="bg-red-50">
                      <td colSpan={4} className="p-4 border-l-4 border-l-red-500">
                        <p className="text-[10px] font-black text-red-700 uppercase mb-2 tracking-widest">Compliance Audit Errors</p>
                        <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                          {validation.errors.map((err, idx) => (
                            <li key={idx} className="text-xs text-red-600 flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              {err}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}

                  {showXml === record.id && (
                    <tr className="bg-gray-900">
                      <td colSpan={4} className="p-4 font-mono text-[10px] text-green-400 overflow-x-auto">
                        <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
                          <span className="font-bold text-gray-500 uppercase">eClaims 3.0 Structure Preview</span>
                          <button onClick={() => setShowXml(null)} className="text-gray-500 hover:text-white">CLOSE</button>
                        </div>
                        <pre>
{`<?xml version="1.0" encoding="UTF-8"?>
<eCLAIMS_STAGING>
  <ENCOUNTER id="${record.id}">
    <PATIENT lastName="${record.lastName}" firstName="${record.firstName}" pin="${record.memberPIN}" />
    <MEMBERSHIP type="${record.membershipType}" relation="${record.relationshipToMember}" />
    <CLINICAL dx="${record.diagnosisCode}">
      <CHIEF_COMPLAINT>${record.chiefComplaint}</CHIEF_COMPLAINT>
      <VITALS bp="${record.vitals?.bpSystolic}/${record.vitals?.bpDiastolic}" temp="${record.vitals?.temp}" />
    </CLINICAL>
    <STATUS current="STAGED" action="READY_FOR_TRANSMITTAL" />
  </ENCOUNTER>
</eCLAIMS_STAGING>`}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
