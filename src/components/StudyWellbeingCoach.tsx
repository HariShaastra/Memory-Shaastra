import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, HeartHandshake, ShieldAlert, Smile, Frown, Meh, Zap, Coffee, Clock, Brain, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { aiGetWellbeingAdvice } from '../utils/aiClient';
import { triggerCompletionCelebration } from '../utils/confetti';

export default function StudyWellbeingCoach() {
  const { goBack } = useAppContext();

  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [recallAccuracy, setRecallAccuracy] = useState(85);
  const [mood, setMood] = useState<'focused' | 'neutral' | 'tired' | 'stressed'>('focused');
  const [notes, setNotes] = useState('');

  const [advice, setAdvice] = useState<{ status: string; coachMessage: string; recommendation: string; disclaimer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsultCoach = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiGetWellbeingAdvice(sessionMinutes, recallAccuracy, mood, notes);
      setAdvice(res);
      triggerCompletionCelebration();
    } catch (err: any) {
      setError(err.message || 'Failed to consult Wellbeing Coach.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={goBack}
          className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <HeartHandshake size={12} />
          <span>Study Wellbeing Coach</span>
        </span>
      </div>

      {/* Main Header */}
      <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
            <HeartHandshake size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-amber-100 italic tracking-tight">
              AI Study Wellbeing Coach
            </h1>
            <p className="text-xs text-orange-200/60">
              Monitors cognitive fatigue, session duration, and recall accuracy to help you maintain healthy study habits and prevent burnout.
            </p>
          </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-amber-300 text-xs">
          <ShieldAlert size={20} className="shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important Notice:</strong> Memory Shaastra supports study wellbeing, not mental healthcare. The AI Study Wellbeing Coach provides evidence-based study pace recommendations and does not diagnose or treat medical or mental health conditions.
          </p>
        </div>
      </div>

      {/* Check-In Form */}
      <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-6 shadow-xl">
        <h2 className="text-base font-black text-amber-100 uppercase tracking-wide flex items-center gap-2">
          <Brain size={20} className="text-rose-400" />
          <span>Current Study Check-In</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-2">
              Today's Study Session Duration: {sessionMinutes} Mins
            </label>
            <input 
              type="range" 
              min={10} 
              max={240} 
              step={5}
              value={sessionMinutes}
              onChange={e => setSessionMinutes(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-2">
              Active Recall Accuracy Rate: {recallAccuracy}%
            </label>
            <input 
              type="range" 
              min={30} 
              max={100} 
              step={5}
              value={recallAccuracy}
              onChange={e => setRecallAccuracy(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Mood Selector */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-3">How are you feeling right now?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'focused', label: 'Energized & Focused', icon: Smile, color: 'emerald' },
              { id: 'neutral', label: 'Balanced', icon: Meh, color: 'sky' },
              { id: 'tired', label: 'Slightly Tired', icon: Coffee, color: 'amber' },
              { id: 'stressed', label: 'Overwhelmed', icon: Frown, color: 'rose' }
            ].map(m => {
              const Icon = m.icon;
              const isSel = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id as any)}
                  className={`p-4 rounded-2xl border text-center transition-all space-y-2 ${
                    isSel 
                      ? 'bg-rose-500 text-slate-950 border-rose-400 font-black shadow-lg' 
                      : 'bg-[#1a1614] border-[#3f332c] text-orange-200/70 hover:border-rose-500/40'
                  }`}
                >
                  <Icon size={22} className="mx-auto" />
                  <p className="text-[11px] uppercase tracking-wider font-bold">{m.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">
            {error}
          </div>
        )}

        <button
          onClick={handleConsultCoach}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-rose-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>{loading ? 'Consulting Wellbeing Coach...' : 'Get Personalized Wellbeing Advice'}</span>
        </button>
      </div>

      {/* Advice Result */}
      {advice && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#3f332c] pb-4">
            <span className="px-3.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
              Status: {advice.status}
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-amber-100 leading-relaxed font-semibold p-5 bg-[#1a1614] border border-[#3f332c] rounded-2xl">
              "{advice.coachMessage}"
            </p>

            <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Coffee size={18} />
                <span>Coach Recommendation</span>
              </h3>
              <p className="text-xs text-rose-100 font-bold leading-relaxed">{advice.recommendation}</p>
            </div>

            <p className="text-[10px] text-orange-200/40 italic">
              {advice.disclaimer}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
