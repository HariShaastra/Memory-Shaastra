import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, PenTool, Edit2, Play, ChevronLeft, Brain, HelpCircle, Search, X } from 'lucide-react';
import { Mnemonic } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MemoryLinker } from './MemoryLinker';

export default function Mnemonics() {
  const { mnemonics, setMnemonics, goBack, allSubjects } = useAppContext();

  const formRef = React.useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Practice Mode State
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentMnemonic, setCurrentMnemonic] = useState<Mnemonic | null>(null);
  const [step, setStep] = useState<'memorize' | 'test'>('memorize');
  const [userTestValue, setUserTestValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const addMnemonic = () => {
    if (!newTitle || !newPhrase) return;
    const item: Mnemonic = {
      id: Date.now().toString(),
      title: newTitle,
      phrase: newPhrase,
      subject: newSubject || undefined
    };
    setMnemonics([item, ...mnemonics]);
    resetForm();
  };

  const startEditing = (item: Mnemonic) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewPhrase(item.phrase);
    setNewSubject(item.subject || '');
    setIsAdding(true);
    scrollToForm();
  };

  const saveEdit = () => {
    if (!editingId || !newTitle || !newPhrase) return;
    setMnemonics(mnemonics.map(m => 
      m.id === editingId ? { ...m, title: newTitle, phrase: newPhrase, subject: newSubject || undefined } : m
    ));
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewPhrase('');
    setNewSubject('');
    setIsAdding(false);
    setEditingId(null);
  };

  const deleteMnemonic = (id: string) => {
    setMnemonics(mnemonics.filter(m => m.id !== id));
  };

  const startPractice = (m: Mnemonic) => {
    setCurrentMnemonic(m);
    setPracticeMode(true);
    setStep('memorize');
    setFeedback(null);
    setUserTestValue('');
  };

  const handleTest = () => {
    if (!currentMnemonic) return;
    const isCorrect = userTestValue.trim().toLowerCase() === currentMnemonic.phrase.trim().toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'wrong');
  };

  const filteredMnemonics = mnemonics.filter(m => 
    searchQuery.trim() === '' || 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.phrase.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (practiceMode && currentMnemonic) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase">Practice</h1>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-widest">{currentMnemonic.title}</p>
          </div>
        </header>

        <div className="bg-[#2a221f] p-12 rounded-[4rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[500px] flex flex-col items-center justify-center text-center relative">
          <AnimatePresence mode="wait">
            {step === 'memorize' ? (
              <motion.div key="memorize" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                <div className="p-5 bg-orange-600/20 rounded-full text-orange-400 border border-orange-500/30 mx-auto w-fit">
                  <Brain size={48} />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2 block">Read and Memorize</span>
                  <p className="text-4xl font-black text-orange-50 leading-tight italic tracking-tighter">"{currentMnemonic.phrase}"</p>
                </div>
                <button 
                  onClick={() => setStep('test')}
                  className="px-12 py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 active:scale-95"
                >
                  Test Myself
                </button>
              </motion.div>
            ) : (
              <motion.div key="test" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 w-full max-w-md">
                <div className="p-4 bg-orange-600/20 rounded-full text-orange-400 border border-orange-500/30 mx-auto w-fit">
                  <Brain size={40} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 block">Type the exact phrase</span>
                  <h3 className="text-xl font-bold text-orange-100">{currentMnemonic.title}</h3>
                </div>

                <input 
                  type="text"
                  value={userTestValue}
                  onChange={(e) => setUserTestValue(e.target.value)}
                  placeholder="Type mnemonic phrase..."
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-center text-lg font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500"
                />

                {feedback && (
                  <div className={`p-4 rounded-2xl font-bold text-sm ${feedback === 'correct' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {feedback === 'correct' ? '✨ Perfect Recall!' : `Incorrect. Right phrase: "${currentMnemonic.phrase}"`}
                  </div>
                )}

                {feedback ? (
                  <button 
                    onClick={() => setStep('memorize')}
                    className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl shadow-orange-600/20"
                  >
                    Try Again
                  </button>
                ) : (
                  <button 
                    onClick={handleTest}
                    className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl shadow-orange-600/20"
                  >
                    Check Answer
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <button onClick={goBack} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all">
             <ChevronLeft size={24} />
           </button>
           <div>
            <h2 className="text-3xl font-black tracking-tight italic font-display text-orange-100 uppercase">{t.mnemonics}</h2>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Words to Remember</p>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => { resetForm(); setIsAdding(true); scrollToForm(); }}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Add New Trick</span>
          </button>
        </div>
      </header>

      {/* Search Bar for Mnemonics */}
      <div className="relative w-full bg-[#2a221f] p-2 rounded-2xl border border-[#3f332c] flex items-center">
        <Search size={18} className="ml-4 text-orange-400/60 shrink-0" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search mnemonic tricks by name or phrase..."
          className="w-full bg-transparent border-none text-xs py-3 px-4 text-[#fef3c7] focus:outline-none font-medium placeholder:text-orange-200/30"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="mr-4 text-xs text-orange-200/40 hover:text-white">
            Clear
          </button>
        )}
      </div>

      {/* Layman Explanation */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-orange-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Memory Tricks (Mnemonics)</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A silly phrase association database that helps you link random lists or formulas to an unforgettable sequence of imagery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Memory Tip */}
        <div className="lg:col-span-1">
          <div className="bg-[#2a221f] p-10 rounded-[4rem] border border-[#3f332c] flex flex-col items-center text-center sticky top-24 shadow-2xl shadow-orange-900/5">
            <div className="p-4 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Brain size={36} />
            </div>
            <div className="mt-6 space-y-4">
              <h3 className="font-black text-orange-500 uppercase tracking-widest text-[10px]">Memory Tip</h3>
              <p className="text-orange-100/70 font-bold italic text-lg leading-relaxed">"Make phrases funny or weird. It helps you remember."</p>
            </div>
          </div>
        </div>

        {/* Right Column: List and Add Form */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {(isAdding || editingId) && (
              <motion.div 
                ref={formRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-10 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-500/20">
                    <PenTool size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-orange-100 uppercase tracking-tighter italic">
                    {editingId ? 'Edit' : 'Add'} Trick
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-2">Concept / Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Order of Planets"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all italic text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-2">Link Subject</label>
                      <input 
                        type="text"
                        list="mn-subjects-list"
                        placeholder="Select or type subject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-xs"
                      />
                      <datalist id="mn-subjects-list">
                        {allSubjects.map(sub => (
                          <option key={sub} value={sub} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-2">Mnemonic Phrase</label>
                    <textarea 
                      placeholder="e.g. My Very Educated Mother Just Served Us Noodles"
                      value={newPhrase}
                      onChange={(e) => setNewPhrase(e.target.value)}
                      rows={3}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none italic text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={resetForm} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#3f332c] hover:text-orange-200/40">
                      Cancel
                    </button>
                    <button 
                      onClick={editingId ? saveEdit : addMnemonic} 
                      className="px-8 py-3 bg-orange-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-6">
            {filteredMnemonics.length === 0 ? (
              <div className="text-center py-16 sm:py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-3xl sm:rounded-[4rem] flex flex-col items-center p-4">
                <Brain size={48} className="text-[#3f332c] mb-4" />
                <p className="text-orange-200/20 font-black italic uppercase tracking-widest text-xs">
                  {searchQuery ? `No mnemonics found for "${searchQuery}"` : 'Nothing here. Add a phrase!'}
                </p>
                <button onClick={() => setIsAdding(true)} className="mt-4 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline">Start Now</button>
              </div>
            ) : (
              filteredMnemonics.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  className="bg-[#2a221f] border border-[#3f332c] rounded-3xl sm:rounded-[3rem] p-4 sm:p-8 md:p-10 hover:bg-[#2d2522] transition-all group shadow-sm flex flex-col gap-4 sm:gap-6 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-8 relative z-10">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-6 flex-1 w-full relative z-10 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-[#1a1614] text-orange-500 flex items-center justify-center shrink-0 border border-[#3f332c] group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <PenTool size={22} className="sm:w-7 sm:h-7" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden break-words">
                        <h3 className="font-black text-base sm:text-2xl text-orange-100 tracking-tight italic mb-1 truncate">{item.title}</h3>
                        <p className="text-orange-400 font-black text-sm sm:text-xl italic drop-shadow-sm break-words whitespace-pre-wrap">"{item.phrase}"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0 relative z-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#3f332c]/50">
                      <button 
                        onClick={() => startPractice(item)}
                        className="flex items-center gap-2 bg-orange-600 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-[2rem] text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                      >
                        <Play size={14} className="sm:w-[18px] sm:h-[18px]" fill="currentColor" />
                        <span>Practice</span>
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditing(item)}
                          className="p-3 sm:p-4 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button 
                          onClick={() => deleteMnemonic(item.id)}
                          className="p-3 sm:p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <MemoryLinker itemId={item.id} itemType="mnemonic" className="relative z-10 border-t border-[#3f332c] pt-4" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
