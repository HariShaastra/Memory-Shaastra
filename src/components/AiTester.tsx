import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, FileText, CheckCircle2, Award, Upload, RefreshCw, AlertCircle, Loader2, BookOpen, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { aiGenerateTest, aiEvaluateTest } from '../utils/aiClient';
import { GeneratedQuestion, QuestionPaperSpec, TestEvaluation } from '../types';
import { triggerCompletionCelebration } from '../utils/confetti';

export default function AiTester() {
  const { goBack } = useAppContext();

  // Test Spec State
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'tough' | 'competitive'>('moderate');
  const [selectedTypes, setSelectedTypes] = useState<Array<'mcq' | 'fill-blank' | 'short' | 'long' | 'case' | 'true-false'>>(['mcq', 'short']);

  // Test Flow State
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [strictness, setStrictness] = useState<'easy' | 'moderate' | 'tough' | 'competitive'>('moderate');
  const [pdfText, setPdfText] = useState('');
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);

  // Status & Evaluation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<TestEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleType = (type: 'mcq' | 'fill-blank' | 'short' | 'long' | 'case' | 'true-false') => {
    setSelectedTypes(prev => 
      prev.includes(type) ? (prev.length > 1 ? prev.filter(t => t !== type) : prev) : [...prev, type]
    );
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setPdfText(content || file.name);
      setIsPdfUploaded(true);
    };
    reader.readAsText(file);
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
      setError(err.message || 'Failed to evaluate test paper.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={goBack}
          className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>AI Exam Generator & Evaluator</span>
        </span>
      </div>

      {/* Main Header */}
      <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
            <Award size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-amber-100 italic tracking-tight">
              AI Examination Tester
            </h1>
            <p className="text-xs text-orange-200/60">
              Customize question types & difficulty, attempt questions live or upload written answers, and get strict AI grading!
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: TEST CREATOR CONFIG */}
      {questions.length === 0 && (
        <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-6 shadow-xl">
          <h2 className="text-lg font-black text-amber-100 uppercase tracking-wide flex items-center gap-2">
            <BookOpen size={20} className="text-orange-500" />
            <span>Configure Your Practice Exam</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-2">Subject / Exam</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Physics, History, General Knowledge..."
                className="w-full bg-[#1a1614] border border-[#3f332c] text-sm text-orange-100 py-3.5 px-5 rounded-2xl focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-2">Topic / Chapter</label>
              <input 
                type="text" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Organic Chemistry, Indian Polity..."
                className="w-full bg-[#1a1614] border border-[#3f332c] text-sm text-orange-100 py-3.5 px-5 rounded-2xl focus:outline-none focus:border-orange-500 font-bold"
              />
            </div>
          </div>

          {/* Question Types Selection */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-3">Choose Question Types (Select Multiple)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'mcq', label: 'MCQs' },
                { id: 'fill-blank', label: 'Fill in the Blanks' },
                { id: 'short', label: 'Short Answers' },
                { id: 'long', label: 'Long Answers' },
                { id: 'case', label: 'Case Scenarios' },
                { id: 'true-false', label: 'True / False' }
              ].map(typeObj => {
                const isSelected = selectedTypes.includes(typeObj.id as any);
                return (
                  <button
                    key={typeObj.id}
                    onClick={() => toggleType(typeObj.id as any)}
                    className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/20' 
                        : 'bg-[#1a1614] border-[#3f332c] text-orange-200/60 hover:border-orange-500/40'
                    }`}
                  >
                    <span>{typeObj.label}</span>
                    {isSelected && <CheckCircle2 size={16} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Difficulty & Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-3">Difficulty Level</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'easy', label: 'Easy' },
                  { id: 'moderate', label: 'Moderate' },
                  { id: 'tough', label: 'Tough' },
                  { id: 'competitive', label: 'Competitive Exams' }
                ].map(diff => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id as any)}
                    className={`p-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${
                      difficulty === diff.id 
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                        : 'bg-[#1a1614] border-[#3f332c] text-orange-200/60'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-3">Question Count: {questionCount}</label>
              <input 
                type="range" 
                min={3} 
                max={15} 
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full accent-orange-500 mt-2"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerateTest}
            disabled={isGenerating}
            className="w-full py-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            <span>{isGenerating ? 'Building AI Question Paper...' : 'Generate Practice Exam'}</span>
          </button>
        </div>
      )}

      {/* STEP 2: ATTEMPT TEST & EVALUATE */}
      {questions.length > 0 && !evaluation && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c]">
            <div>
              <h2 className="text-xl font-black text-amber-100 uppercase tracking-wide">
                {subject || 'Practice Test'} - {topic}
              </h2>
              <p className="text-xs text-orange-200/60">
                Difficulty: <span className="text-orange-400 uppercase font-black">{difficulty}</span> | {questions.length} Questions
              </p>
            </div>
            <button
              onClick={() => setQuestions([])}
              className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Reset Exam
            </button>
          </div>

          {/* Strictness Selector & PDF Upload Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c]">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-2">Evaluation Strictness</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'easy', label: 'Easy Going' },
                  { id: 'moderate', label: 'Moderate' },
                  { id: 'tough', label: 'Tough' },
                  { id: 'competitive', label: 'Competitive Exams' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStrictness(s.id as any)}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                      strictness === s.id 
                        ? 'bg-orange-500 text-slate-950 border-orange-400' 
                        : 'bg-[#1a1614] border-[#3f332c] text-orange-200/60'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block mb-2">Option B: Upload PDF / Document Answer File</label>
              <label className="flex items-center justify-center gap-2 p-4 bg-[#1a1614] border border-dashed border-[#3f332c] hover:border-orange-500 rounded-2xl cursor-pointer text-xs text-orange-200/70 transition-all font-bold">
                <Upload size={18} className="text-orange-400" />
                <span>{isPdfUploaded ? 'Answer Document Loaded!' : 'Upload Answer PDF / Text File'}</span>
                <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 bg-[#2a221f] border border-[#3f332c] rounded-3xl space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
                    Q{idx + 1} • {q.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-orange-200/40 uppercase font-bold">
                    Difficulty: {q.difficulty}
                  </span>
                </div>

                <p className="text-sm font-bold text-amber-100 leading-relaxed">
                  {q.question}
                </p>

                {/* Multiple Choice Options if applicable */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          userAnswers[q.id] === opt 
                            ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold' 
                            : 'bg-[#1a1614] border-[#3f332c] text-orange-200/80 hover:border-orange-500/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Text Answer Input for Short/Long/Case/Fill-blank */}
                {(!q.options || q.options.length === 0) && (
                  <textarea
                    value={userAnswers[q.id] || ''}
                    onChange={e => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type your answer here..."
                    rows={q.type === 'long' || q.type === 'case' ? 4 : 2}
                    className="w-full bg-[#1a1614] border border-[#3f332c] text-xs text-orange-100 p-4 rounded-2xl focus:outline-none focus:border-orange-500 font-medium"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isEvaluating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{isEvaluating ? 'AI Evaluator Grading Test...' : 'Submit & Evaluate Test'}</span>
          </button>
        </div>
      )}

      {/* STEP 3: EVALUATION RESULTS */}
      {evaluation && (
        <div className="space-y-6">
          <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#3f332c] pb-6">
              <div>
                <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Evaluation Report
                </span>
                <h2 className="text-3xl font-black text-amber-100 tracking-tight mt-2">
                  Score: <span className="text-emerald-400">{evaluation.score}</span> / {evaluation.maxScore}
                </h2>
                <p className="text-xs text-orange-200/60 mt-1">
                  Grading Mode: <span className="text-orange-400 uppercase font-black">{evaluation.strictness}</span>
                </p>
              </div>

              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center min-w-[160px]">
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Percentage</p>
                <p className="text-4xl font-black text-emerald-300 mt-1">{evaluation.percentage}%</p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Key Strengths</span>
                </h3>
                <ul className="text-xs text-emerald-100/90 list-disc list-inside space-y-1">
                  {evaluation.strengths.map((st, i) => <li key={i}>{st}</li>)}
                </ul>
              </div>

              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
                <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>Improvement Areas</span>
                </h3>
                <ul className="text-xs text-rose-100/90 list-disc list-inside space-y-1">
                  {evaluation.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)}
                </ul>
              </div>
            </div>

            {/* Detailed Feedback per Question */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-black text-amber-100 uppercase tracking-wider">
                Detailed Question-by-Question Marking
              </h3>
              <div className="space-y-4">
                {evaluation.detailedFeedback.map((fb, idx) => (
                  <div key={idx} className="p-5 bg-[#1a1614] border border-[#3f332c] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-orange-400">Question #{fb.questionNum}</span>
                      <span className={`px-2.5 py-1 rounded-lg font-black ${
                        fb.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {fb.marksAwarded} / {fb.maxMarks} Marks
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-orange-200/80">
                      <p><strong>Your Answer:</strong> {fb.userAnswer || '(No answer provided)'}</p>
                      <p><strong>Expected Model Answer:</strong> {fb.expectedAnswer}</p>
                    </div>

                    <p className="text-xs text-amber-100/90 bg-[#2a221f] p-3 rounded-xl border border-[#3f332c] italic">
                      <strong>AI Evaluator Feedback:</strong> {fb.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setQuestions([]); setEvaluation(null); }}
              className="w-full py-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Create Another Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
