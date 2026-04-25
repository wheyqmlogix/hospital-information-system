'use client';

import { useState } from 'react';
import { savePatientRecord, type MembershipType, type RelationToMember } from '@/lib/db';
import { MEMBERSHIP_TYPES, RELATIONSHIPS } from '@/lib/constants';
import { getPermissions, type User } from '@/lib/auth';
import ICD10Search from './clinical/ICD10Search';

interface PatientFormProps {
  currentUser: User;
}

export default function PatientForm({ currentUser }: PatientFormProps) {
  const permissions = getPermissions(currentUser.role);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    extensionName: '',
    birthDate: '',
    sex: 'Male' as 'Male' | 'Female',
    memberPIN: '',
    patientPIN: '',
    membershipType: 'S' as MembershipType,
    relationshipToMember: 'M' as RelationToMember,
    chiefComplaint: '',
    diagnosisCode: '',
    diagnosisDescription: '',
    vitals: {
      bpSystolic: 0,
      bpDiastolic: 0,
      temp: 36.5,
      weight: 0,
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await savePatientRecord(formData);
      alert('Record saved successfully in Draft status.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Error saving record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto space-y-8 bg-white shadow-xl rounded-xl border border-gray-100">
      <div className="border-b pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Patient Registration & Encounter</h2>
          <p className="text-sm text-gray-500">PCDI & PhilHealth eClaims 3.0 Compliant</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-gray-400">Permissions</span>
          <div className="flex gap-1">
            {permissions.canEditDemographics && <span className="w-2 h-2 rounded-full bg-blue-500" title="Can Edit Demographics"></span>}
            {permissions.canEditClinical && <span className="w-2 h-2 rounded-full bg-green-500" title="Can Edit Clinical"></span>}
          </div>
        </div>
      </div>

      {/* Demographics Section - Restricted to ENCODER/ADMIN */}
      <fieldset disabled={!permissions.canEditDemographics} className={!permissions.canEditDemographics ? 'opacity-50 grayscale' : ''}>
        <section className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800 border-l-4 border-blue-500 pl-2">
            1. Demographics {!permissions.canEditDemographics && '(Read-Only)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border p-2 rounded bg-gray-50" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border p-2 rounded bg-gray-50" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Birth Date</label>
              <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full border p-2 rounded bg-gray-50" required />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">PhilHealth Membership</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900">Member PIN</label>
                <input 
                  type={permissions.canViewFullPIN ? "text" : "password"} 
                  maxLength={12} 
                  value={formData.memberPIN} 
                  onChange={e => setFormData({...formData, memberPIN: e.target.value})} 
                  className="w-full border p-2 rounded border-blue-200" 
                  placeholder="12-digit PIN" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900">Membership Category</label>
                <select value={formData.membershipType} onChange={e => setFormData({...formData, membershipType: e.target.value as MembershipType})} className="w-full border p-2 rounded border-blue-200">
                  {MEMBERSHIP_TYPES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>
      </fieldset>

      {/* Clinical Section - Restricted to DOCTOR/ADMIN */}
      <fieldset disabled={!permissions.canEditClinical} className={!permissions.canEditClinical ? 'opacity-50 grayscale' : ''}>
        <section className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800 border-l-4 border-green-500 pl-2">
            2. Clinical Encounter {!permissions.canEditClinical && '(Doctor Only)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block text-sm font-medium">Chief Complaint</label>
              <textarea value={formData.chiefComplaint} onChange={e => setFormData({...formData, chiefComplaint: e.target.value})} className="w-full border p-2 rounded h-20 bg-gray-50" required />
            </div>
            
            <ICD10Search onSelect={(code, desc) => setFormData({...formData, diagnosisCode: code, diagnosisDescription: desc})} />
            
            <div>
              <label className="block text-sm font-medium text-green-800 font-bold">Confirmed Diagnosis</label>
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm min-h-[40px]">
                {formData.diagnosisCode ? (
                  <span><b className="text-green-700">{formData.diagnosisCode}</b> - {formData.diagnosisDescription}</span>
                ) : <span className="text-gray-400 italic">Select from ICD-10 search...</span>}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium">BP Systolic</label>
              <input type="number" value={formData.vitals.bpSystolic} onChange={e => setFormData({...formData, vitals: {...formData.vitals, bpSystolic: parseInt(e.target.value)}})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs font-medium">Temp (°C)</label>
              <input type="number" step="0.1" value={formData.vitals.temp} onChange={e => setFormData({...formData, vitals: {...formData.vitals, temp: parseFloat(e.target.value)}})} className="w-full border p-2 rounded" />
            </div>
          </div>
        </section>
      </fieldset>

      <div className="flex gap-4">
        <button 
          type="submit" 
          disabled={isSaving}
          className="flex-1 bg-blue-700 text-white p-4 rounded-lg font-bold hover:bg-blue-800 shadow-lg transition-all disabled:bg-gray-400 transform active:scale-95"
        >
          {isSaving ? 'Processing...' : 'Save & Prepare for PhilHealth Sync'}
        </button>
      </div>
    </form>
  );
}
