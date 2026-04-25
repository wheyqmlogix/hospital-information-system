'use client';

import { COMMON_DIAGNOSES } from '@/lib/constants';
import { useState } from 'react';

interface ICD10SearchProps {
  onSelect: (code: string, description: string) => void;
}

export default function ICD10Search({ onSelect }: ICD10SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = COMMON_DIAGNOSES.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Diagnosis (ICD-10)</label>
      <input
        type="text"
        placeholder="Search diagnosis or code..."
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <div className="max-h-40 overflow-y-auto border rounded bg-white shadow-sm">
          {filtered.map((d) => (
            <div
              key={d.code}
              className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
              onClick={() => {
                onSelect(d.code, d.description);
                setSearchTerm('');
              }}
            >
              <span className="font-bold text-blue-700">{d.code}</span> - {d.description}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-2 text-sm text-gray-500 italic">No common diagnosis found. Manual entry allowed.</div>
          )}
        </div>
      )}
    </div>
  );
}
