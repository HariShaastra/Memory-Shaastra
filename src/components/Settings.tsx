import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Trash2 } from 'lucide-react';

export default function Settings() {
  const { user, setUser, setView } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight italic serif">Settings</h2>
        <p className="text-zinc-500 text-sm">Manage your profile and application preferences.</p>
      </header>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{user?.name || 'Guest User'}</h3>
                <p className="text-sm text-zinc-500">{user?.email || 'Sign in to sync your data'}</p>
              </div>
            </div>
            {!user && (
              <button 
                onClick={() => setView('auth')}
                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={user?.name || ''}
                  readOnly
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  readOnly
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm outline-none"
                />
              </div>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-red-500 mb-6">Danger Zone</h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-zinc-900">Delete Account</p>
              <p className="text-xs text-zinc-500">Permanently remove all your study data and mnemonics.</p>
            </div>
            <button className="flex items-center justify-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all">
              <Trash2 size={16} />
              <span>Delete Forever</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
