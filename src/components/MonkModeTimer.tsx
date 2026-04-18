import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Target, Coffee, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { MaanasMascot } from './MaanasMascot';

const STUDY_QUOTES = [
  "Deep focus is a superpower.",
  "Your brain is muscle. Train it.",
  "One topic at a time, legendary explorer.",
  "Silence the world, listen to your mind.",
  "Maanas is watching! Stay focused.",
  "You're doing great. Keep pushing!"
];

export default function MonkModeTimer() {
  const { addXP, updateStreak } = useAppContext();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);

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
          handleComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  useEffect(() => {
    if (isActive) {
      const qInterval = setInterval(() => {
        setQuoteIdx(prev => (prev + 1) % STUDY_QUOTES.length);
      }, 10000);
      return () => clearInterval(qInterval);
    }
  }, [isActive]);

  const handleComplete = () => {
    setIsActive(false);
    setSessionCompleted(true);
    const xp = mode === 'study' ? minutes * 10 || 250 : 50;
    setEarnedXP(xp);
    addXP(xp);
    updateStreak();
  };

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
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10 flex flex-col items-center">
          <MaanasMascot size={220} expression="proud" />
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-orange-100 drop-shadow-sm">Ascension Complete!</h2>
            <p className="text-orange-200/40 mt-4 font-bold uppercase tracking-[0.2em] text-[10px] max-w-sm italic">Legendary focus! You meditated for {earnedXP / 10} minutes. Your mental temple grows stronger.</p>
          </div>
          <div className="bg-[#1a1614] px-10 py-5 rounded-[2.5rem] border border-[#3f332c] shadow-inner">
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-200/20 block mb-2 italic">Divine Harvest</span>
            <div className="flex items-center gap-3 text-orange-500 font-black text-3xl italic">
              <Sparkles size={28} />
              <span>+{earnedXP} XP</span>
            </div>
          </div>
          <button 
            onClick={resetTimer}
            className="w-full max-w-xs bg-orange-600 text-white px-12 py-5 rounded-[2.5rem] font-black uppercase italic tracking-widest text-[11px] shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition-all active:scale-95"
          >
            Continue Meditation
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto px-6 py-12">
      <div className="w-full bg-[#2a221f] rounded-[5rem] p-16 shadow-2xl border border-[#3f332c] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Clock size={150} className="text-orange-500" />
        </div>

        <div className="flex justify-center gap-6 mb-16 p-2.5 bg-[#1a1614] rounded-[3rem] w-fit mx-auto border border-[#3f332c] relative z-10 shadow-inner">
          <button 
            onClick={() => { setMode('study'); setDuration(25); }}
            className={`px-10 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${mode === 'study' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-orange-200/20 hover:text-orange-500'}`}
          >
            <Target size={18} />
            <span>Meditation</span>
          </button>
          <button 
            onClick={() => { setMode('break'); setDuration(5); }}
            className={`px-10 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${mode === 'break' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/20 shadow-xl' : 'text-orange-200/20 hover:text-amber-500'}`}
          >
            <Coffee size={18} />
            <span>Stillness</span>
          </button>
        </div>

        <div className="relative mb-16 flex flex-col items-center z-10">
          <MaanasMascot size={180} expression={isActive ? 'focused' : 'encouraging'} />
          <div className="text-[130px] font-black tracking-tighter leading-none text-orange-100 mt-10 mb-6 italic drop-shadow-2xl">
            {String(minutes).padStart(2, '0')}<span className="text-orange-600">:</span>{String(seconds).padStart(2, '0')}
          </div>
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.p 
                key={quoteIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-orange-500/60 font-black italic uppercase tracking-widest text-[10px] tabular-nums bg-orange-950/20 px-6 py-2 rounded-full border border-orange-500/10"
              >
                "{STUDY_QUOTES[quoteIdx]}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center gap-12 relative z-10">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-[2rem] bg-[#1a1614] border border-[#3f332c] flex items-center justify-center text-orange-200/20 hover:text-orange-500 hover:border-orange-500/30 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={28} />
          </button>
          <button 
            onClick={toggleTimer}
            className={`w-32 h-32 rounded-[3.5rem] flex items-center justify-center transition-all transform active:scale-90 shadow-2xl relative group ${
              isActive ? 'bg-[#1a1614] text-orange-500 border-2 border-orange-500/20' : 'bg-orange-600 text-white shadow-orange-600/30'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full rounded-[4rem]" />
            {isActive ? <Pause size={56} fill="currentColor" className="relative z-10" /> : <Play size={56} fill="currentColor" className="ml-2 relative z-10" />}
          </button>
          <div className="w-16 h-16" />
        </div>

        <div className="mt-20 grid grid-cols-3 gap-6 relative z-10">
          {[25, 40, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => setDuration(mins)}
              className={`py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-sm ${
                minutes === mins ? 'bg-orange-600/10 border-orange-500/30 text-orange-500' : 'bg-[#1a1614] border-[#3f332c] text-orange-200/20 hover:bg-[#201c1a] hover:text-orange-500 hover:border-orange-500/20'
              }`}
            >
              {mins}m Cycle
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
