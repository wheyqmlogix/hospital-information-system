'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PatientRecord } from '@/lib/db';
import { COMMON_RVS_CODES } from '@/lib/constants';

export default function ProcedureEncoding({ currentDoctor }: { currentDoctor: string }) {
  const patients = useLiveQuery(() => db.patients.toArray());
  const procedures = useLiveQuery(() => db.procedures.orderBy('procedureDate').reverse().toArray());

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [rvsCode, setRvsCode] = useState('');
  const [findings, setFindings] = useState('');
  const [anesthesiologist, setAnesthesiologist] = useState('');

  const handleSaveProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !rvsCode) return;

    const rvsInfo = COMMON_RVS_CODES.find(r => r.code === rvsCode);

    await db.procedures.add({
      patientId: selectedPatientId,
      rvsCode,
      description: rvsInfo?.description || 'Other Procedure',
      procedureDate: Date.now(),
      surgeon: currentDoctor,
      anesthesiologist,
      findings,
      status: 'COMPLETED',
      createdAt: Date.now()
    });

    setRvsCode('');
    setFindings('');
    setAnesthesiologist('');
    alert('Procedure Encoded and Saved to Medical Records.');
  };

  return (
    <div className="p-4 space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
          <span>🔪</span> Surgical & Procedure Encoding (RVS)
        </h2>
        
        <form onSubmit={handleSaveProcedure} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Patient</label>
              <select className="w-full border p-2 rounded" onChange={e => setSelectedPatientId(parseInt(e.target.value))} required>
                <option value="">Choose Patient...</option>
                {patients?.map(p => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RVS Procedure Code</label>
              <select className="w-full border p-2 rounded" value={rvsCode} onChange={e => setRvsCode(e.target.value)} required>
                <option value="">Search PhilHealth RVS...</option>
                {COMMON_RVS_CODES.map(r => <option key={r.code} value={r.code}>{r.code} - {r.description}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Surgeon</label>
              <input type="text" className="w-full border p-2 rounded bg-gray-50" value={currentDoctor} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anesthesiologist (Optional)</label>
              <input type="text" className="w-full border p-2 rounded" value={anesthesiologist} onChange={e => setAnesthesiologist(e.target.value)} placeholder="Dr. Name" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Clinical Findings / Operative Note</label>
            <textarea className="w-full border p-2 rounded h-24" value={findings} onChange={e => setFindings(e.target.value)} placeholder="Enter detailed findings..." />
          </div>

          <button type="submit" className="w-full bg-blue-700 text-white p-3 rounded-lg font-bold shadow-lg hover:bg-blue-800">
            Finalize & Save Procedure
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Recent Completed Procedures</div>
        <table className="w-full text-sm text-left">
          <thead className="bg-white border-b text-[10px] uppercase font-bold text-gray-400">
            <tr>
              <th className="p-3">Patient</th>
              <th className="p-3">RVS / Description</th>
              <th className="p-3">Surgeon</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {procedures?.map(proc => {
              const patient = patients?.find(p => p.id === proc.patientId);
              return (
                <tr key={proc.id} className="hover:bg-gray-50">
                  <td className="p-3 font-bold">{patient?.lastName}, {patient?.firstName}</td>
                  <td className="p-3">
                    <span className="text-blue-700 font-bold">{proc.rvsCode}</span> - {proc.description}
                  </td>
                  <td className="p-3 text-gray-600">{proc.surgeon}</td>
                  <td className="p-3 text-gray-400">{new Date(proc.procedureDate).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
