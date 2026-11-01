import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, HeartHandshake, ShieldAlert, Smile, Frown, Meh, Zap, Coffee, Clock, Brain, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getWellbeingAdvice } from '../utils/studyEngine';
import { triggerCompletionCelebration } from '../utils/confetti';

export default function StudyWellbeingCoach() {
  const { goBack, theme } = useAppContext();
  const isLight = theme === 'light';

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
      const res = await getWellbeingAdvice(sessionMinutes, recallAccuracy, mood, notes);
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
          className={`flex items-center space-x-2 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer ${
            isLight ? 'text-orange-700 hover:text-orange-900' : 'text-orange-400 hover:text-orange-300'
          }`}
        >
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <HeartHandshake size={12} />
          <span>Study Wellbeing Coach</span>
        </span>
      </div>

      {/* Main Header */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-4 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shrink-0">
            <HeartHandshake size={28} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              Study Wellbeing Coach
            </h1>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isLight ? 'text-stone-600' : 'text-orange-200/60'
            }`}>
              <strong>Problem:</strong> Pushing through hours of study while exhausted triggers cognitive burnout and zero retention. <br className="hidden sm:inline" />
              <strong>Solution:</strong> Checks fatigue levels, study pace, and memory accuracy to provide evidence-based recovery and focus recommendations.
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs border ${
          isLight ? 'bg-amber-50 border-amber-300 text-stone-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <ShieldAlert size={20} className="shrink-0 text-amber-500 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Wellbeing Guidance:</strong> Memory Shaastra supports academic endurance and healthy pacing. The Wellbeing Coach helps prevent study burnout and recommends optimal break rhythms.
          </p>
        </div>
      </div>

      {/* Check-In Form */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-6 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <h2 className={`text-base font-black uppercase tracking-wide flex items-center gap-2 ${
          isLight ? 'text-stone-900' : 'text-amber-100'
        }`}>
          <Brain size={20} className="text-rose-500" />
          <span>Current Study Check-In</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${
              isLight ? 'text-stone-700' : 'text-orange-200/60'
            }`}>
              Today's Study Session Duration: <strong>{sessionMinutes} Mins</strong>
            </label>
            <input 
              type="range" 
              min={10} 
              max={240} 
              step={5}
              value={sessionMinutes}
              onChange={e => setSessionMinutes(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${
              isLight ? 'text-stone-700' : 'text-orange-200/60'
            }`}>
              Active Recall Accuracy Rate: <strong>{recallAccuracy}%</strong>
            </label>
            <input 
              type="range" 
              min={30} 
              max={100} 
              step={5}
              value={recallAccuracy}
              onChange={e => setRecallAccuracy(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Mood Selector */}
        <div>
          <label className={`text-[10px] font-black uppercase tracking-widest block mb-3 ${
            isLight ? 'text-stone-700' : 'text-orange-200/60'
          }`}>
            How are you feeling right now?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'focused', label: 'Energized & Focused', icon: Smile },
              { id: 'neutral', label: 'Balanced Pace', icon: Meh },
              { id: 'tired', label: 'Slightly Tired', icon: Coffee },
              { id: 'stressed', label: 'Overwhelmed', icon: Frown }
            ].map(m => {
              const Icon = m.icon;
              const isSel = mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id as any)}
                  className={`p-4 rounded-2xl border text-center transition-all space-y-2 cursor-pointer ${
                    isSel 
                      ? 'bg-rose-500 text-slate-950 border-rose-400 font-black shadow-md' 
                      : isLight
                      ? 'bg-orange-50/60 border-orange-200 text-stone-800 hover:border-orange-400'
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
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold">
            {error}
          </div>
        )}

        <button
          onClick={handleConsultCoach}
          disabled={loading}
          className="w-full py-4.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-rose-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>{loading ? 'Consulting Wellbeing Coach...' : 'Get Personalized Wellbeing Advice'}</span>
        </button>
      </div>

      {/* Advice Result */}
      {advice && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-6 shadow-xl transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-4 ${
            isLight ? 'border-orange-100' : 'border-[#3f332c]'
          }`}>
            <span className="px-3.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
              Status: {advice.status}
            </span>
          </div>

          <div className="space-y-4">
            <p className={`text-sm leading-relaxed font-semibold p-5 rounded-2xl border ${
              isLight ? 'bg-orange-50/60 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-amber-100'
            }`}>
              "{advice.coachMessage}"
            </p>

            <div className={`p-5 rounded-2xl space-y-2 border ${
              isLight ? 'bg-amber-50 border-amber-200 text-stone-900' : 'bg-rose-500/10 border-rose-500/20 text-rose-100'
            }`}>
              <h3 className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-2">
                <Coffee size={18} />
                <span>Coach Recommendation</span>
              </h3>
              <p className="text-xs font-bold leading-relaxed">{advice.recommendation}</p>
            </div>

            <p className={`text-[10px] italic ${isLight ? 'text-stone-400' : 'text-orange-200/40'}`}>
              {advice.disclaimer}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
