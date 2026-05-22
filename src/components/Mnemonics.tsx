import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, PenTool, Edit2, Play, ChevronLeft, Sparkles, Brain, HelpCircle } from 'lucide-react';
import { Mnemonic } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';
import { MemoryLinker } from './MemoryLinker';

export default function Mnemonics() {
  const { mnemonics, setMnemonics, goBack, addXP } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPhrase, setNewPhrase] = useState('');

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
      phrase: newPhrase
    };
    setMnemonics([item, ...mnemonics]);
    resetForm();
    addXP(20);
  };

  const startEditing = (item: Mnemonic) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewPhrase(item.phrase);
    setIsAdding(true);
  };

  const saveEdit = () => {
    if (!editingId || !newTitle || !newPhrase) return;
    setMnemonics(mnemonics.map(m => 
      m.id === editingId ? { ...m, title: newTitle, phrase: newPhrase } : m
    ));
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewPhrase('');
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
    if (isCorrect) addXP(30);
  };

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
                <MaanasMascot size={180} expression="encouraging" />
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2 block">Read and Memorize</span>
                  <p className="text-4xl font-black text-orange-50 leading-tight italic tracking-tighter">"{currentMnemonic.phrase}"</p>
                </div>
                <button 
                  onClick={() => setStep('test')}
                  className="px-12 py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 active:scale-95"
                >
                  I've got it!
                </button>
              </motion.div>
            ) : (
              <motion.div key="test" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-sm">
                <MaanasMascot size={180} expression={feedback === 'correct' ? 'proud' : feedback === 'wrong' ? 'sad' : 'focused'} />
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Recall the phrase</h3>
                  <textarea 
                    autoFocus
                    value={userTestValue}
                    onChange={(e) => setUserTestValue(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-[2.5rem] py-10 px-8 text-2xl font-black text-center text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none italic"
                    placeholder="Type it here..."
                  />
                </div>
                {feedback === 'correct' ? (
                  <div className="space-y-6">
                    <p className="text-emerald-400 font-black text-xl flex items-center justify-center gap-2 italic uppercase tracking-tighter">
                      <Sparkles /> Correct! +30 XP
                    </p>
                    <button 
                      onClick={() => setPracticeMode(false)}
                      className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl shadow-emerald-500/20"
                    >
                      Awesome!
                    </button>
                  </div>
                ) : feedback === 'wrong' ? (
                  <div className="space-y-6">
                    <p className="text-rose-400 font-bold italic tracking-tight">Not quite. Let's try again!</p>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => { setStep('memorize'); setFeedback(null); setUserTestValue(''); }}
                        className="flex-1 py-4 bg-white/5 text-orange-200/40 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                      >
                        See Phrase
                      </button>
                      <button 
                        onClick={() => { setFeedback(null); setUserTestValue(''); }}
                        className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
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
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
        >
          <Plus size={18} />
          <span>Add New Trick</span>
        </button>
      </header>

      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-orange-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Memory Tricks (Mnemonics)</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A silly phrase association database that helps you link random lists or formulas to an unforgettable sequence of imagery.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Click "Add New Trick".</span>
          <span className="block mt-1">2. Input your custom topic title and enter a weird, funny phrase to anchor memory.</span>
          <span className="block mt-1">3. Back in list, click Play to test typing out the phrase from memory!</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Mascot Tip */}
        <div className="lg:col-span-1">
          <div className="bg-[#2a221f] p-10 rounded-[4rem] border border-[#3f332c] flex flex-col items-center text-center sticky top-24 shadow-2xl shadow-orange-900/5">
            <MaanasMascot size={150} expression="encouraging" />
            <div className="mt-8 space-y-4">
              <h3 className="font-black text-orange-500 uppercase tracking-widest text-[10px]">Helper Tip</h3>
              <p className="text-orange-100/70 font-bold italic text-lg leading-relaxed">"Make phrases funny or weird. It helps you remember."</p>
            </div>
          </div>
        </div>

        {/* Right Column: List and Add Form */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {(isAdding || editingId) && (
              <motion.div 
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
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-2">Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Order of Planets"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-2">Mnemonic Phrase</label>
                    <textarea 
                      placeholder="e.g. My Very Educated Mother Just Served Us Noodles"
                      value={newPhrase}
                      onChange={(e) => setNewPhrase(e.target.value)}
                      rows={3}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none italic"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={resetForm} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#3f332c] hover:text-orange-200/40">
                      Cancel
                    </button>
                    <button 
                      onClick={editingId ? saveEdit : addMnemonic} 
                      className="px-10 py-4 bg-orange-600 text-white rounded-[1.8rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-6">
            {mnemonics.length === 0 ? (
              <div className="text-center py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-[4rem] flex flex-col items-center">
                <Brain size={48} className="text-[#3f332c] mb-4" />
                <p className="text-orange-200/20 font-black italic uppercase tracking-widest text-xs">Nothing here. Add a phrase!</p>
                <button onClick={() => setIsAdding(true)} className="mt-4 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline">Start Now</button>
              </div>
            ) : (
              mnemonics.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-10 hover:bg-[#2d2522] transition-all group shadow-sm flex flex-col gap-6 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-8 flex-1 w-full relative z-10">
                      <div className="w-16 h-16 rounded-3xl bg-[#1a1614] text-orange-500 flex items-center justify-center shrink-0 border border-[#3f332c] group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <PenTool size={28} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-2xl text-orange-100 tracking-tighter italic mb-1">{item.title}</h3>
                        <p className="text-orange-400 font-black text-xl italic drop-shadow-sm">"{item.phrase}"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0 relative z-10 w-full md:w-auto justify-end">
                      <button 
                        onClick={() => startPractice(item)}
                        className="flex items-center gap-3 bg-orange-600 text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                      >
                        <Play size={18} fill="currentColor" />
                        <span>Practice</span>
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditing(item)}
                          className="p-4 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteMnemonic(item.id)}
                          className="p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          <Trash2 size={18} />
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
