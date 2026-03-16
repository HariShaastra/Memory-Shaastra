import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [totalStudied, setTotalStudied] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          setSessionCompleted(true);
          setTotalStudied(prev => prev + (mode === 'study' ? 25 : 0)); // Simplified
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'study' ? 25 : 5);
    setSeconds(0);
    setSessionCompleted(false);
  };

  const setDuration = (mins: number) => {
    setIsActive(false);
    setMinutes(mins);
    setSeconds(0);
    setSessionCompleted(false);
  };

  if (sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <Clock size={48} />
          </div>
          <h2 className="text-4xl font-bold mb-4 italic serif">Session Completed!</h2>
          <p className="text-zinc-500 mb-12">Great job. You've added {mode === 'study' ? 'a study session' : 'a break'} to your day.</p>
          <button 
            onClick={resetTimer}
            className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
          >
            Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-8">
      <div className="w-full bg-white dark:bg-[#151619] rounded-[40px] p-12 border border-zinc-200 dark:border-white/10 shadow-2xl text-center relative overflow-hidden transition-colors duration-500">
        <div className="flex justify-center space-x-4 mb-12">
          <button 
            onClick={() => { setMode('study'); setDuration(25); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'study' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}`}
          >
            Study
          </button>
          <button 
            onClick={() => { setMode('break'); setDuration(5); }}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'break' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}`}
          >
            Break
          </button>
        </div>

        <div className="text-[140px] font-light tracking-tighter leading-none mb-12 font-mono text-zinc-900 dark:text-white">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <div className="flex justify-center items-center space-x-8">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw size={24} />
          </button>
          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
              isActive ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' : 'bg-emerald-500 text-white'
            }`}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
          </button>
          <div className="w-14 h-14" />
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4">
          {[25, 40, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => setDuration(mins)}
              className="py-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
