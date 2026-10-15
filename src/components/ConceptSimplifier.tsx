import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, BookOpen, FileText, Upload, Check, Copy, Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { aiSimplifyConcept } from '../utils/aiClient';
import { triggerCompletionCelebration } from '../utils/confetti';

const SAMPLE_CONCEPTS = [
  {
    title: 'Law: Section 45 Capital Gains',
    text: 'Any profits or gains arising from the transfer of a capital asset effected in the previous year shall, save as otherwise provided in sections 54, 54B, 54D, 54EC, 54F, 54G, 54GA and 54GB, be chargeable to income-tax under the head "Capital gains", and shall be deemed to be the income of the previous year in which the transfer took place.'
  },
  {
    title: 'Biology: Cell Osmosis',
    text: 'Osmosis is the spontaneous net movement or diffusion of solvent molecules through a selectively-permeable membrane from a region of high water potential (lower solute concentration) to a region of low water potential (higher solute concentration), in the direction that tends to equalize the solute concentrations on the two sides.'
  },
  {
    title: 'Economics: Fractional Reserve Banking',
    text: 'Fractional-reserve banking is a system in which only a fraction of bank deposits are backed by actual cash on hand and available for withdrawal. This is done to expand the economy by freeing capital for lending, while the money multiplier effect expands total credit in circulation.'
  }
];

export default function ConceptSimplifier() {
  const { goBack, theme } = useAppContext();
  const isLight = theme === 'light';

  const [textInput, setTextInput] = useState('');
  const [version, setVersion] = useState<'simple' | 'exam' | 'story'>('simple');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setTextInput(content || '');
    };
    reader.readAsText(file);
  };

  const handleSimplify = async () => {
    if (!textInput.trim()) {
      setError('Please enter or paste a textbook paragraph or upload a file.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSimplifiedText('');

    try {
      const res = await aiSimplifyConcept(textInput, version);
      setSimplifiedText(res);
      triggerCompletionCelebration();
    } catch (err: any) {
      setError(err.message || 'Failed to simplify concept.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!simplifiedText) return;
    navigator.clipboard.writeText(simplifiedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Feynman Simplifier</span>
        </span>
      </div>

      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-6 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 shrink-0">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              Concept Simplifier
            </h1>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isLight ? 'text-stone-600' : 'text-orange-200/60'
            }`}>
              <strong>Problem:</strong> Complex textbook clauses and jargon feel impossible to memorize. <br className="hidden sm:inline" />
              <strong>Solution:</strong> Convert dense passages into Simple Analogies, High-Yield Exam Bullets, or Memorable Stories in 3 seconds!
            </p>
          </div>
        </div>

        {/* Quick Sample Chips */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
            <Lightbulb size={12} />
            <span>Try an Example Passage:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CONCEPTS.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => setTextInput(sc.text)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-orange-50 hover:bg-orange-100 text-stone-800 border-orange-200' 
                    : 'bg-[#1a1614] hover:bg-[#342722] text-orange-200/90 border-[#3f332c]'
                }`}
              >
                {sc.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area & Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-[10px] font-black uppercase tracking-widest ${
              isLight ? 'text-stone-700' : 'text-orange-200/80'
            }`}>
              Textbook Passage / Concept Text
            </label>
            <label className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-500 font-bold cursor-pointer">
              <Upload size={14} />
              <span>Upload File / PDF</span>
              <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="Paste difficult textbook paragraph, scientific theory, law clause, or complex notes here..."
            rows={5}
            className={`w-full text-sm p-4 rounded-2xl focus:outline-none focus:border-orange-500 font-medium border transition-all ${
              isLight 
                ? 'bg-orange-50/70 border-orange-200 text-stone-900 placeholder:text-stone-400 focus:bg-white' 
                : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
            }`}
          />
        </div>

        {/* Select Target Version */}
        <div className="space-y-3">
          <label className={`text-[10px] font-black uppercase tracking-widest block ${
            isLight ? 'text-stone-700' : 'text-orange-200/80'
          }`}>
            Select Output Version Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'simple', label: 'Simple Analogy', desc: 'Plain English & relatable analogies for beginners' },
              { id: 'exam', label: 'Exam Bullets', desc: 'High-yield bullet notes with key formulas & terms' },
              { id: 'story', label: 'Memory Story', desc: 'Vivid narrative linking characters to memorize effortlessly' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setVersion(opt.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  version === opt.id 
                    ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-black' 
                    : isLight
                    ? 'bg-orange-50/50 border-orange-200 text-stone-800 hover:border-orange-400'
                    : 'bg-[#1a1614] border-[#3f332c] text-orange-200/80 hover:border-orange-500/40'
                }`}
              >
                <p className="font-black text-xs uppercase tracking-wider">{opt.label}</p>
                <p className={`text-[10px] mt-1 ${
                  version === opt.id 
                    ? 'text-slate-950 font-bold' 
                    : isLight ? 'text-stone-600' : 'text-orange-200/60'
                }`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSimplify}
          disabled={isLoading || !textInput.trim()}
          className="w-full py-4.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>{isLoading ? 'AI Simplifying Concept...' : `Generate ${version.toUpperCase()} Version`}</span>
        </button>
      </div>

      {/* Output Area */}
      {simplifiedText && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-4 shadow-xl transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c]'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-4 ${
            isLight ? 'border-orange-100' : 'border-[#3f332c]'
          }`}>
            <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
              Simplified Result ({version.toUpperCase()} Format)
            </span>
            <button 
              onClick={copyToClipboard}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isLight 
                  ? 'bg-orange-50 hover:bg-orange-100 text-stone-900 border-orange-200' 
                  : 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-200 border-[#3f332c]'
              }`}
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>

          <div className={`text-sm leading-relaxed font-medium whitespace-pre-wrap p-5 rounded-2xl border ${
            isLight ? 'bg-orange-50/60 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
          }`}>
            {simplifiedText}
          </div>
        </motion.div>
      )}
    </div>
  );
}
