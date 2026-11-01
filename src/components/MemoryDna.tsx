import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Lightbulb, 
  Award, 
  Clock, 
  Play, 
  Layers, 
  BookOpen, 
  Brain,
  TrendingUp,
  Target,
  Check
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function MemoryDna() {
  const { 
    goBack, 
    flashcards, 
    mnemonics, 
    memoryPalaces, 
    linkChains, 
    storyChains, 
    firstLetterEntries, 
    studyTasks,
    scheduledRevisions,
    studySessionLogs,
    setView,
    startStudyNow,
    theme 
  } = useAppContext();

  const isLight = theme === 'light';

  // 1. WHAT THE USER HAS DONE
  const totalCards = flashcards.length;
  const totalMnemonics = mnemonics.length;
  const totalPalaces = memoryPalaces.length;
  const totalChains = linkChains.length + storyChains.length;
  const totalFirstLetter = firstLetterEntries.length;
  const totalAids = totalCards + totalMnemonics + totalPalaces + totalChains + totalFirstLetter;

  const totalStudyMinutes = useMemo(() => {
    return studySessionLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  }, [studySessionLogs]);

  const completedRevisionsCount = useMemo(() => {
    return scheduledRevisions.filter(r => r.completed).length;
  }, [scheduledRevisions]);

  // 2. WHAT THEY ARE STRONG IN
  const strongAreas = useMemo(() => {
    const strengths: string[] = [];
    const easyCards = flashcards.filter(c => c.difficulty === 'easy');
    if (easyCards.length > 0) {
      strengths.push(`${easyCards.length} flashcards consistently rated easy with high recall speed.`);
    }

    if (completedRevisionsCount > 0) {
      strengths.push(`${completedRevisionsCount} spaced repetition cycles completed on schedule.`);
    }

    if (totalPalaces > 0) {
      strengths.push(`Memory Palace loci established across ${totalPalaces} custom locations.`);
    }

    if (totalStudyMinutes >= 60) {
      strengths.push(`Over ${(totalStudyMinutes / 60).toFixed(1)} hours of active focus time logged.`);
    }

    if (strengths.length === 0) {
      strengths.push('Great foundation: You have begun setting up your core study workspace.');
    }

    return strengths;
  }, [flashcards, completedRevisionsCount, totalPalaces, totalStudyMinutes]);

  // 3. WHAT NEEDS WORK (WEAK AREAS / NEEDS REVIEW)
  const weakAreas = useMemo(() => {
    const needsWork: string[] = [];
    const hardCards = flashcards.filter(c => c.difficulty === 'hard');
    if (hardCards.length > 0) {
      needsWork.push(`${hardCards.length} flashcards marked challenging that would benefit from a quick 5-minute review.`);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueRevisions = scheduledRevisions.filter(r => !r.completed && r.dueDate < todayStr);
    if (overdueRevisions.length > 0) {
      needsWork.push(`${overdueRevisions.length} scheduled revision items are waiting for a refresher.`);
    }

    if (needsWork.length === 0) {
      needsWork.push('No critical weak areas detected! All your active review cards are in a healthy state.');
    }

    return needsWork;
  }, [flashcards, scheduledRevisions]);

  // 4. GROWTH OPPORTUNITIES
  const opportunities = useMemo(() => {
    const opps: string[] = [];

    if (totalChains === 0) {
      opps.push('Try the Story or Linking Method: Connect difficult lists into a quick narrative to memorize 3x faster.');
    }

    if (totalFirstLetter === 0) {
      opps.push('First-Letter Acronyms: Create initialism triggers for rapid recall of long bullet points in exams.');
    }

    if (studySessionLogs.length < 3) {
      opps.push('Use the 3-Second Study Bubble stopwatch to record your daily focus without watching the clock.');
    }

    if (opps.length === 0) {
      opps.push('Opportunity: Test yourself in the Self-Test Facility to verify retrieval strength before exams.');
    }

    return opps;
  }, [totalChains, totalFirstLetter, studySessionLogs]);

  // 5. NEXT CALL TO ACTION (PRACTICAL, GUILT-FREE)
  const nextAction = useMemo(() => {
    // If hard cards exist, suggest 10m review
    const hardCard = flashcards.find(c => c.difficulty === 'hard');
    if (hardCard) {
      return {
        topic: hardCard.subject ? `${hardCard.subject} — Difficult Cards` : 'Difficult Flashcards',
        method: 'Flashcard Recall',
        targetView: 'flashcards' as const,
        durationMinutes: 10,
        suggestion: `Quick 10-minute check on "${hardCard.question.slice(0, 40)}..." to lock it into permanent memory.`
      };
    }

    // If scheduled revision is due
    const todayStr = new Date().toISOString().split('T')[0];
    const dueRev = scheduledRevisions.find(r => !r.completed);
    if (dueRev) {
      return {
        topic: dueRev.itemTitle,
        method: 'Spaced Recall',
        targetView: 'rescue-queue' as const,
        durationMinutes: 15,
        suggestion: `15 minutes of spaced revision on "${dueRev.itemTitle}" to stay ahead of the forgetting curve.`
      };
    }

    // Default friendly action
    return {
      topic: 'Core Study Session',
      method: 'Study Bubble Sprint',
      targetView: 'study-bubble' as const,
      durationMinutes: 20,
      suggestion: 'A calm 20-minute focus sprint on your priority subject to build consistent daily momentum.'
    };
  }, [flashcards, scheduledRevisions]);

  const handleStartNextAction = () => {
    startStudyNow(nextAction.topic, nextAction.durationMinutes);
    setView(nextAction.targetView);
  };

  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={goBack}
          className={`flex items-center space-x-2 font-bold text-xs uppercase tracking-wider cursor-pointer ${
            isLight ? 'text-orange-700 hover:text-orange-900' : 'text-orange-400 hover:text-orange-300'
          }`}
        >
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Activity size={12} />
          <span>Personal Study Diagnosis</span>
        </span>
      </div>

      {/* Main Banner (Jargon-Free) */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-3 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-500 shrink-0">
            <Brain size={28} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              Memory DNA: Your Learning Summary
            </h1>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isLight ? 'text-stone-600' : 'text-orange-200/70'
            }`}>
              An honest, jargon-free overview of your study habit. See what you've accomplished, where your memory is sharp, what needs a quick refresh, and what your next best study step is.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. NEXT RECOMMENDED STEP (CALL TO ACTION - NO GUILT)                      */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border-2 space-y-4 shadow-xl ${
        isLight 
          ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-orange-400' 
          : 'bg-gradient-to-br from-[#2a221f] to-[#1e1715] border-orange-500/40 text-orange-100'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
              Recommended Next Step
            </span>
            <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
              Revise: {nextAction.topic}
            </h2>
            <p className={`text-xs max-w-xl font-medium leading-relaxed ${
              isLight ? 'text-stone-700' : 'text-orange-200/80'
            }`}>
              {nextAction.suggestion}
            </p>
          </div>

          <button
            onClick={handleStartNextAction}
            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Play size={15} className="fill-current" />
            <span>Start ({nextAction.durationMinutes} mins)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WHAT YOU HAVE DONE (METRICS)                                           */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl space-y-5 ${
        isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <h3 className={`text-base font-black uppercase tracking-wide flex items-center gap-2 ${
          isLight ? 'text-stone-900' : 'text-amber-100'
        }`}>
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>What You Have Done</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            isLight ? 'bg-orange-50/60 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{totalAids}</p>
            <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-stone-700' : 'text-orange-200/50'}`}>
              Memory Aids Created
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            isLight ? 'bg-orange-50/60 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-2xl font-black text-amber-500">{completedRevisionsCount}</p>
            <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-stone-700' : 'text-orange-200/50'}`}>
              Revisions Completed
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            isLight ? 'bg-orange-50/60 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-2xl font-black text-emerald-500">{studyTasks.filter(t => t.completed).length}</p>
            <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-stone-700' : 'text-orange-200/50'}`}>
              Study Tasks Done
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            isLight ? 'bg-orange-50/60 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-2xl font-black text-cyan-500">
              {totalStudyMinutes > 0 ? `${Math.round(totalStudyMinutes)}m` : 'Ready'}
            </p>
            <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-stone-700' : 'text-orange-200/50'}`}>
              Focus Time Logged
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STRENGTHS, WEAK AREAS & OPPORTUNITIES (3 CARDS)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strong Areas */}
        <div className={`p-6 rounded-3xl border space-y-4 shadow-md ${
          isLight ? 'bg-white border-emerald-200' : 'bg-[#2a221f] border-emerald-500/20'
        }`}>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Award size={20} />
            <h4 className="text-sm font-black uppercase tracking-wider">What You Are Strong In</h4>
          </div>
          <ul className="space-y-2.5 text-xs">
            {strongAreas.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className={isLight ? 'text-stone-800 font-medium' : 'text-orange-100/90'}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Needs Work */}
        <div className={`p-6 rounded-3xl border space-y-4 shadow-md ${
          isLight ? 'bg-white border-amber-200' : 'bg-[#2a221f] border-amber-500/20'
        }`}>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle size={20} />
            <h4 className="text-sm font-black uppercase tracking-wider">What Needs Work</h4>
          </div>
          <ul className="space-y-2.5 text-xs">
            {weakAreas.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                <span className={isLight ? 'text-stone-800 font-medium' : 'text-orange-100/90'}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className={`p-6 rounded-3xl border space-y-4 shadow-md ${
          isLight ? 'bg-white border-cyan-200' : 'bg-[#2a221f] border-cyan-500/20'
        }`}>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
            <Lightbulb size={20} />
            <h4 className="text-sm font-black uppercase tracking-wider">Your Opportunities</h4>
          </div>
          <ul className="space-y-2.5 text-xs">
            {opportunities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Sparkles size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                <span className={isLight ? 'text-stone-800 font-medium' : 'text-orange-100/90'}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
