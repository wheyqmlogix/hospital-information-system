'use client';

import { useState, useEffect } from 'react';
import { login, MOCK_USERS, type User } from '@/lib/auth';
import { db } from '@/lib/db';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Admin user if none exists
  useEffect(() => {
    const initAdmin = async () => {
      const adminCount = await db.users.where('role').equals('ADMIN').count();
      if (adminCount === 0) {
        await db.users.add({
          username: 'admin',
          password: 'password123',
          name: 'System Administrator',
          role: 'ADMIN',
          status: 'active'
        });
      }
      setIsInitializing(false);
    };
    initAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = await login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password, or account is inactive.');
    }
  };

  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-blue-900 text-white font-bold">Initializing System...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-4xl shadow-lg mb-4">🏥</div>
          <h2 className="text-3xl font-black text-blue-900 tracking-tighter uppercase">Philippine HIS</h2>
          <p className="mt-2 text-sm text-gray-500 font-bold uppercase tracking-widest">Medical Staff Portal</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Username</label>
              <input
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:border-blue-600 focus:z-10 sm:text-sm font-mono transition-all"
                placeholder="Staff ID / Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:border-blue-600 focus:z-10 sm:text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xl shadow-blue-200 uppercase tracking-widest active:scale-95"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest mb-4">Emergency Prototype Access</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => {setUsername('admin'); setPassword('password123');}} className="text-[9px] bg-gray-50 text-gray-500 p-2 rounded hover:bg-gray-100 font-bold border">ADMIN: admin / password123</button>
            <p className="text-[9px] text-gray-400 italic flex items-center justify-center text-center">Use Admin to create other staff accounts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
