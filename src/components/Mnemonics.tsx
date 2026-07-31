import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  PenTool, 
  Edit2, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  HelpCircle, 
  Search, 
  X,
  LayoutGrid,
  LayoutList,
  RotateCcw 
} from 'lucide-react';
import { Mnemonic } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MemoryLinker } from './MemoryLinker';

export default function Mnemonics() {
  const { mnemonics, setMnemonics, goBack, allSubjects } = useAppContext();

  const formRef = React.useRef<HTMLDivElement>(null);
  const listSectionRef = React.useRef<HTMLDivElement>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [newActualInfo, setNewActualInfo] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'line' | 'flip'>('grid');

  // Flip View state
  const [flipIndex, setFlipIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleViewChange = (mode: 'grid' | 'line' | 'flip') => {
    setViewMode(mode);
    setFlipIndex(0);
    setIsFlipped(false);
    setTimeout(() => {
      listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Practice Mode State
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentMnemonic, setCurrentMnemonic] = useState<Mnemonic | null>(null);
  const [userTestValue, setUserTestValue] = useState('');

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const addMnemonic = () => {
    if (!newTitle || !newPhrase) return;
    const item: Mnemonic = {
      id: Date.now().toString(),
      title: newTitle,
      phrase: newPhrase,
      actualInfo: newActualInfo || undefined,
      subject: newSubject || undefined,
      chapter: newChapter || undefined
    };
    setMnemonics([item, ...mnemonics]);
    resetForm();
  };

  const startEditing = (item: Mnemonic) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewPhrase(item.phrase);
    setNewActualInfo(item.actualInfo || '');
    setNewSubject(item.subject || '');
    setNewChapter(item.chapter || '');
    setIsAdding(true);
    scrollToForm();
  };

  const saveEdit = () => {
    if (!editingId || !newTitle || !newPhrase) return;
    setMnemonics(mnemonics.map(m => 
      m.id === editingId ? { 
        ...m, 
        title: newTitle, 
        phrase: newPhrase, 
        actualInfo: newActualInfo || undefined, 
        subject: newSubject || undefined,
        chapter: newChapter || undefined
      } : m
    ));
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewPhrase('');
    setNewActualInfo('');
    setNewSubject('');
    setNewChapter('');
    setIsAdding(false);
    setEditingId(null);
  };

  const deleteMnemonic = (id: string) => {
    setMnemonics(mnemonics.filter(m => m.id !== id));
  };

  const startPractice = (m: Mnemonic) => {
    setCurrentMnemonic(m);
    setPracticeMode(true);
    setFeedback(null);
    setUserTestValue('');
  };

  React.useEffect(() => {
    if (practiceMode) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [practiceMode]);

  const handleTest = () => {
    if (!currentMnemonic) return;
    setFeedback('correct');
  };

  const filteredMnemonics = mnemonics.filter(m => 
    searchQuery.trim() === '' || 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.actualInfo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFlipItem = filteredMnemonics[flipIndex] || filteredMnemonics[0];

  if (practiceMode && currentMnemonic) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-400 transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase">Practice Mode</h1>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-widest">{currentMnemonic.title}</p>
          </div>
        </header>

        <div className="bg-[#2a221f] p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-[#3f332c] min-h-[450px] flex flex-col items-center justify-center text-center relative space-y-6">
          <div className="p-4 bg-orange-600/20 rounded-full text-orange-400 border border-orange-500/30 mx-auto w-fit">
            <Brain size={40} />
          </div>

          <div className="space-y-2 max-w-lg bg-[#1a1614] p-6 rounded-3xl border border-[#3f332c] w-full">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 block">Question (Mnemonic Phrase)</span>
            <p className="text-2xl sm:text-3xl font-black text-orange-100 italic">"{currentMnemonic.phrase}"</p>
          </div>

          <div className="w-full max-w-md space-y-4">
            <label className="text-xs font-bold text-orange-300 block text-left">
              Type the Actual Information you want to recall:
            </label>
            <textarea 
              rows={3}
              value={userTestValue}
              onChange={(e) => setUserTestValue(e.target.value)}
              placeholder="Enter actual information..."
              className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl p-4 text-xs font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />

            {!feedback ? (
              <button 
                disabled={!userTestValue.trim()}
                onClick={handleTest}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl transition-all disabled:opacity-40"
              >
                Submit Answer & Reveal Details
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-left">
                {/* User Answer */}
                <div className="p-4 bg-[#1a1614] border border-[#3f332c] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-orange-200/40 tracking-wider block">Your Recalled Answer:</span>
                  <p className="text-xs font-bold text-orange-100 whitespace-pre-wrap">{userTestValue}</p>
                </div>

                {/* Actual Target Information */}
                <div className="p-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">Actual Information to Remember:</span>
                    <p className="text-base font-bold text-orange-100 leading-relaxed mt-0.5">
                      {currentMnemonic.actualInfo || currentMnemonic.title}
                    </p>
                  </div>

                  {/* Concept / Name of the trick & Link Subject below actual answer */}
                  <div className="pt-2 border-t border-orange-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-orange-200/40 tracking-wider block">Concept / Name:</span>
                      <p className="font-bold text-orange-200 italic">{currentMnemonic.title}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-orange-200/40 tracking-wider block">Link Subject:</span>
                      <p className="font-bold text-orange-200 italic">{currentMnemonic.subject || 'General'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => { setFeedback(null); setUserTestValue(''); }}
                    className="flex-1 py-3.5 bg-[#1a1614] border border-[#3f332c] text-orange-200/60 rounded-xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => setPracticeMode(false)}
                    className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-600/20 transition-all"
                  >
                    Finish Practice
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
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

      {/* Toolbar: Search Bar & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#2a221f] p-3 rounded-2xl border border-[#3f332c]">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md flex items-center">
          <Search size={18} className="ml-3 text-amber-700 dark:text-orange-400/60 shrink-0" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mnemonic tricks by name, phrase, or subject..."
            className="w-full bg-transparent border-none text-xs py-2 px-3 text-stone-900 dark:text-[#fef3c7] focus:outline-none font-medium placeholder:text-stone-500 dark:placeholder:text-orange-200/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mr-3 text-xs text-stone-500 dark:text-orange-200/40 hover:text-stone-900 dark:hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Mode Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#1a1614] p-1.5 rounded-xl border border-[#3f332c] w-full sm:w-auto justify-center">
          <button
            onClick={() => handleViewChange('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-stone-600 dark:text-orange-200/60 hover:text-stone-900 dark:hover:text-orange-100'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => handleViewChange('line')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'line' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-stone-600 dark:text-orange-200/60 hover:text-stone-900 dark:hover:text-orange-100'
            }`}
          >
            <LayoutList size={15} />
            <span>Line View</span>
          </button>
          <button
            onClick={() => handleViewChange('flip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'flip' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-stone-600 dark:text-orange-200/60 hover:text-stone-900 dark:hover:text-orange-100'
            }`}
          >
            <RotateCcw size={15} />
            <span>Flip View</span>
          </button>
        </div>
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

      <div ref={listSectionRef}>

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
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-4 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all italic text-xs"
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
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-4 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-xs"
                      />
                      <datalist id="mn-subjects-list">
                        {allSubjects.map(sub => (
                          <option key={sub} value={sub} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-amber-400 ml-2">Actual Information to Remember</label>
                    <textarea 
                      placeholder="e.g. Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune"
                      value={newActualInfo}
                      onChange={(e) => setNewActualInfo(e.target.value)}
                      rows={2}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-4 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-2">Mnemonic Phrase</label>
                    <textarea 
                      placeholder="e.g. My Very Educated Mother Just Served Us Noodles"
                      value={newPhrase}
                      onChange={(e) => setNewPhrase(e.target.value)}
                      rows={2}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-4 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none italic text-xs"
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

          {/* Render View Modes */}
          {filteredMnemonics.length === 0 ? (
            <div className="text-center py-16 sm:py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-3xl sm:rounded-[4rem] flex flex-col items-center p-4">
              <Brain size={48} className="text-[#3f332c] mb-4" />
              <p className="text-orange-200/20 font-black italic uppercase tracking-widest text-xs">
                {searchQuery ? `No mnemonics found for "${searchQuery}"` : 'Nothing here. Add a phrase!'}
              </p>
              <button onClick={() => setIsAdding(true)} className="mt-4 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline">Start Now</button>
            </div>
          ) : viewMode === 'flip' ? (
            /* FLIP VIEW */
            <div className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-between min-h-[420px] shadow-2xl relative">
              <div className="w-full flex justify-between items-center text-xs font-bold text-orange-200/40 border-b border-[#3f332c] pb-4">
                <span>Mnemonic Flashcard ({flipIndex + 1} of {filteredMnemonics.length})</span>
                {activeFlipItem?.subject && (
                  <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-[10px]">
                    {activeFlipItem.subject}
                  </span>
                )}
              </div>

              {activeFlipItem && (
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-lg bg-[#1a1614] border-2 border-[#3f332c] hover:border-orange-500/50 rounded-3xl p-8 cursor-pointer transition-all min-h-[220px] flex flex-col justify-center items-center gap-4 relative group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    {isFlipped ? 'Back (Actual Info & Details)' : 'Front (Mnemonic Phrase)'}
                  </span>

                  {!isFlipped ? (
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-orange-100 italic">"{activeFlipItem.phrase}"</h3>
                      <p className="text-xs text-orange-200/40 italic">Topic: {activeFlipItem.title}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-amber-200">
                        {activeFlipItem.actualInfo || activeFlipItem.title}
                      </p>
                      <div className="text-xs text-orange-200/50 pt-2 border-t border-[#3f332c]">
                        <p><strong className="text-orange-400">Concept:</strong> {activeFlipItem.title}</p>
                        {activeFlipItem.subject && <p><strong className="text-orange-400">Subject:</strong> {activeFlipItem.subject}</p>}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] uppercase font-bold text-orange-400/60 group-hover:text-orange-400 transition-all mt-2">
                    Click card to {isFlipped ? 'see Phrase' : 'flip answer'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 w-full justify-between pt-2">
                <button
                  disabled={flipIndex === 0}
                  onClick={() => { setFlipIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
                  className="p-3 bg-[#1a1614] border border-[#3f332c] text-orange-200/60 rounded-xl disabled:opacity-20 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>

                <button 
                  onClick={() => activeFlipItem && startPractice(activeFlipItem)}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-700 transition-all"
                >
                  Practice This Item
                </button>

                <button
                  disabled={flipIndex >= filteredMnemonics.length - 1}
                  onClick={() => { setFlipIndex(prev => Math.min(filteredMnemonics.length - 1, prev + 1)); setIsFlipped(false); }}
                  className="p-3 bg-[#1a1614] border border-[#3f332c] text-orange-200/60 rounded-xl disabled:opacity-20 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : viewMode === 'line' ? (
            /* LINE / LIST VIEW */
            <div className="space-y-3">
              {filteredMnemonics.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#2a221f] border border-[#3f332c] rounded-2xl p-4 hover:bg-[#2d2522] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-orange-100 italic truncate">{item.title}</h4>
                      {item.subject && (
                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20">
                          {item.subject}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-orange-400 italic">"{item.phrase}"</p>
                    {item.actualInfo && (
                      <p className="text-[11px] text-amber-200/80 font-medium truncate">Target: {item.actualInfo}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => startPractice(item)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700"
                    >
                      Practice
                    </button>
                    <button 
                      onClick={() => startEditing(item)}
                      className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteMnemonic(item.id)}
                      className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMnemonics.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  className="bg-[#2a221f] border border-[#3f332c] rounded-3xl p-6 hover:bg-[#2d2522] transition-all group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#1a1614] text-orange-500 flex items-center justify-center shrink-0 border border-[#3f332c]">
                        <PenTool size={18} />
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => startEditing(item)}
                          className="p-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteMnemonic(item.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-lg text-orange-100 tracking-tight italic truncate">{item.title}</h3>
                        {item.subject && (
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20 shrink-0">
                            {item.subject}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-orange-400 italic">"{item.phrase}"</p>
                      {item.actualInfo && (
                        <p className="text-xs text-amber-200/80 font-medium mt-1 line-clamp-2">
                          <span className="text-[10px] uppercase font-bold text-amber-400 mr-1">Target Info:</span>
                          {item.actualInfo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#3f332c] space-y-3">
                    <button 
                      onClick={() => startPractice(item)}
                      className="w-full py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/10"
                    >
                      <Play size={12} fill="currentColor" /> Practice
                    </button>
                    <MemoryLinker itemId={item.id} itemType="mnemonic" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
