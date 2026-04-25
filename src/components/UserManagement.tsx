'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type UserAccount } from '@/lib/db';
import { UserRole } from '@/lib/auth';

const ROLES: UserRole[] = ['ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'CASHIER', 'ENCODER'];

export default function UserManagement() {
  const users = useLiveQuery(() => db.users.toArray());

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'ENCODER' as UserRole,
    licenseNo: '',
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if username already exists in Dexie
      const existing = await db.users.where('username').equals(newUser.username).first();
      if (existing) {
        alert('Username already exists locally.');
        return;
      }

      await db.users.add({
        ...newUser,
        status: 'active',
      });

      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'ENCODER',
        licenseNo: '',
      });
      alert('User created successfully.');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Error creating user.');
    }
  };

  const toggleUserStatus = async (user: UserAccount) => {
    if (!user.id) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await db.users.update(user.id, { status: newStatus });
  };

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="md:col-span-1">
          <form onSubmit={handleCreateUser} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h3 className="font-bold text-lg text-blue-900">Create Staff Account</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  value={newUser.name} 
                  onChange={e => setNewUser({...newUser, name: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded font-mono" 
                  value={newUser.username} 
                  onChange={e => setNewUser({...newUser, username: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Initial Password</label>
                <input 
                  type="password" 
                  className="w-full border p-2 rounded" 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Role</label>
                <select 
                  className="w-full border p-2 rounded" 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                >
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              {(newUser.role === 'DOCTOR' || newUser.role === 'PHARMACIST') && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">License No (PRC/S2)</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    value={newUser.licenseNo} 
                    onChange={e => setNewUser({...newUser, licenseNo: e.target.value})} 
                    required 
                  />
                </div>
              )}
            </div>
            <button className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition-colors">
              Save Account
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex justify-between items-center">
              <span>Staff Registry</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{users?.length || 0} Accounts</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b text-[10px] uppercase font-bold text-gray-400">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users?.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-blue-900">{user.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">@{user.username}</div>
                      {user.licenseNo && <div className="text-[10px] text-gray-500 font-bold">License: {user.licenseNo}</div>}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">{user.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase ${user.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                          user.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.status === 'active' ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
