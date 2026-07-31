import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Type, 
  Edit2, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Box, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  Search, 
  X, 
  Brain,
  LayoutGrid,
  LayoutList,
  RotateCcw
} from 'lucide-react';
import { FirstLetterAid } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MemoryLinker } from './MemoryLinker';

const WORD_BANK: Record<string, string[]> = {
  a: ['Amazing', 'Active', 'Alpha', 'Ancient'],
  b: ['Bright', 'Brave', 'Best', 'Big'],
  c: ['Clever', 'Cool', 'Calm', 'Creative'],
  d: ['Deep', 'Dear', 'Daily', 'Dynamic'],
  e: ['Easy', 'Energy', 'Elite', 'Eagle'],
  f: ['Fast', 'Fun', 'First', 'Focus'],
  g: ['Great', 'Gold', 'Grand', 'Grace'],
  h: ['Happy', 'High', 'Heart', 'Hero'],
  i: ['Ideal', 'Inner', 'Icon', 'Iron'],
  j: ['Joy', 'Just', 'Jump', 'Jade'],
  k: ['Key', 'Kind', 'King', 'Keep'],
  l: ['Light', 'Long', 'Live', 'Legend'],
  m: ['Magic', 'Main', 'Master', 'Mind'],
  n: ['New', 'Next', 'Noble', 'Night'],
  o: ['Open', 'Old', 'Only', 'Outer'],
  p: ['Power', 'Pure', 'Prime', 'Peace'],
  q: ['Quick', 'Queen', 'Quiet', 'Quest'],
  r: ['Real', 'Ready', 'Rise', 'Royal'],
  s: ['Super', 'Smart', 'Sharp', 'Strong'],
  t: ['Top', 'True', 'Today', 'Total'],
  u: ['Ultra', 'Universal', 'Up', 'Unit'],
  v: ['Vivid', 'Value', 'Vocal', 'Vision'],
  w: ['World', 'Wise', 'Win', 'Wild'],
  x: ['X-ray', 'Xenial', 'Xenial', 'Xenon'],
  y: ['Young', 'Yield', 'Yes', 'Yellow'],
  z: ['Zen', 'Zone', 'Zeal', 'Zero']
};

export default function FirstLetterMethod() {
  const { firstLetterEntries, setFirstLetterEntries, goBack, allSubjects } = useAppContext();

  const formRef = React.useRef<HTMLDivElement>(null);
  const listSectionRef = React.useRef<HTMLDivElement>(null);

  const [isAddingAid, setIsAddingAid] = useState(false);
  const [activeAidId, setActiveAidId] = useState<string | null>(null);
  const [editingAidId, setEditingAidId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [subject, setSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'line' | 'flip'>('grid');
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

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Practice State
  const [practiceMode, setPracticeMode] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activeAid = firstLetterEntries.find(a => a.id === activeAidId);

  React.useEffect(() => {
    if (practiceMode) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [practiceMode]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setItemsText('');
    setSubject('');
    setIsAddingAid(false);
    setEditingAidId(null);
  };

  const saveAid = () => {
    if (!title || !itemsText) return;
    const itemsList = itemsText.split('\n').map(i => i.trim()).filter(i => i);
    
    if (editingAidId) {
      setFirstLetterEntries(firstLetterEntries.map(a => 
        a.id === editingAidId ? { ...a, title, description, items: itemsList, subject: subject || undefined } : a
      ));
    } else {
      const newAid: FirstLetterAid = {
        id: Date.now().toString(),
        title,
        description,
        items: itemsList,
        mnemonic: '',
        subject: subject || undefined
      };
      setFirstLetterEntries([newAid, ...firstLetterEntries]);
    }
    resetForm();
  };

  const startEditing = (aid: FirstLetterAid) => {
    setEditingAidId(aid.id);
    setTitle(aid.title);
    setDescription(aid.description);
    setItemsText(aid.items.join('\n'));
    setSubject(aid.subject || '');
    setIsAddingAid(true);
    scrollToForm();
  };

  const deleteAid = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFirstLetterEntries(firstLetterEntries.filter(a => a.id !== id));
  };

  const startPractice = (aid: FirstLetterAid) => {
    setActiveAidId(aid.id);
    setPracticeMode(true);
    setUserAnswer('');
    setSubmitted(false);
  };

  if (practiceMode && activeAid) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] transition-all hover:text-orange-400"><ChevronLeft size={24} /></button>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase text-shadow-sm">First-Letter Practice</h1>
            <p className="text-orange-200/40 text-xs font-bold uppercase tracking-widest">{activeAid.title}</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 text-orange-400 rounded-xl font-black border border-orange-500/20">
            {activeAid.items.length}
          </div>
        </header>

        <div className="bg-[#2a221f] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[500px] flex flex-col items-center text-center">
          <div className="p-4 bg-orange-600/20 rounded-full text-orange-400 border border-orange-500/30">
            <Brain size={40} />
          </div>
          
          <div className="mt-8 space-y-6 w-full max-w-xl">
            {/* Topic & Initials */}
            <div className="space-y-3 bg-[#1a1614] p-6 rounded-3xl border border-[#3f332c]">
              <span className="text-[10px] uppercase font-black text-orange-500 tracking-widest block">Topic Name</span>
              <h2 className="text-2xl font-black text-orange-100 italic">{activeAid.title}</h2>
              
              <div className="pt-2">
                <span className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest block mb-2">Initials / First Letters to recall:</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {activeAid.items.map((item, i) => (
                    <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-black text-orange-400 text-lg sm:text-xl italic shadow-sm">
                      {item[0].toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer Box & Submission */}
            {!submitted ? (
              <div className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Your Recalled Answer:</label>
                  <textarea
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Write the full items corresponding to the initials above..."
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl p-4 text-xs font-bold text-orange-100 placeholder:text-orange-200/30 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <button 
                  disabled={!userAnswer.trim()}
                  onClick={() => setSubmitted(true)}
                  className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  Submit Answer & Reveal Items
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                {/* Submitted User Answer */}
                <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c] space-y-1">
                  <span className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest block">Your Answer:</span>
                  <p className="text-sm font-bold text-orange-100 whitespace-pre-wrap">{userAnswer}</p>
                </div>

                {/* Revealed Actual Items */}
                <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/30 space-y-3">
                  <span className="text-[10px] uppercase font-black text-orange-400 tracking-widest block">Actual Items to Compare:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeAid.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-[#1a1614] p-3 rounded-xl border border-[#3f332c]">
                        <span className="w-7 h-7 rounded-lg bg-orange-600/20 text-orange-400 font-black text-xs flex items-center justify-center italic">
                          {item[0].toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-orange-100">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => { setSubmitted(false); setUserAnswer(''); }}
                    className="flex-1 py-3.5 bg-[#1a1614] border border-[#3f332c] text-orange-200/60 rounded-xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => setPracticeMode(false)}
                    className="flex-1 py-3.5 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
                  >
                    Done Practice
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
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <button onClick={goBack} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all">
             <ChevronLeft size={24} />
           </button>
           <div>
            <h2 className="text-3xl font-black tracking-tight italic font-display bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase">{t.firstLetter}</h2>
            <p className="text-orange-200/40 text-xs font-bold uppercase tracking-widest">Learn First Letters</p>
           </div>
        </div>
        {!isAddingAid && (
          <button 
            onClick={() => { setIsAddingAid(true); scrollToForm(); }}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>New Mnemonic Aid</span>
          </button>
        )}
      </header>

      {/* Toolbar: Search Bar & View Modes */}
      {!isAddingAid && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#2a221f] p-3 rounded-2xl border border-[#3f332c]">
          <div className="relative w-full sm:max-w-md flex items-center">
            <Search size={18} className="ml-3 text-amber-700 dark:text-orange-400/60 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search first letter aids..."
              className="w-full bg-transparent border-none text-xs py-2 px-3 text-stone-900 dark:text-[#fef3c7] focus:outline-none font-medium placeholder:text-stone-500 dark:placeholder:text-orange-200/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mr-3 text-xs text-stone-500 dark:text-orange-200/40 hover:text-stone-900 dark:hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

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
      )}

      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-orange-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use First-Letter Method</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> An abbreviation trick that automatically takes the first letter of each items list and creates a memorable acronym sentence.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Click "New Mnemonic Aid".</span>
          <span className="block mt-1">2. Name your topic and list items separated by commas.</span>
          <span className="block mt-1">3. System auto-generates a silly acronym; click Play to rehearse and study.</span>
        </div>
      </div>

      <div ref={listSectionRef}>

      {isAddingAid ? (
        <div className="max-w-2xl mx-auto">
          <motion.div 
            ref={formRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-10 shadow-xl shadow-orange-900/10"
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-orange-600/10 text-orange-500 rounded-2xl flex items-center justify-center">
                <Type size={28} />
              </div>
              <h3 className="text-2xl font-black text-orange-100 uppercase tracking-tighter italic">Add New Trick</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Name / Topic</p>
                  <input 
                    autoFocus
                    type="text"
                    placeholder="e.g. Rainbow Colors / Solar System"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3.5 px-5 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Link Subject</p>
                  <input 
                    type="text"
                    list="fl-subjects-list"
                    placeholder="Select or type subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3.5 px-5 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                  <datalist id="fl-subjects-list">
                    {allSubjects.map(sub => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Items to remember (one per line)</p>
                <textarea 
                  placeholder="Mercury&#10;Venus&#10;Earth&#10;Mars..."
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  rows={4}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 resize-none text-xs"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest">Calculated Initials</p>
                </div>
                <div className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 sm:py-6 px-4 sm:px-6 flex flex-wrap items-center justify-center gap-2">
                  {itemsText.split('\n').map(i => i.trim()[0]).filter(Boolean).map((char, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 font-black text-lg sm:text-xl italic"
                    >
                      {char.toUpperCase()}
                    </motion.div>
                  ))}
                  {itemsText.length === 0 && (
                    <span className="text-orange-200/20 text-xs font-bold uppercase tracking-widest italic">Type items above to see initials</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={resetForm} 
                  className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button onClick={saveAid} className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-orange-600/20 active:scale-95">Save Aid</button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* View Modes Render */
        (() => {
          const filteredAids = firstLetterEntries.filter(aid => 
            !searchQuery.trim() || 
            aid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            aid.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (aid.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
          const activeFlipItem = filteredAids[flipIndex] || filteredAids[0];

          if (filteredAids.length === 0) {
            return (
              <div className="text-center py-16 sm:py-20 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-3xl sm:rounded-[3rem] p-4">
                <Type size={40} className="text-[#3f332c] mx-auto mb-3" />
                <p className="text-orange-200/40 font-bold text-xs uppercase tracking-widest">
                  {searchQuery ? `No aids found matching "${searchQuery}"` : 'No first-letter aids created yet.'}
                </p>
              </div>
            );
          }

          if (viewMode === 'flip') {
            return (
              <div className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-between min-h-[420px] shadow-2xl relative">
                <div className="w-full flex justify-between items-center text-xs font-bold text-orange-200/40 border-b border-[#3f332c] pb-4">
                  <span>First Letter Card ({flipIndex + 1} of {filteredAids.length})</span>
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
                      {isFlipped ? 'Back (Items to Remember)' : 'Front (Topic & Initials)'}
                    </span>

                    {!isFlipped ? (
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-orange-100 italic">{activeFlipItem.title}</h3>
                        <div className="flex justify-center gap-2 pt-2">
                          {activeFlipItem.items.map((item, i) => (
                            <span key={i} className="text-2xl font-black text-orange-400 italic">
                              {item[0].toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-w-md">
                        <span className="text-xs font-bold text-orange-400 block uppercase tracking-wider">Full Items Sequence:</span>
                        <div className="flex flex-wrap justify-center gap-2">
                          {activeFlipItem.items.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 bg-orange-600/20 text-orange-100 rounded-xl text-xs font-bold border border-orange-500/20">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] uppercase font-bold text-orange-400/60 group-hover:text-orange-400 transition-all mt-2">
                      Click card to {isFlipped ? 'see Front' : 'reveal Items'}
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
                    Practice Aid
                  </button>

                  <button
                    disabled={flipIndex >= filteredAids.length - 1}
                    onClick={() => { setFlipIndex(prev => Math.min(filteredAids.length - 1, prev + 1)); setIsFlipped(false); }}
                    className="p-3 bg-[#1a1614] border border-[#3f332c] text-orange-200/60 rounded-xl disabled:opacity-20 hover:text-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          }

          if (viewMode === 'line') {
            return (
              <div className="space-y-3">
                {filteredAids.map(aid => (
                  <div 
                    key={aid.id}
                    className="bg-[#2a221f] border border-[#3f332c] rounded-2xl p-4 hover:bg-[#2d2522] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-orange-100 italic truncate">{aid.title}</h4>
                        {aid.subject && (
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20">
                            {aid.subject}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-orange-400 italic truncate">
                        Initials: {aid.items.map(i => i[0].toUpperCase()).join(' ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => startPractice(aid)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700"
                      >
                        Practice
                      </button>
                      <button 
                        onClick={() => startEditing(aid)}
                        className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={(e) => deleteAid(aid.id, e)}
                        className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredAids.map((aid) => (
                <motion.div 
                  layout
                  key={aid.id}
                  className="bg-[#2a221f] border border-[#3f332c] rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-orange-900/10 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-600/10 text-orange-400 rounded-2xl flex items-center justify-center shrink-0">
                        <Type size={24} className="sm:w-7 sm:h-7" />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditing(aid)} 
                          className="p-2.5 sm:p-3 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => deleteAid(aid.id, e)} 
                          className="p-2.5 sm:p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-orange-100 tracking-tight italic mb-3 sm:mb-4 break-words">{aid.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                      {aid.items.map((item, i) => (
                        <span key={i} className="px-2.5 sm:px-3 py-1 bg-[#1a1614] rounded-lg text-[10px] font-black uppercase text-orange-200/60 border border-[#3f332c] break-words">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/10 mb-8 flex items-center justify-center gap-2">
                      {aid.items.map((item, i) => (
                        <span key={i} className="text-2xl font-black text-orange-400 italic">
                          {item[0].toUpperCase()}
                        </span>
                      ))}
                      {aid.items.length > 0 && <span className="ml-2 text-[10px] text-orange-200/20 font-black uppercase tracking-widest">({aid.items.length} initialism)</span>}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => startPractice(aid)}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/10"
                  >
                    <Play size={14} fill="currentColor" /> Practice
                  </button>

                  <MemoryLinker itemId={aid.id} itemType="first-letter" className="mt-3" />
                </motion.div>
              ))}
            </div>
          );
        })()
      )}
      </div>
    </div>
  );
}
