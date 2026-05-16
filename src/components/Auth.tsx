import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Camera } from 'lucide-react';
import { MaanasMascot } from './MaanasMascot';
import { Logo } from './Logo';

export default function Auth() {
  const { setUser, setView } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser({
        email,
        name: isLogin ? (email.split('@')[0]) : name,
        photoUrl: photoUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name || email}`
      });
      setLoading(false);
      setView('dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a1614] text-[#fef3c7]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#2a221f] rounded-[4rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-[#3f332c] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30" />
        
        <div className="flex flex-col items-center mb-12 text-center relative z-10">
          <Logo size={56} className="mb-8 drop-shadow-lg" />
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-600/20 blur-[40px] rounded-full" />
            <MaanasMascot size={140} expression="happy" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic text-orange-100 mt-2 uppercase drop-shadow-sm leading-none">Maanas Account</h1>
          <p className="text-[10px] text-orange-200/40 font-black uppercase tracking-[0.3em] mt-4 px-8 leading-relaxed italic">Your personal study companion for a better memory.</p>
        </div>

        <div className="flex bg-[#1a1614] p-2 rounded-[2rem] mb-10 border border-[#3f332c] relative z-10 shadow-inner">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all italic ${isLogin ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-orange-200/20'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all italic ${!isLogin ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-orange-200/20'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-200/20" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-orange-100 font-bold italic shadow-inner"
                    placeholder="Enter your name..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-2.5">
            <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-200/20" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-orange-100 font-bold italic shadow-inner"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-200/20" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all text-orange-100 font-bold italic shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-orange-600/30 transition-all flex items-center justify-center space-x-4 disabled:opacity-50 mt-6 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            {loading ? (
              <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={22} className="relative z-10" /> : <UserPlus size={22} className="relative z-10" />}
                <span className="uppercase tracking-[0.3em] text-[10px] font-black relative z-10 italic">{isLogin ? 'Login Now' : 'Sign Up'}</span>
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={() => {
              setUser({ id: 'guest', name: 'Explorer', email: 'guest@maanas.com' } as any);
              setView('dashboard');
            }}
            className="w-full py-4 text-[9px] text-orange-200/20 font-black uppercase tracking-[0.4em] hover:text-orange-200/40 transition-all italic"
          >
            Enter as Explorer (Guest)
          </button>
        </form>
      </motion.div>
    </div>
  );
}
