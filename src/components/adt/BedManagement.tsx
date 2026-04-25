'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Room, type Bed, type PatientRecord } from '@/lib/db';
import { useState } from 'react';

export default function BedManagement() {
  const rooms = useLiveQuery(() => db.rooms.toArray());
  const beds = useLiveQuery(() => db.beds.toArray());
  const patients = useLiveQuery(() => db.patients.toArray());
  const admissions = useLiveQuery(() => db.admissions.where('status').equals('ADMITTED').toArray());

  const [selectedBed, setSelectedBed] = useState<number | null>(null);
  const [patientToAdmit, setPatientToAdmit] = useState<number | null>(null);

  const handleAdmit = async () => {
    if (!selectedBed || !patientToAdmit) return;
    
    await db.admissions.add({
      patientId: patientToAdmit,
      bedId: selectedBed,
      admissionDate: Date.now(),
      status: 'ADMITTED'
    });

    await db.beds.update(selectedBed, { status: 'OCCUPIED' });
    setSelectedBed(null);
    setPatientToAdmit(null);
    alert('Patient Admitted successfully.');
  };

  const handleDischarge = async (bedId: number) => {
    const admission = admissions?.find(a => a.bedId === bedId);
    if (!admission) return;

    if (!confirm('Proceed with Patient Discharge? This will clear the bed.')) return;

    await db.admissions.update(admission.id!, {
      status: 'DISCHARGED',
      dischargeDate: Date.now()
    });

    await db.beds.update(bedId, { status: 'CLEANING' });
    alert('Discharge initiated. Bed status set to CLEANING.');
  };

  // Mock data setup if empty
  const setupMockHospital = async () => {
    const roomId = await db.rooms.add({ name: 'Ward A (Medicine)', type: 'WARD', rate: 1500 });
    await db.beds.bulkAdd([
      { roomId, name: 'Bed 101-A', status: 'VACANT' },
      { roomId, name: 'Bed 101-B', status: 'VACANT' },
      { roomId, name: 'Bed 101-C', status: 'VACANT' },
    ]);
    const privId = await db.rooms.add({ name: 'Private Room 201', type: 'PRIVATE', rate: 4500 });
    await db.beds.add({ roomId: privId, name: 'Room 201-Main', status: 'VACANT' });
  };

  if (rooms?.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-dashed">
        <h3 className="text-xl font-bold text-gray-400 mb-4">No Rooms Configured</h3>
        <button onClick={setupMockHospital} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Initialize Hospital Bed Map</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Hospital Bed Map (ADT)</h2>
          <p className="text-sm text-gray-500">Real-time Admission & Room Management</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> <span className="text-xs">Vacant</span></div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> <span className="text-xs">Occupied</span></div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> <span className="text-xs">Cleaning</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map(room => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{room.name}</h3>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{room.type}</span>
              </div>
              <span className="text-sm font-bold text-green-700">₱{room.rate.toFixed(0)}/day</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {beds?.filter(b => b.roomId === room.id).map(bed => {
                const admission = admissions?.find(a => a.bedId === bed.id);
                const patient = patients?.find(p => p.id === admission?.patientId);
                
                return (
                  <div 
                    key={bed.id} 
                    className={`p-3 rounded-lg border-2 transition-all ${
                      bed.status === 'VACANT' ? 'border-green-200 bg-green-50 hover:border-green-400 cursor-pointer' :
                      bed.status === 'OCCUPIED' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                    }`}
                    onClick={() => bed.status === 'VACANT' && setSelectedBed(bed.id!)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500">{bed.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        bed.status === 'VACANT' ? 'bg-green-500' :
                        bed.status === 'OCCUPIED' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                    
                    {bed.status === 'OCCUPIED' ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-red-900 truncate">{patient?.lastName}, {patient?.firstName}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDischarge(bed.id!); }}
                          className="text-[9px] w-full bg-white border border-red-200 text-red-600 font-bold py-1 rounded hover:bg-red-600 hover:text-white transition-colors"
                        >
                          DISCHARGE
                        </button>
                      </div>
                    ) : bed.status === 'CLEANING' ? (
                      <button 
                        onClick={() => db.beds.update(bed.id!, { status: 'VACANT' })}
                        className="text-[9px] w-full bg-white border border-yellow-400 text-yellow-700 font-bold py-1 rounded hover:bg-yellow-400 hover:text-white transition-colors"
                      >
                        SET VACANT
                      </button>
                    ) : (
                      <p className="text-[10px] text-green-700 italic">Available</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admission Modal */}
      {selectedBed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Patient Admission</h3>
            <p className="text-sm text-gray-500 mb-6">Assigning a patient to Bed {beds?.find(b => b.id === selectedBed)?.name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Patient</label>
                <select 
                  className="w-full border p-2 rounded" 
                  onChange={e => setPatientToAdmit(parseInt(e.target.value))}
                >
                  <option value="">Choose Patient...</option>
                  {patients?.filter(p => !admissions?.find(a => a.patientId === p.id)).map(p => (
                    <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button onClick={() => setSelectedBed(null)} className="flex-1 border p-2 rounded-lg font-bold">Cancel</button>
                <button 
                  onClick={handleAdmit}
                  disabled={!patientToAdmit}
                  className="flex-1 bg-blue-600 text-white p-2 rounded-lg font-bold disabled:bg-gray-300"
                >
                  Confirm Admission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
