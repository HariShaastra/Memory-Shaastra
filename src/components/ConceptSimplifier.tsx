import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, BookOpen, FileText, Upload, Check, Copy, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { aiSimplifyConcept } from '../utils/aiClient';
import { triggerCompletionCelebration } from '../utils/confetti';

export default function ConceptSimplifier() {
  const { goBack } = useAppContext();

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
          className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors font-bold text-xs uppercase tracking-wider"
        >
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>AI Concept Simplifier</span>
        </span>
      </div>

      <div className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-amber-100 italic tracking-tight">
              Concept Simplifier
            </h1>
            <p className="text-xs text-orange-200/60">
              Paste any complex, dense textbook passage or upload a PDF document. AI converts it into Simple, Exam, or Story format!
            </p>
          </div>
        </div>

        {/* Input Text Area & Upload */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50">
              Textbook Passage / Concept Text
            </label>
            <label className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-bold cursor-pointer">
              <Upload size={14} />
              <span>Upload File / PDF</span>
              <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="Paste difficult textbook paragraph, scientific theory, law clause, or complex notes here..."
            rows={6}
            className="w-full bg-[#1a1614] border border-[#3f332c] text-sm text-orange-100 p-5 rounded-2xl focus:outline-none focus:border-orange-500 font-medium"
          />
        </div>

        {/* Select Target Version */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-orange-200/50 block">
            Select Output Version Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'simple', label: 'Simple Version', desc: 'Plain English & relatable analogies for beginners' },
              { id: 'exam', label: 'Exam Version', desc: 'High-yield bullet notes with key formulas & terms' },
              { id: 'story', label: 'Story Version', desc: 'Engaging narrative story to memorize effortless' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setVersion(opt.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  version === opt.id 
                    ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/20' 
                    : 'bg-[#1a1614] border-[#3f332c] text-orange-200/70 hover:border-orange-500/40'
                }`}
              >
                <p className="font-black text-xs uppercase tracking-wider">{opt.label}</p>
                <p className={`text-[10px] mt-1 ${version === opt.id ? 'text-slate-900 font-medium' : 'text-orange-200/50'}`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSimplify}
          disabled={isLoading || !textInput.trim()}
          className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>{isLoading ? 'AI Simplifying Concept...' : `Generate ${version.toUpperCase()} Version`}</span>
        </button>
      </div>

      {/* Output Area */}
      {simplifiedText && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#2a221f] p-8 rounded-[2.5rem] border border-[#3f332c] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#3f332c] pb-4">
            <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
              Simplified Result ({version.toUpperCase()} Format)
            </span>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1614] hover:bg-[#3f332c] text-orange-300 rounded-xl text-xs font-bold transition-all"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>

          <div className="text-sm text-orange-100 leading-relaxed font-medium whitespace-pre-wrap p-4 bg-[#1a1614] border border-[#3f332c] rounded-2xl">
            {simplifiedText}
          </div>
        </motion.div>
      )}
    </div>
  );
}
