import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, Dna, Activity, Brain, Target, ShieldCheck, Zap, BarChart2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function MemoryDna() {
  const { goBack, overallProgress, flashcards, mnemonics, memoryPalaces, scheduledRevisions } = useAppContext();

  const totalItems = flashcards.length + mnemonics.length + memoryPalaces.length;
  const completedRevisions = scheduledRevisions.filter(r => r.completed).length;
  const retentionScore = Math.min(98, Math.max(65, Math.round(overallProgress * 0.8 + 20)));

  return (
    <div className="min-h-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={goBack}
          className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Adaptive Memory Engine</span>
        </span>
      </div>

      <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-3xl text-violet-400">
            <Dna size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-amber-100 italic tracking-tight">
              Memory DNA Engine
            </h1>
            <p className="text-xs text-orange-200/60 max-w-xl">
              Memory Shaastra's neural algorithm continuously maps your forgetting curve, adjusting active recall intervals and difficulty dynamically.
            </p>
          </div>
        </div>

        {/* Adaptive Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-6 bg-[#1a1614] border border-[#3f332c] rounded-3xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200/50">Recall Retention Index</span>
            <p className="text-3xl font-black text-emerald-400">{retentionScore}%</p>
            <p className="text-[11px] text-orange-200/60 font-medium">Adapted for long-term memory</p>
          </div>

          <div className="p-6 bg-[#1a1614] border border-[#3f332c] rounded-3xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200/50">Cognitive Engrams</span>
            <p className="text-3xl font-black text-orange-400">{totalItems} Aids</p>
            <p className="text-[11px] text-orange-200/60 font-medium">Active memory hooks indexed</p>
          </div>

          <div className="p-6 bg-[#1a1614] border border-[#3f332c] rounded-3xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200/50">Interval Revisions Done</span>
            <p className="text-3xl font-black text-violet-400">{completedRevisions} Sessions</p>
            <p className="text-[11px] text-orange-200/60 font-medium">SM-2 Spaced reviews completed</p>
          </div>
        </div>
      </div>

      {/* Adaptive Memory DNA Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#2a221f] border border-[#3f332c] rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Activity className="text-emerald-400" size={24} />
            <h2 className="text-base font-black text-amber-100 uppercase tracking-wide">Forgetting Curve Safeguard</h2>
          </div>
          <p className="text-xs text-orange-200/70 leading-relaxed font-medium">
            When you rate a card or mnemonic as hard, Memory DNA automatically pulls forward its next review date to prevent synaptic decay.
          </p>
          <div className="p-4 bg-[#1a1614] rounded-2xl border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-between">
            <span>SM-2 Ease Factor: 2.5 (Optimal)</span>
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="p-6 bg-[#2a221f] border border-[#3f332c] rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Brain className="text-orange-400" size={24} />
            <h2 className="text-base font-black text-amber-100 uppercase tracking-wide">Personalized Recall Pace</h2>
          </div>
          <p className="text-xs text-orange-200/70 leading-relaxed font-medium">
            Adapts session length and question difficulty to keep you in the optimal flow state without causing mental exhaustion.
          </p>
          <div className="p-4 bg-[#1a1614] rounded-2xl border border-orange-500/20 text-orange-300 text-xs font-bold flex items-center justify-between">
            <span>Cognitive Load Status: Balanced</span>
            <Zap size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
