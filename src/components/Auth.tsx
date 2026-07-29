import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { MaanasMascot } from './MaanasMascot';
import { Logo } from './Logo';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged
} from '../firebase';

export default function Auth() {
  const { setUser, setView } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Learner',
          photoUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`
        } as any);
        setView('dashboard');
      }
    });
    return () => unsubscribe();
  }, [setUser, setView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        setUser({
          id: userCred.user.uid,
          email: userCred.user.email || email,
          name: userCred.user.displayName || email.split('@')[0],
          photoUrl: userCred.user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userCred.user.uid}`
        } as any);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name && userCred.user) {
          await updateProfile(userCred.user, { displayName: name });
        }
        setUser({
          id: userCred.user.uid,
          email: userCred.user.email || email,
          name: name || email.split('@')[0],
          photoUrl: userCred.user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userCred.user.uid}`
        } as any);
      }
      setLoading(false);
      setView('dashboard');
    } catch (err: any) {
      setLoading(false);
      console.error('Firebase Auth Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setUser({
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || 'Learner',
        photoUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`
      } as any);
      setLoading(false);
      setView('dashboard');
    } catch (err: any) {
      setLoading(false);
      const errCode = err?.code;
      if (errCode === 'auth/popup-closed-by-user' || errCode === 'auth/cancelled-popup-request') {
        console.info('Google Sign-In popup closed or cancelled by user.');
      } else if (errCode === 'auth/popup-blocked') {
        console.warn('Google Sign-In popup blocked by browser.');
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups and try again.');
      } else if (errCode === 'auth/unauthorized-domain') {
        console.warn('Google Sign-In domain not authorized.');
        setAuthError('This domain is not authorized for Google Sign-In in Firebase settings.');
      } else {
        console.error('Google Sign-In Error:', err);
        setAuthError(err?.message || 'Google Sign-In failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a1614] text-[#fef3c7]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#2a221f] rounded-[3rem] p-8 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-[#3f332c] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30" />
        
        <div className="flex flex-col items-center mb-8 text-center relative z-10">
          <Logo size={48} className="mb-4 drop-shadow-lg" />
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-orange-600/20 blur-[30px] rounded-full" />
            <MaanasMascot size={110} expression="happy" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-orange-100 italic uppercase">Memory Shaastra</h1>
          <p className="text-[10px] text-orange-200/50 font-bold tracking-wider mt-2 px-4 italic">
            Sign in with your email or Google account to synchronize your study progress & memory techniques.
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-bold text-rose-300 text-center">
            {authError}
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="space-y-4 mb-6 relative z-10">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-orange-50 text-gray-900 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-3 border border-gray-200 active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google Account</span>
          </button>

          <div className="flex items-center space-x-3 my-2">
            <div className="flex-1 h-px bg-[#3f332c]" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-orange-200/40">or with email</span>
            <div className="flex-1 h-px bg-[#3f332c]" />
          </div>
        </div>

        <div className="flex bg-[#1a1614] p-1.5 rounded-2xl mb-6 border border-[#3f332c] relative z-10">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setAuthError(null); }}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${isLogin ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/40 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setAuthError(null); }}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${!isLogin ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/40 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-orange-200/50 uppercase tracking-wider block mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200/40" size={16} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-xl py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-orange-500 outline-none text-orange-100 font-bold"
                    placeholder="e.g. Ananya Sharma"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <label className="text-[10px] font-bold text-orange-200/50 uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200/40" size={16} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-xl py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-orange-500 outline-none text-orange-100 font-bold"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-orange-200/50 uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200/40" size={16} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-xl py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-orange-500 outline-none text-orange-100 font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4 active:scale-98 text-xs uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                <span>{isLogin ? 'Sign In with Email' : 'Create Account'}</span>
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={() => {
              setUser({ id: 'guest', name: 'Learner', email: 'guest@maanas.com' } as any);
              setView('dashboard');
            }}
            className="w-full py-2.5 text-[10px] text-orange-200/40 font-bold uppercase tracking-widest hover:text-orange-200/80 transition-all text-center"
          >
            Explore as Guest
          </button>
        </form>
      </motion.div>
    </div>
  );
}
