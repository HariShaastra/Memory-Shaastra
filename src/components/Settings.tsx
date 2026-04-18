import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Trash2 } from 'lucide-react';

export default function Settings() {
  const { user, setUser, setView } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-12">
      <header className="mb-16">
        <h2 className="text-5xl font-black text-orange-100 italic uppercase tracking-tighter drop-shadow-sm">Settings</h2>
        <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Change your profile and account.</p>
      </header>

      <div className="space-y-12">
        {/* Profile Section */}
        <section className="bg-[#2a221f] border border-[#3f332c] rounded-[4rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User size={120} className="text-orange-500" />
          </div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-[2rem] bg-[#1a1614] border border-[#3f332c] text-orange-500 flex items-center justify-center shadow-inner">
                <User size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-orange-100 italic tracking-tight">{user?.name || 'Guest'}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200/20">{user?.email || 'Not signed in'}</p>
              </div>
            </div>
            {!user && (
              <button 
                onClick={() => setView('auth')}
                className="bg-orange-600 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>

          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Name</label>
                <div className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-sm text-orange-100 font-bold italic shadow-inner">
                  {user?.name || ''}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Email</label>
                <div className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-sm text-orange-100 font-bold italic shadow-inner">
                  {user?.email || ''}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="bg-rose-950/20 border border-rose-500/10 rounded-[4rem] p-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-[10px] font-black text-rose-500 mb-8 uppercase tracking-[0.4em] italic relative z-10">Danger Zone</h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <p className="text-sm font-black text-orange-100 uppercase italic tracking-tighter">Delete Account</p>
              <p className="text-[10px] text-orange-200/20 font-black uppercase tracking-[0.1em] mt-1">This will remove all your data forever.</p>
            </div>
            <button className="flex items-center justify-center space-x-3 bg-rose-600/10 border border-rose-500/20 text-rose-500 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95">
              <Trash2 size={18} />
              <span>Delete Forever</span>
            </button>
          </div >
        </section>
      </div>
    </div>
  );
}
