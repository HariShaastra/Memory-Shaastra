import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Award, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  Send,
  Zap,
  Calendar,
  Layers,
  HelpCircle,
  Brain,
  ShieldCheck,
  Target
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { aiGenerateTest, aiEvaluateTest } from '../utils/aiClient';
import { GeneratedQuestion, QuestionPaperSpec, TestEvaluation } from '../types';
import { triggerCompletionCelebration } from '../utils/confetti';
import { extractUserActivityUnits, generateActivityBasedQuestions } from '../utils/activityTestGenerator';

export default function AiTester() {
  const { 
    goBack, 
    flashcards, 
    mnemonics, 
    studyTasks, 
    linkChains, 
    storyChains, 
    firstLetterEntries, 
    memoryPalaces,
    addScheduledRevision,
    theme
  } = useAppContext();

  const isLight = theme === 'light';

  // Extract all user activities from app
  const activityUnits = useMemo(() => {
    return extractUserActivityUnits({
      flashcards,
      mnemonics,
      studyTasks,
      linkChains,
      storyChains,
      firstLetterEntries,
      memoryPalaces
    });
  }, [flashcards, mnemonics, studyTasks, linkChains, storyChains, firstLetterEntries, memoryPalaces]);

  // Test Spec State
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(4);
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'tough' | 'competitive'>('easy');
  const [selectedTypes, setSelectedTypes] = useState<Array<'mcq' | 'fill-blank' | 'short' | 'long' | 'case' | 'true-false'>>(['mcq', 'fill-blank', 'true-false', 'short']);

  // Test Flow State
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [strictness, setStrictness] = useState<'easy' | 'moderate' | 'tough' | 'competitive'>('easy');
  const [pdfText, setPdfText] = useState('');
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [isActivityTest, setIsActivityTest] = useState(false);

  // Status & Evaluation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<TestEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  const toggleType = (type: 'mcq' | 'fill-blank' | 'short' | 'long' | 'case' | 'true-false') => {
    setSelectedTypes(prev => 
      prev.includes(type) ? (prev.length > 1 ? prev.filter(t => t !== type) : prev) : [...prev, type]
    );
  };

  // 1. AUTO-GENERATE TEST BASED ONLY ON USER'S APP ACTIVITY
  const handleAutoGenerateFromActivity = () => {
    setIsGenerating(true);
    setError(null);
    setEvaluation(null);
    setUserAnswers({});
    setScheduleNotice(null);
    setIsActivityTest(true);

    try {
      const generated = generateActivityBasedQuestions(activityUnits, questionCount);
      setSubject('Personal Learning Activity');
      setTopic('Recent Flashcards, Mnemonics & Study Topics');
      setQuestions(generated);
    } catch (err: any) {
      setError('Could not generate activity test. Please try adding more study tasks or flashcards first.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. AUTOMATICALLY SCHEDULE REVISION TEST ON CALENDAR / PLANNER
  const handleAutoScheduleTest = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Pick top active concept from activities or general revision
    const randomTopic = activityUnits.length > 0 
      ? activityUnits[Math.floor(Math.random() * activityUnits.length)].prompt 
      : 'Core Memory Concepts';

    addScheduledRevision({
      itemTitle: `AI Revision Test: ${randomTopic}`,
      dueDate: tomorrowStr,
      intervalDays: 1,
      itemType: 'study-task'
    });

    setScheduleNotice(`Automated AI revision test for "${randomTopic}" successfully scheduled for tomorrow (${tomorrowStr}) in your Study Schedule!`);
  };

  // 3. MANUAL / CUSTOM GENERATION
  const handleGenerateTest = async () => {
    if (!subject.trim() && !topic.trim()) {
      setError('Please enter a subject or topic for the test.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setEvaluation(null);
    setUserAnswers({});
    setPdfText('');
    setIsPdfUploaded(false);
    setIsActivityTest(false);
    setScheduleNotice(null);

    try {
      const spec: QuestionPaperSpec = {
        subject: subject || 'General Knowledge',
        topic: topic || 'Core Memory Concepts',
        difficulty,
        types: selectedTypes,
        questionCount
      };
      const generated = await aiGenerateTest(spec);
      setQuestions(generated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate question paper.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (questions.length === 0) return;
    setIsEvaluating(true);
    setError(null);

    try {
      const evalResult = await aiEvaluateTest(questions, userAnswers, strictness, pdfText);
      setEvaluation(evalResult);
      triggerCompletionCelebration();
    } catch (err: any) {
      // Graceful local evaluation if network drops
      let correctCount = 0;
      const feedback = questions.map((q, idx) => {
        const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
        const cAns = q.correctAnswer.toLowerCase();
        const isCorrect = uAns !== '' && (uAns === cAns || cAns.includes(uAns) || uAns.includes(cAns));
        if (isCorrect) correctCount++;
        return {
          questionNum: idx + 1,
          userAnswer: userAnswers[q.id] || '(Unanswered)',
          expectedAnswer: q.correctAnswer,
          isCorrect,
          marksAwarded: isCorrect ? 10 : 0,
          maxMarks: 10,
          feedback: isCorrect ? 'Accurate recall!' : q.explanation
        };
      });

      const percentage = Math.round((correctCount / questions.length) * 100);
      setEvaluation({
        score: correctCount * 10,
        maxScore: questions.length * 10,
        percentage,
        strictness,
        strengths: ['Active concept revision', 'Retention practice completed'],
        weaknesses: percentage < 100 ? ['Review missed activity flashcards'] : [],
        detailedFeedback: feedback
      });
      triggerCompletionCelebration();
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
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
        <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>AI Exam Tester</span>
        </span>
      </div>

      {/* Main Problem-Solution Banner */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-3 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
      }`}>
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 shrink-0">
            <Award size={28} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              AI Examination Tester
            </h1>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isLight ? 'text-stone-600' : 'text-orange-200/70'
            }`}>
              <strong>Problem:</strong> Students re-read notes passively and blank out during actual exams. <br className="hidden sm:inline" />
              <strong>Solution:</strong> Generate instant randomized active-recall tests from your study activity to diagnose weak spots before exam day!
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: TEST GENERATOR & SCHEDULER */}
      {questions.length === 0 && (
        <div className="space-y-6">
          {/* A. AUTOMATIC ACTIVITY-BASED TEST CARD (PRIMARY FEATURE) */}
          <div className={`p-6 sm:p-8 rounded-[2.5rem] border-2 space-y-5 shadow-xl relative overflow-hidden transition-colors ${
            isLight 
              ? 'bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/50 border-orange-400 text-stone-900 shadow-orange-500/10' 
              : 'bg-gradient-to-br from-[#2a221f] to-[#1e1715] border-orange-500/40 text-[#fef3c7] shadow-2xl'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Automated Activity Engine
                  </span>
                  <span className={`text-[10px] font-bold ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                    {activityUnits.length} Learning Items Found
                  </span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isLight ? 'text-stone-900' : 'text-[#fef3c7]'
                }`}>
                  Auto-Test from Your Activity
                </h2>
                <p className={`text-xs max-w-xl leading-relaxed ${
                  isLight ? 'text-stone-700' : 'text-orange-200/70'
                }`}>
                  Randomly generates a targeted revision test in all applicable formats (<strong>MCQ</strong>, <strong>Fill in the Blanks</strong>, <strong>True/False</strong>, <strong>Short Answer</strong>) strictly based on your saved flashcards, mnemonics, and study tasks. Just enough to reinforce what you learned without test anxiety.
                </p>
              </div>

              <div className="p-3 bg-orange-600/20 rounded-2xl border border-orange-500/30 text-orange-500 shrink-0 hidden sm:block">
                <Brain size={32} />
              </div>
            </div>

            {/* Schedule confirmation notice */}
            {scheduleNotice && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{scheduleNotice}</span>
              </div>
            )}

            {/* Action Buttons: Auto-Test Now & Auto-Schedule */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAutoGenerateFromActivity}
                disabled={isGenerating}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="fill-current" />}
                <span>Take Auto-Generated Test Now</span>
              </button>

              <button
                onClick={handleAutoScheduleTest}
                className={`py-4 px-6 font-black uppercase tracking-wider text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 border ${
                  isLight 
                    ? 'bg-white hover:bg-orange-100 text-stone-900 border-orange-300' 
                    : 'bg-[#1a1614] hover:bg-[#342a27] text-orange-200 border-[#3f332c]'
                }`}
              >
                <Calendar size={18} className="text-orange-500" />
                <span>Auto-Schedule Next Test</span>
              </button>
            </div>
          </div>

          {/* B. CUSTOM QUESTION PAPER BUILDER (THE BOX THAT HAD POOR THEME CONTRAST) */}
          <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl space-y-6 transition-colors ${
            isLight 
              ? 'bg-white border-2 border-orange-200/90 shadow-orange-500/5' 
              : 'bg-[#2a221f] border border-[#3f332c]'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-orange-100' : 'border-[#3f332c]'
            }`}>
              <h3 className={`text-base font-black uppercase tracking-wide flex items-center gap-2 ${
                isLight ? 'text-stone-900' : 'text-amber-100'
              }`}>
                <BookOpen size={18} className="text-orange-500" />
                <span>Custom Topic Test Builder</span>
              </h3>
              <span className={`text-[10px] uppercase font-bold ${
                isLight ? 'text-stone-500' : 'text-orange-200/40'
              }`}>
                Manual Customization
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${
                  isLight ? 'text-stone-700' : 'text-orange-200/60'
                }`}>
                  Subject / Exam
                </label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Physics, Law, Audit, Economics..."
                  className={`w-full text-xs py-3.5 px-4 rounded-xl focus:outline-none focus:border-orange-500 font-bold transition-all border ${
                    isLight 
                      ? 'bg-orange-50/70 border-orange-200 text-stone-900 placeholder:text-stone-400 focus:bg-white' 
                      : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
                  }`}
                />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${
                  isLight ? 'text-stone-700' : 'text-orange-200/60'
                }`}>
                  Topic / Chapter
                </label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Section 45, Thermodynamics, Indian Constitution..."
                  className={`w-full text-xs py-3.5 px-4 rounded-xl focus:outline-none focus:border-orange-500 font-bold transition-all border ${
                    isLight 
                      ? 'bg-orange-50/70 border-orange-200 text-stone-900 placeholder:text-stone-400 focus:bg-white' 
                      : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
                  }`}
                />
              </div>
            </div>

            {/* Applicable Question Formats */}
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${
                isLight ? 'text-stone-700' : 'text-orange-200/60'
              }`}>
                Applicable Question Formats
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'mcq', label: 'MCQs' },
                  { id: 'fill-blank', label: 'Fill Blanks' },
                  { id: 'true-false', label: 'True / False' },
                  { id: 'short', label: 'Short Answer' }
                ].map(typeObj => {
                  const isSelected = selectedTypes.includes(typeObj.id as any);
                  return (
                    <button
                      key={typeObj.id}
                      onClick={() => toggleType(typeObj.id as any)}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-black' 
                          : isLight
                          ? 'bg-orange-50/50 border-orange-200 text-stone-800 hover:border-orange-400'
                          : 'bg-[#1a1614] border-[#3f332c] text-orange-200/70 hover:border-orange-500/40'
                      }`}
                    >
                      <span>{typeObj.label}</span>
                      {isSelected && <CheckCircle2 size={15} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerateTest}
              disabled={isGenerating}
              className={`w-full py-4 font-black uppercase tracking-widest text-xs rounded-2xl transition-all border cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm ${
                isLight 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-500' 
                  : 'bg-[#1a1614] hover:bg-orange-600 hover:text-white text-orange-200 border-[#3f332c] hover:border-orange-500'
              }`}
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{isGenerating ? 'Building Question Paper...' : 'Generate Custom Exam Paper'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ATTEMPT TEST */}
      {questions.length > 0 && !evaluation && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-md' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {isActivityTest ? 'Activity-Based Revision' : 'Custom Exam'}
                </span>
                <span className={`text-[10px] font-bold uppercase ${
                  isLight ? 'text-stone-500' : 'text-orange-200/50'
                }`}>
                  {questions.length} Questions
                </span>
              </div>
              <h2 className={`text-xl font-black tracking-tight mt-1 ${
                isLight ? 'text-stone-900' : 'text-amber-100'
              }`}>
                {subject} • {topic}
              </h2>
            </div>
            <button
              onClick={() => { setQuestions([]); setIsActivityTest(false); }}
              className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Exit Test
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className={`p-6 border rounded-3xl space-y-4 shadow-md transition-colors ${
                isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
                    Q{idx + 1} • {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'fill-blank' ? 'Fill In Blank' : q.type === 'true-false' ? 'True / False' : 'Short Answer'}
                  </span>
                  <span className={`text-[10px] uppercase font-bold ${
                    isLight ? 'text-stone-400' : 'text-orange-200/40'
                  }`}>
                    Active Recall
                  </span>
                </div>

                <p className={`text-sm sm:text-base font-black leading-relaxed ${
                  isLight ? 'text-stone-900' : 'text-amber-100'
                }`}>
                  {q.question}
                </p>

                {/* Multiple Choice Options */}
                {q.type === 'mcq' && q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          userAnswers[q.id] === opt 
                            ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-black' 
                            : isLight
                            ? 'bg-orange-50/60 border-orange-200 text-stone-800 hover:border-orange-400'
                            : 'bg-[#1a1614] border-[#3f332c] text-orange-200/80 hover:border-orange-500/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* True / False Buttons */}
                {q.type === 'true-false' && (
                  <div className="flex items-center gap-3 pt-1">
                    {['True', 'False'].map(choice => (
                      <button
                        key={choice}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: choice }))}
                        className={`flex-1 py-3.5 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          userAnswers[q.id] === choice
                            ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md'
                            : isLight
                            ? 'bg-orange-50/60 border-orange-200 text-stone-800 hover:border-orange-400'
                            : 'bg-[#1a1614] border-[#3f332c] text-orange-200/80 hover:border-orange-500/40'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {/* Fill-in-the-Blank Input */}
                {q.type === 'fill-blank' && (
                  <input
                    type="text"
                    value={userAnswers[q.id] || ''}
                    onChange={e => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type the missing word or phrase..."
                    className={`w-full text-xs p-3.5 rounded-2xl focus:outline-none focus:border-orange-500 font-bold border transition-all ${
                      isLight 
                        ? 'bg-orange-50/70 border-orange-200 text-stone-900 placeholder:text-stone-400 focus:bg-white' 
                        : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
                    }`}
                  />
                )}

                {/* Short Answer Input */}
                {q.type === 'short' && (
                  <textarea
                    value={userAnswers[q.id] || ''}
                    onChange={e => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Briefly state your answer..."
                    rows={2}
                    className={`w-full text-xs p-3.5 rounded-2xl focus:outline-none focus:border-orange-500 font-medium border transition-all ${
                      isLight 
                        ? 'bg-orange-50/70 border-orange-200 text-stone-900 placeholder:text-stone-400 focus:bg-white' 
                        : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isEvaluating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{isEvaluating ? 'Evaluating Revision Answers...' : 'Submit & Check Answers'}</span>
          </button>
        </div>
      )}

      {/* STEP 3: EVALUATION RESULTS */}
      {evaluation && (
        <div className="space-y-6">
          <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-6 shadow-2xl transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 border-b pb-6 ${
              isLight ? 'border-orange-100' : 'border-[#3f332c]'
            }`}>
              <div>
                <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Revision Assessment
                </span>
                <h2 className={`text-3xl font-black tracking-tight mt-2 ${
                  isLight ? 'text-stone-900' : 'text-amber-100'
                }`}>
                  Score: <span className="text-emerald-500">{evaluation.score}</span> / {evaluation.maxScore}
                </h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-stone-600' : 'text-orange-200/60'}`}>
                  Active recall test complete. Your memory neural pathways have been refreshed!
                </p>
              </div>

              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center min-w-[150px]">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">Accuracy</p>
                <p className="text-4xl font-black text-emerald-500 dark:text-emerald-300 mt-1">{evaluation.percentage}%</p>
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-4 pt-2">
              <h3 className={`text-xs font-black uppercase tracking-wider ${
                isLight ? 'text-stone-900' : 'text-amber-100'
              }`}>
                Question Breakdown & Correct Answers
              </h3>
              <div className="space-y-3">
                {evaluation.detailedFeedback.map((fb, idx) => (
                  <div key={idx} className={`p-4 border rounded-2xl space-y-2 transition-colors ${
                    isLight ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-200/80'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-orange-600 dark:text-orange-400">Question #{fb.questionNum}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg font-black text-[11px] ${
                        fb.isCorrect ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        {fb.isCorrect ? 'Correct' : 'Needs Review'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p><strong>Your Answer:</strong> {fb.userAnswer || '(No answer provided)'}</p>
                      <p><strong>Expected Model Answer:</strong> {fb.expectedAnswer}</p>
                    </div>

                    <p className={`text-xs p-2.5 rounded-xl border italic ${
                      isLight ? 'bg-white border-orange-200 text-stone-800' : 'bg-[#2a221f] border-[#3f332c] text-amber-100/90'
                    }`}>
                      {fb.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => { setQuestions([]); setEvaluation(null); handleAutoGenerateFromActivity(); }}
                className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer text-center"
              >
                Take Another Quick Revision Test
              </button>
              <button
                onClick={() => { setQuestions([]); setEvaluation(null); }}
                className={`py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer text-center ${
                  isLight 
                    ? 'bg-white hover:bg-orange-50 text-stone-700 border-orange-200' 
                    : 'bg-[#1a1614] text-orange-200/70 hover:text-white border-[#3f332c]'
                }`}
              >
                Back to Test Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
