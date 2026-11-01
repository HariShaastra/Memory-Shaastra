import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Type, 
  Grid, 
  Link as LinkIcon, 
  BookMarked, 
  Check, 
  Award,
  ArrowRight,
  Filter,
  Brain
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UniversalAttachmentManager } from './UniversalAttachmentManager';
import { WellbeingCoachFooter } from './WellbeingCoachWidget';
import { FileAttachment } from '../types';

interface SelfTestQuestion {
  id: string;
  sourceType: 'flashcard' | 'mnemonic' | 'palace' | 'link' | 'story' | 'first-letter' | 'material';
  sourceTitle: string;
  subject: string;
  prompt: string;
  revealedAnswer: string;
  explanation?: string;
  attachments?: FileAttachment[];
}

export default function SelfTestFacility() {
  const { 
    goBack, 
    flashcards, 
    mnemonics, 
    memoryPalaces, 
    linkChains, 
    storyChains, 
    firstLetterEntries, 
    studyMaterials,
    rateRecall,
    updateStreak,
    addXp,
    theme 
  } = useAppContext();

  const isLight = theme === 'light';

  // Filters for Test Generation
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [testLimit, setTestLimit] = useState<number>(5);

  // Active Test State
  const [testQuestions, setTestQuestions] = useState<SelfTestQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [completedScores, setCompletedScores] = useState<Array<{ id: string; result: 'correct' | 'partial' | 'forgot' }>>([]);
  const [testFinished, setTestFinished] = useState<boolean>(false);

  // Available subjects from all student data
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    flashcards.forEach(c => c.subject && set.add(c.subject));
    mnemonics.forEach(m => m.subject && set.add(m.subject));
    memoryPalaces.forEach(p => p.subject && set.add(p.subject));
    firstLetterEntries.forEach(f => f.subject && set.add(f.subject));
    studyMaterials.forEach(sm => sm.subject && set.add(sm.subject));
    return Array.from(set);
  }, [flashcards, mnemonics, memoryPalaces, firstLetterEntries, studyMaterials]);

  // Aggregate questions strictly from user's created items in the app
  const allPoolQuestions: SelfTestQuestion[] = useMemo(() => {
    const list: SelfTestQuestion[] = [];

    // 1. Flashcards
    flashcards.forEach(f => {
      list.push({
        id: `fc_${f.id}`,
        sourceType: 'flashcard',
        sourceTitle: 'Flashcard',
        subject: f.subject || 'General',
        prompt: f.question,
        revealedAnswer: f.answer,
        explanation: f.chapter ? `Chapter: ${f.chapter}` : undefined,
        attachments: f.attachments
      });
    });

    // 2. Mnemonics
    mnemonics.forEach(m => {
      list.push({
        id: `mn_${m.id}`,
        sourceType: 'mnemonic',
        sourceTitle: m.title || 'Mnemonic Vault',
        subject: m.subject || 'General',
        prompt: `What does this mnemonic stand for/encode?\n"${m.phrase}"`,
        revealedAnswer: m.actualInfo || m.phrase,
        explanation: `Mnemonic Title: ${m.title}`,
        attachments: m.attachments
      });
    });

    // 3. First Letter Aids
    firstLetterEntries.forEach(fl => {
      list.push({
        id: `fl_${fl.id}`,
        sourceType: 'first-letter',
        sourceTitle: fl.title || 'First-Letter Aid',
        subject: fl.subject || 'General',
        prompt: `Recall the items encoded by the keyword / initialism:\n"${fl.mnemonic || fl.title}"`,
        revealedAnswer: fl.items && fl.items.length > 0 ? fl.items.join(', ') : fl.description || fl.mnemonic,
        explanation: fl.description ? `Description: ${fl.description}` : undefined,
        attachments: fl.attachments
      });
    });

    // 4. Memory Palaces
    memoryPalaces.forEach(p => {
      p.locations.forEach((loc, idx) => {
        list.push({
          id: `pal_${p.id}_${loc.id}`,
          sourceType: 'palace',
          sourceTitle: `${p.name} (Location ${idx + 1})`,
          subject: p.subject || 'Loci',
          prompt: `In Memory Palace "${p.name}", what concept is anchored at room/station: "${loc.name}"?`,
          revealedAnswer: loc.concept || 'Anchor point for memory visualization',
          explanation: `Palace: ${p.name} • Location #${idx + 1}`,
          attachments: loc.attachments
        });
      });
    });

    // 5. Linking & Story Chains
    linkChains.forEach(lc => {
      list.push({
        id: `lc_${lc.id}`,
        sourceType: 'link',
        sourceTitle: lc.title || 'Linking Chain',
        subject: lc.subject || 'General',
        prompt: `Recall the linked sequence for "${lc.title}":`,
        revealedAnswer: lc.items && lc.items.length > 0 ? lc.items.join(' ➔ ') : lc.story,
        explanation: lc.story ? `Linking Story: ${lc.story}` : undefined,
        attachments: lc.attachments
      });
    });

    storyChains.forEach(sc => {
      list.push({
        id: `sc_${sc.id}`,
        sourceType: 'story',
        sourceTitle: sc.title || 'Story Method',
        subject: sc.subject || 'General',
        prompt: `What key concepts are told in the story: "${sc.title}"?`,
        revealedAnswer: sc.story,
        explanation: sc.items ? `Items: ${sc.items.join(', ')}` : undefined,
        attachments: sc.attachments
      });
    });

    return list;
  }, [flashcards, mnemonics, firstLetterEntries, memoryPalaces, linkChains, storyChains]);

  // Start test with selected filters
  const startTest = () => {
    let pool = [...allPoolQuestions];

    if (selectedSubject !== 'all') {
      pool = pool.filter(q => q.subject.toLowerCase() === selectedSubject.toLowerCase());
    }

    if (selectedMethod !== 'all') {
      pool = pool.filter(q => q.sourceType === selectedMethod);
    }

    if (pool.length === 0) {
      alert('No questions found for the selected filter. Try selecting "All Subjects" or adding flashcards/mnemonics first!');
      return;
    }

    // Shuffle pool
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, testLimit);
    setTestQuestions(shuffled);
    setCurrentIdx(0);
    setStudentAnswer('');
    setIsAnswerRevealed(false);
    setCompletedScores([]);
    setTestFinished(false);
  };

  // Submit Answer & Reveal Model Answer
  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  // Grade result & move to next question
  const handleScoreQuestion = (result: 'correct' | 'partial' | 'forgot') => {
    const activeQ = testQuestions[currentIdx];
    const newScores = [...completedScores, { id: activeQ.id, result }];
    setCompletedScores(newScores);

    // SM-2 feedback hook if applicable
    if (activeQ.sourceType === 'flashcard') {
      const origId = activeQ.id.replace('fc_', '');
      const grade = result === 'correct' ? 4 : result === 'partial' ? 2 : 1;
      rateRecall(origId, 'flashcard', grade);
    }

    if (currentIdx < testQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setStudentAnswer('');
      setIsAnswerRevealed(false);
    } else {
      setTestFinished(true);
      if (updateStreak) updateStreak();
      if (addXp) addXp(testQuestions.length * 5);
    }
  };

  const currentQ = testQuestions[currentIdx];

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
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Award size={12} />
          <span>Self-Test Facility</span>
        </span>
      </div>

      {/* Main Banner */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-3 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 shrink-0">
            <Brain size={28} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              Self-Test Facility
            </h1>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isLight ? 'text-stone-600' : 'text-orange-200/70'
            }`}>
              Take a focused practice test drawn directly from your own flashcards, mnemonics, and memory aids. Write your answers and reveal the correct answers to test your active recall without external judgment.
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: CONFIGURE & LAUNCH TEST (When no test is active) */}
      {testQuestions.length === 0 && !testFinished && (
        <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
        }`}>
          <div className="border-b border-[#3f332c]/20 pb-3 flex items-center justify-between">
            <h2 className={`text-base font-black uppercase tracking-wide flex items-center gap-2 ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              <Filter size={18} className="text-orange-500" />
              <span>Choose Test Source & Length</span>
            </h2>
            <span className={`text-[10px] font-bold uppercase ${
              isLight ? 'text-stone-600' : 'text-orange-200/50'
            }`}>
              {allPoolQuestions.length} Questions Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Subject Selector */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-wider block mb-2 ${
                isLight ? 'text-stone-700' : 'text-orange-200/60'
              }`}>
                Filter by Subject
              </label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className={`w-full p-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                }`}
              >
                <option value="all">All Subjects ({allPoolQuestions.length})</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Method Selector */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-wider block mb-2 ${
                isLight ? 'text-stone-700' : 'text-orange-200/60'
              }`}>
                Filter by Memory Technique
              </label>
              <select
                value={selectedMethod}
                onChange={e => setSelectedMethod(e.target.value)}
                className={`w-full p-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                }`}
              >
                <option value="all">All Methods</option>
                <option value="flashcard">Flashcards</option>
                <option value="mnemonic">Mnemonics</option>
                <option value="first-letter">First-Letter Aids</option>
                <option value="palace">Memory Palace Loci</option>
                <option value="link">Linking Method</option>
                <option value="story">Story Method</option>
              </select>
            </div>

            {/* Test Length */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-wider block mb-2 ${
                isLight ? 'text-stone-700' : 'text-orange-200/60'
              }`}>
                Question Count
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 10, 15].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTestLimit(num)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      testLimit === num
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                        : isLight 
                          ? 'bg-orange-50 text-stone-700 border-orange-200 hover:bg-orange-100' 
                          : 'bg-[#1a1614] text-orange-200/70 border-[#3f332c] hover:bg-[#342a27]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startTest}
            disabled={allPoolQuestions.length === 0}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Sparkles size={16} />
            <span>Start Practice Test Now</span>
          </button>
        </div>
      )}

      {/* STEP 2: ACTIVE QUESTION SCREEN */}
      {testQuestions.length > 0 && !testFinished && currentQ && (
        <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-2xl space-y-6 ${
          isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
        }`}>
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-[#3f332c]/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-orange-600/20 text-orange-600 dark:text-orange-400 font-black text-[10px] uppercase tracking-wider rounded-lg border border-orange-500/30">
                {currentQ.sourceTitle}
              </span>
              <span className={`text-xs font-bold ${isLight ? 'text-stone-700' : 'text-orange-200/70'}`}>
                Subject: {currentQ.subject}
              </span>
            </div>
            <span className="font-mono text-xs font-black text-orange-500">
              Question {currentIdx + 1} of {testQuestions.length}
            </span>
          </div>

          {/* Question Prompt */}
          <div className={`p-6 rounded-2xl border space-y-2 ${
            isLight ? 'bg-amber-50/60 border-amber-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-amber-100'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 block">Prompt:</span>
            <p className="text-base sm:text-lg font-bold leading-relaxed whitespace-pre-wrap">
              {currentQ.prompt}
            </p>
          </div>

          {/* Optional Attachments Viewer for Question */}
          {currentQ.attachments && currentQ.attachments.length > 0 && (
            <UniversalAttachmentManager 
              attachments={currentQ.attachments} 
              onChange={() => {}} 
              readOnly={true} 
              title="Question Reference Media"
            />
          )}

          {/* Student Answer Textarea */}
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-wider block ${
              isLight ? 'text-stone-700' : 'text-orange-200/70'
            }`}>
              Your Answer / Mental Recall Notes:
            </label>
            <textarea
              value={studentAnswer}
              onChange={e => setStudentAnswer(e.target.value)}
              placeholder="Type your answer here from memory before revealing..."
              rows={4}
              disabled={isAnswerRevealed}
              className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-medium border transition-all focus:outline-none focus:border-orange-500 ${
                isLight 
                  ? 'bg-orange-50/50 border-orange-200 text-stone-900 placeholder:text-stone-400' 
                  : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
              }`}
            />
          </div>

          {/* Reveal Button (if not yet revealed) */}
          {!isAnswerRevealed ? (
            <button
              onClick={handleRevealAnswer}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye size={16} />
              <span>Submit Answer & Reveal Answer</span>
            </button>
          ) : (
            /* Revealed Answer & Self-Grading Section */
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-2"
            >
              <div className={`p-6 rounded-2xl border space-y-3 ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-stone-900' : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
              }`}>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-black uppercase tracking-wider">Correct Revealed Answer:</span>
                </div>
                <p className="text-sm sm:text-base font-bold whitespace-pre-wrap leading-relaxed">
                  {currentQ.revealedAnswer}
                </p>
                {currentQ.explanation && (
                  <p className="text-xs text-stone-600 dark:text-emerald-200/70 border-t border-emerald-500/20 pt-2 font-medium">
                    {currentQ.explanation}
                  </p>
                )}
              </div>

              {/* Self-Rating Choice */}
              <div className="space-y-3">
                <p className={`text-center text-xs font-black uppercase tracking-wider ${
                  isLight ? 'text-stone-800' : 'text-orange-200'
                }`}>
                  How did your answer compare?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleScoreQuestion('correct')}
                    className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Got It Right!</span>
                  </button>
                  <button
                    onClick={() => handleScoreQuestion('partial')}
                    className="p-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HelpCircle size={16} />
                    <span>Partially Correct</span>
                  </button>
                  <button
                    onClick={() => handleScoreQuestion('forgot')}
                    className="p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle size={16} />
                    <span>Needs Review</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* STEP 3: TEST FINISHED SUMMARY */}
      {testFinished && (
        <div className={`p-8 rounded-[2.5rem] border shadow-2xl space-y-6 text-center ${
          isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-orange-100'
        }`}>
          <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/20 text-orange-500 flex items-center justify-center text-3xl shadow-inner">
            🎉
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic tracking-tight">Test Practice Completed!</h2>
            <p className="text-xs text-stone-600 dark:text-orange-200/70">
              Your memory retrieval is logged and your spaced repetition strength is updated.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            }`}>
              <p className="text-2xl font-black">{completedScores.filter(s => s.result === 'correct').length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Correct</p>
            </div>
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}>
              <p className="text-2xl font-black">{completedScores.filter(s => s.result === 'partial').length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Partial</p>
            </div>
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}>
              <p className="text-2xl font-black">{completedScores.filter(s => s.result === 'forgot').length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">To Review</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => {
                setTestQuestions([]);
                setTestFinished(false);
              }}
              className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow cursor-pointer"
            >
              Take Another Test
            </button>
            <button
              onClick={goBack}
              className={`px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer ${
                isLight ? 'bg-white hover:bg-orange-50 text-stone-900 border-orange-300' : 'bg-[#1a1614] hover:bg-[#342a27] text-orange-200 border-[#3f332c]'
              }`}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Inline Wellbeing Coach Footer */}
      <div className="pt-6 border-t border-orange-500/10">
        <WellbeingCoachFooter />
      </div>
    </div>
  );
}
