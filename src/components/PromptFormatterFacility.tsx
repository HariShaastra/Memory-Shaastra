import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Lightbulb, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Bot, 
  BookOpen, 
  ArrowRight,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UniversalAttachmentManager } from './UniversalAttachmentManager';
import { WellbeingCoachFooter } from './WellbeingCoachWidget';
import { FileAttachment } from '../types';

export default function PromptFormatterFacility() {
  const { goBack, theme } = useAppContext();
  const isLight = theme === 'light';

  const [conceptInput, setConceptInput] = useState('');
  const [subject, setSubject] = useState('');
  const [formatStyle, setFormatStyle] = useState<'feynman' | 'bullets' | 'mnemonic' | 'socratic'>('feynman');
  const [copied, setCopied] = useState(false);
  const [lastLaunchedChatbot, setLastLaunchedChatbot] = useState<string | null>(null);
  const [promptAttachments, setPromptAttachments] = useState<FileAttachment[]>([]);

  // Generate structured prompt template
  const formattedPrompt = React.useMemo(() => {
    if (!conceptInput.trim()) return '';

    const subjectPrefix = subject.trim() ? `In the context of ${subject.trim()}:\n\n` : '';

    switch (formatStyle) {
      case 'feynman':
        return `${subjectPrefix}Please explain this concept using Richard Feynman's technique (as if explaining to a smart 12-year-old with no technical jargon):

Concept / Textbook Text:
"""
${conceptInput.trim()}
"""

Requirements:
1. Use an intuitive real-world analogy.
2. Break down the core mechanism into 3 simple steps.
3. Highlight common misconceptions to avoid on exams.`;

      case 'bullets':
        return `${subjectPrefix}Please extract high-yield, exam-focused revision bullet points from the following textbook passage:

Passage:
"""
${conceptInput.trim()}
"""

Requirements:
1. Crucial definitions, statutory terms, and formula variables.
2. 3 to 5 high-yield summary bullets suitable for quick exam revision cards.
3. Key distinctions or edge cases likely tested in competitive exams.`;

      case 'mnemonic':
        return `${subjectPrefix}Please design creative, unforgettable memory aids (acronyms, vivid peg rhymes, and visual associative images) for the following items or concept:

Content:
"""
${conceptInput.trim()}
"""

Requirements:
1. Provide a memorable first-letter acronym phrase.
2. Provide a vivid, bizarre, or humorous visual story linking the items sequentially.
3. Provide a 10-second mental checkpoint for rapid exam recall.`;

      case 'socratic':
        return `${subjectPrefix}Act as a rigorous Socratic tutor. Test my understanding of the following topic by posing 3 diagnostic questions of progressive difficulty:

Topic / Query:
"""
${conceptInput.trim()}
"""

Requirements:
1. Question 1: Fundamental concept check.
2. Question 2: Application / numerical scenario.
3. Question 3: Tricky exam-level edge case.
Wait for me to answer each before revealing the solution!`;

      default:
        return conceptInput.trim();
    }
  }, [conceptInput, subject, formatStyle]);

  const handleCopy = () => {
    if (!formattedPrompt) return;
    navigator.clipboard.writeText(formattedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Lightbulb size={12} />
          <span>Study Prompt & Notes Formatter</span>
        </span>
      </div>

      {/* Main Banner */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-3 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 shrink-0">
            <Lightbulb size={28} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              Study Prompt & Notes Formatter
            </h1>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isLight ? 'text-stone-600' : 'text-orange-200/70'
            }`}>
              Paste difficult textbook passages or study queries here. The app automatically structures them into pedagogical frameworks (Feynman analogies, high-yield exam bullets, mnemonic makers, and Socratic checks) with one-click clipboard copy.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl space-y-6 ${
        isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
              isLight ? 'text-stone-700' : 'text-orange-200/70'
            }`}>
              Subject / Topic (Optional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Constitutional Law, Organic Chemistry, Audit"
              className={`w-full p-3.5 rounded-xl text-xs font-bold border ${
                isLight ? 'bg-orange-50/50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
              }`}
            />
          </div>

          <div>
            <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
              isLight ? 'text-stone-700' : 'text-orange-200/70'
            }`}>
              Prompt Formatting Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'feynman', label: 'Feynman Analogy' },
                { id: 'bullets', label: 'Exam Bullets' },
                { id: 'mnemonic', label: 'Mnemonic Maker' },
                { id: 'socratic', label: 'Socratic Check' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormatStyle(opt.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    formatStyle === opt.id
                      ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                      : isLight 
                        ? 'bg-orange-50 text-stone-700 border-orange-200 hover:bg-orange-100' 
                        : 'bg-[#1a1614] text-orange-200/70 border-[#3f332c]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
            isLight ? 'text-stone-700' : 'text-orange-200/70'
          }`}>
            Your Concept, Textbook Text, or Query:
          </label>
          <textarea
            value={conceptInput}
            onChange={e => setConceptInput(e.target.value)}
            rows={5}
            placeholder="Paste your dense textbook paragraph, definition, law clause, or difficult math concept here..."
            className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-medium border transition-all focus:outline-none focus:border-orange-500 ${
              isLight 
                ? 'bg-orange-50/50 border-orange-200 text-stone-900 placeholder:text-stone-400' 
                : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
            }`}
          />
        </div>

        <UniversalAttachmentManager 
          attachments={promptAttachments} 
          onChange={setPromptAttachments} 
          title="Reference Textbook Snaps, PDF Sections & Audio Clips" 
        />

        {/* Output Prompt Preview */}
        {formattedPrompt && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                isLight ? 'text-stone-700' : 'text-orange-300'
              }`}>
                Formatted Pedagogical Study Note:
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Note'}</span>
              </button>
            </div>

            <div className={`p-4 rounded-2xl border font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto ${
              isLight ? 'bg-orange-50/80 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-200'
            }`}>
              {formattedPrompt}
            </div>

            {copied && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                <Check size={14} />
                <span>Study note copied to clipboard! Paste it into your revision notes, personal library, or flashcards.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Wellbeing Coach Footer */}
      <div className="pt-6 border-t border-orange-500/10">
        <WellbeingCoachFooter />
      </div>
    </div>
  );
}
