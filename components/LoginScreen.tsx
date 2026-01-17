'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Lock } from 'lucide-react';

export default function LoginScreen() {
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(password);
    if (!success) alert('パスワードが違います');
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0F0F0F] fixed inset-0 z-[100]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1A1A1A] p-8 rounded-2xl border border-white/5 shadow-2xl w-80 space-y-6"
      >
        <div className="flex justify-center text-blue-500">
          <Lock size={32} />
        </div>
        <h1 className="text-center font-bold text-xl text-white">
          LaunchPad Unlock
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none text-white"
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-colors"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
