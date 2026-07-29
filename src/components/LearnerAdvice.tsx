import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, CheckCircle2, ChevronLeft, Target, ShieldAlert, Zap, Compass, AlertTriangle, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { aiGenerateLearnerAdvice } from '../utils/aiClient';
import { LearnerAdvice } from '../types';

export default function LearnerAdviceView() {
  const { 
    user, 
    goBack, 
    flashcards, 
    mnemonics, 
    memoryPalaces, 
    linkChains, 
    storyChains, 
    firstLetterEntries, 
    scheduledRevisions, 
    studyTasks,
    personalization,
    overallProgress 
  } = useAppContext();

  const [advice, setAdvice] = useState<LearnerAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = {
        userName: user?.name || 'Learner',
        overallProgress,
        targetExam: personalization.targetExamName,
        flashcardCount: flashcards.length,
        mnemonicCount: mnemonics.length,
        palaceCount: memoryPalaces.length,
        linkChainCount: linkChains.length,
        storyChainCount: storyChains.length,
        firstLetterCount: firstLetterEntries.length,
        pendingRevisionsCount: scheduledRevisions.filter(r => !r.completed).length,
        completedRevisionsCount: scheduledRevisions.filter(r => r.completed).length,
        plannedTasksCount: studyTasks.length,
        sampleTopics: studyTasks.map(t => t.topic).slice(0, 5)
      };

      const result = await aiGenerateLearnerAdvice(userData);
      setAdvice(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI advice.');
    } finally {
      setLoading(false);
    }
  };

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
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Account Intelligence</span>
        </span>
      </div>

      <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-black text-amber-100 tracking-tight flex items-center gap-3">
              <Brain className="text-orange-500" size={32} />
              <span>AI Learner Advisory & SWOT</span>
            </h1>
            <p className="text-xs sm:text-sm text-orange-200/70">
              Personalized AI analysis based on your real account activity: current strengths, weaknesses, pending targets, and step-by-step strategy.
            </p>
          </div>

          <button
            onClick={handleGenerateAdvice}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            <span>{advice ? 'Re-Analyze Account Data' : 'Generate AI Advice'}</span>
          </button>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-amber-300 text-xs">
          <AlertTriangle size={20} className="shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> Memory Shaastra supports study wellbeing and cognitive learning. This advice is AI-generated for educational study planning based on your account's memory techniques and schedules, and does not constitute medical, psychological, or formal career healthcare advice.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Advice Display */}
      {advice ? (
        <div className="space-y-8">
          {/* Section 1: SWOT Analysis */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-amber-100 uppercase tracking-wide flex items-center gap-2">
              <Compass className="text-orange-500" size={22} />
              <span>1. How the Learner is Now (SWOT Analysis)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl space-y-3">
                <h3 className="font-black text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  <span>Strengths</span>
                </h3>
                <ul className="space-y-2 text-xs text-emerald-100/90 list-disc list-inside">
                  {advice.swot.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-3xl space-y-3">
                <h3 className="font-black text-rose-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={18} />
                  <span>Weaknesses</span>
                </h3>
                <ul className="space-y-2 text-xs text-rose-100/90 list-disc list-inside">
                  {advice.swot.weaknesses.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="p-6 bg-sky-500/10 border border-sky-500/30 rounded-3xl space-y-3">
                <h3 className="font-black text-sky-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Zap size={18} />
                  <span>Opportunities</span>
                </h3>
                <ul className="space-y-2 text-xs text-sky-100/90 list-disc list-inside">
                  {advice.swot.opportunities.map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-3xl space-y-3">
                <h3 className="font-black text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span>Threats & Risks</span>
                </h3>
                <ul className="space-y-2 text-xs text-amber-100/90 list-disc list-inside">
                  {advice.swot.threats.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: What Still Needs To Be Done */}
          <div className="p-6 bg-[#2a221f] border border-[#3f332c] rounded-3xl space-y-4">
            <h2 className="text-xl font-black text-amber-100 uppercase tracking-wide flex items-center gap-2">
              <Target className="text-orange-500" size={22} />
              <span>2. What Still Needs To Be Done</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advice.whatNeedsToBeDone.map((item, idx) => (
                <div key={idx} className="p-4 bg-[#1a1614] border border-[#3f332c] rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-orange-100 leading-relaxed font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: How Can The Learner Do It */}
          <div className="p-6 bg-[#2a221f] border border-[#3f332c] rounded-3xl space-y-4">
            <h2 className="text-xl font-black text-amber-100 uppercase tracking-wide flex items-center gap-2">
              <Brain className="text-orange-500" size={22} />
              <span>3. How Can The Learner Execute It</span>
            </h2>
            <div className="space-y-3">
              {advice.howToExecute.map((step, idx) => (
                <div key={idx} className="p-4 bg-[#1a1614] border border-orange-500/20 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-orange-500 text-slate-950 font-black text-xs rounded-xl shrink-0">
                    Step {idx + 1}
                  </div>
                  <p className="text-xs text-orange-200/90 leading-relaxed font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#2a221f] border border-[#3f332c] rounded-3xl space-y-4">
          <Brain size={48} className="mx-auto text-orange-500/40" />
          <h3 className="text-lg font-black text-orange-200">No Advisory Generated Yet</h3>
          <p className="text-xs text-orange-200/50 max-w-md mx-auto">
            Click "Generate AI Advice" above to parse your flashcard counts, memory palaces, mnemonics, and revision history into a custom SWOT analysis.
          </p>
        </div>
      )}
    </div>
  );
}
