import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Link as LinkIcon, Edit2, Play, ChevronLeft, ChevronRight, Layers, Box, ArrowRight, ArrowLeft, HelpCircle, Search, X, Brain, LayoutGrid, LayoutList, RotateCcw } from 'lucide-react';
import { LinkChain } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';
import { MemoryLinker } from './MemoryLinker';

export default function LinkingMethod() {
  const { linkChains, setLinkChains, goBack, allSubjects } = useAppContext();

  const formRef = React.useRef<HTMLDivElement>(null);
  const listSectionRef = React.useRef<HTMLDivElement>(null);

  const [isAddingChain, setIsAddingChain] = useState(false);
  const [activeChainId, setActiveChainId] = useState<string | null>(null);
  const [newChainTitle, setNewChainTitle] = useState('');
  const [newItems, setNewItems] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // View mode states
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

  const activeChain = linkChains.find(c => c.id === activeChainId);

  React.useEffect(() => {
    if (practiceMode) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [practiceMode]);

  const addChain = () => {
    if (!newChainTitle || !newItems) return;
    const chain: LinkChain = {
      id: Date.now().toString(),
      title: newChainTitle,
      items: newItems.split(',').map(i => i.trim()).filter(i => i),
      story: newStory,
      subject: newSubject || undefined
    };
    setLinkChains([chain, ...linkChains]);
    resetForm();
  };

  const startEditing = (chain: LinkChain) => {
    setActiveChainId(chain.id);
    setNewChainTitle(chain.title);
    setNewItems(chain.items.join(', '));
    setNewStory(chain.story);
    setNewSubject(chain.subject || '');
    setIsAddingChain(true);
    scrollToForm();
  };

  const saveEdit = () => {
    if (!activeChainId || !newChainTitle || !newItems) return;
    setLinkChains(linkChains.map(c => 
      c.id === activeChainId ? { 
        ...c, 
        title: newChainTitle, 
        items: newItems.split(',').map(i => i.trim()).filter(i => i),
        story: newStory,
        subject: newSubject || undefined
      } : c
    ));
    resetForm();
  };

  const resetForm = () => {
    setNewChainTitle('');
    setNewItems('');
    setNewStory('');
    setNewSubject('');
    setIsAddingChain(false);
    setActiveChainId(null);
  };

  const deleteChain = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinkChains(linkChains.filter(c => c.id !== id));
    if (activeChainId === id) setActiveChainId(null);
  };

  const startPractice = (chain: LinkChain) => {
    setActiveChainId(chain.id);
    setPracticeMode(true);
    setUserAnswer('');
    setSubmitted(false);
  };

  if (practiceMode && activeChain) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-400 transition-all"><ChevronLeft size={24} /></button>
            <div>
              <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase text-shadow-sm">Link Method Practice</h1>
              <p className="text-orange-200/40 text-xs font-bold uppercase tracking-widest">{activeChain.title}</p>
            </div>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-orange-600/10 text-orange-500 border border-orange-500/20 rounded-xl font-black text-xs">
            {activeChain.items.length}
          </div>
        </header>

        <div className="bg-[#2a221f] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[500px] flex flex-col items-center text-center">
          <div className="p-4 bg-orange-600/20 rounded-full text-orange-400 border border-orange-500/30">
            <Brain size={40} />
          </div>
          
          <div className="mt-8 space-y-6 w-full max-w-xl">
            {/* Question Card: Title & Subject */}
            <div className="space-y-3 bg-[#1a1614] p-6 rounded-3xl border border-[#3f332c]">
              <span className="text-[10px] uppercase font-black text-orange-500 tracking-widest block">Question / Title</span>
              <h2 className="text-2xl font-black text-orange-100 italic">"{activeChain.title}"</h2>
              {activeChain.subject && (
                <div className="pt-1">
                  <span className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase rounded-lg border border-orange-500/20">
                    Subject: {activeChain.subject}
                  </span>
                </div>
              )}
              <p className="text-xs text-orange-200/50 font-medium pt-2">Recall and list all the linked items for this title/subject.</p>
            </div>

            {/* Answer Input & Submission */}
            {!submitted ? (
              <div className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Your Recalled Answer:</label>
                  <textarea
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter the items you remember linked together..."
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl p-4 text-xs font-bold text-orange-100 placeholder:text-orange-200/30 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <button 
                  disabled={!userAnswer.trim()}
                  onClick={() => setSubmitted(true)}
                  className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  Submit Answer & Reveal Link Trick
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                {/* Submitted User Answer */}
                <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c] space-y-1">
                  <span className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest block">Your Recalled Answer:</span>
                  <p className="text-sm font-bold text-orange-100 whitespace-pre-wrap">{userAnswer}</p>
                </div>

                {/* Actual Items */}
                <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c] space-y-2">
                  <span className="text-[10px] uppercase font-black text-orange-400 tracking-widest block">Actual Linked Items:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeChain.items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-600/20 text-orange-200 rounded-lg text-xs font-bold border border-orange-500/30">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connecting Story Memory Trick */}
                {activeChain.story && (
                  <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/30 space-y-2">
                    <span className="text-[10px] uppercase font-black text-orange-400 tracking-widest block">Connecting Story (Memory Trick):</span>
                    <p className="text-sm font-bold text-orange-100 italic leading-relaxed">"{activeChain.story}"</p>
                  </div>
                )}

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
            <h2 className="text-3xl font-black tracking-tight italic font-display text-orange-100 uppercase">{t.linking}</h2>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Link words together</p>
           </div>
        </div>
        {!isAddingChain && !practiceMode && (
          <button 
            onClick={() => { resetForm(); setIsAddingChain(true); scrollToForm(); }}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>Connect New Ideas</span>
          </button>
        )}
      </header>

      {/* Toolbar: Search Bar & View Modes */}
      {!isAddingChain && !practiceMode && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#2a221f] p-3 rounded-2xl border border-[#3f332c]">
          <div className="relative w-full sm:max-w-md flex items-center">
            <Search size={18} className="ml-3 text-amber-700 dark:text-orange-400/60 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search link chains & items..."
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
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Linking Method</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A association pattern builder where you create a sequential narrative chaining items together so remembering item A instantly triggers item B.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Click "Connect New Ideas".</span>
          <span className="block mt-1">2. Input a list name and type several items separated by commas.</span>
          <span className="block mt-1">3. Click play to test typing each chained item in exact sequential order!</span>
        </div>
      </div>

      <div ref={listSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAddingChain ? (
          <div className="lg:col-span-3">
             <motion.div 
                ref={formRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2a221f] border border-[#3f332c] rounded-[3.5rem] p-12 shadow-2xl max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-orange-600/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-500/20">
                    <Layers size={28} />
                  </div>
              <h3 className="text-3xl font-black text-orange-100 uppercase tracking-tighter italic">
                    {activeChainId ? 'Edit' : 'Add'} Trick
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-4">Title / Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. European Capitals"
                        value={newChainTitle}
                        onChange={(e) => setNewChainTitle(e.target.value)}
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all italic text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-4">Link Subject</label>
                      <input 
                        type="text"
                        list="lc-subjects-list"
                        placeholder="Select or type subject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-xs"
                      />
                      <datalist id="lc-subjects-list">
                        {allSubjects.map(sub => (
                          <option key={sub} value={sub} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-4">Items (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Paris, London, Berlin, Rome..."
                      value={newItems}
                      onChange={(e) => setNewItems(e.target.value)}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all italic text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-4">The Connecting Visual Story</label>
                    <textarea 
                      placeholder="Mnemonic tip: Paris Eiffel Tower grew clock hands from London..."
                      value={newStory}
                      onChange={(e) => setNewStory(e.target.value)}
                      rows={4}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none italic text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={resetForm} 
                      className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={activeChainId ? saveEdit : addChain} 
                      className="px-8 py-3 bg-orange-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
          </div>
        ) : (
          <>
            <div className="lg:col-span-1">
              <div className="bg-[#2a221f] p-6 sm:p-10 rounded-3xl sm:rounded-[4rem] border border-[#3f332c] flex flex-col items-center text-center sticky top-24 shadow-2xl shadow-orange-900/5">
                <MaanasMascot size={120} expression="encouraging" />
                <div className="mt-6 space-y-3">
                  <h3 className="font-black text-orange-500 uppercase tracking-widest text-[10px]">Linking Tip</h3>
                  <p className="text-orange-100/70 font-bold italic text-base sm:text-lg leading-relaxed">"Connect items in a chain. Item A knocks over Item B, which falls onto Item C. The more action and color, the better!"</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {(() => {
                const filteredChains = linkChains.filter(c => 
                  !searchQuery.trim() || 
                  c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  c.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (c.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
                );
                const activeFlipItem = filteredChains[flipIndex] || filteredChains[0];

                if (filteredChains.length === 0) {
                  return (
                    <div className="text-center py-16 sm:py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-3xl sm:rounded-[5rem] flex flex-col items-center p-4">
                      <Layers size={48} className="text-[#3f332c] mb-6" />
                      <p className="text-orange-200/20 font-black italic uppercase tracking-[0.3em] text-xs">
                        {searchQuery ? `No chains found for "${searchQuery}"` : 'No concept links found.'}
                      </p>
                      <button onClick={() => setIsAddingChain(true)} className="mt-4 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline">Create your first chain</button>
                    </div>
                  );
                }

                if (viewMode === 'flip') {
                  return (
                    <div className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-between min-h-[420px] shadow-2xl relative">
                      <div className="w-full flex justify-between items-center text-xs font-bold text-orange-200/40 border-b border-[#3f332c] pb-4">
                        <span>Linking Chain Card ({flipIndex + 1} of {filteredChains.length})</span>
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
                            {isFlipped ? 'Back (Connecting Visual Story)' : 'Front (Chain Title & Linked Items)'}
                          </span>

                          {!isFlipped ? (
                            <div className="space-y-4 w-full">
                              <h3 className="text-2xl font-black text-orange-100 italic">{activeFlipItem.title}</h3>
                              <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                                {activeFlipItem.items.map((item, i) => (
                                  <React.Fragment key={i}>
                                    <span className="px-3 py-1.5 bg-orange-600/20 text-orange-100 rounded-xl text-xs font-bold border border-orange-500/20">
                                      {item}
                                    </span>
                                    {i < activeFlipItem.items.length - 1 && (
                                      <ArrowRight size={14} className="text-orange-500/40 shrink-0" />
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 max-w-md">
                              <span className="text-xs font-bold text-orange-400 block uppercase tracking-wider">Connecting Story:</span>
                              <p className="text-sm font-bold text-orange-100 italic leading-relaxed">
                                "{activeFlipItem.story || 'No story details specified for this chain.'}"
                              </p>
                            </div>
                          )}

                          <span className="text-[10px] uppercase font-bold text-orange-400/60 group-hover:text-orange-400 transition-all mt-2">
                            Click card to {isFlipped ? 'see Front' : 'reveal Story'}
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
                          Practice Chain
                        </button>

                        <button
                          disabled={flipIndex >= filteredChains.length - 1}
                          onClick={() => { setFlipIndex(prev => Math.min(filteredChains.length - 1, prev + 1)); setIsFlipped(false); }}
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
                      {filteredChains.map(chain => (
                        <div 
                          key={chain.id}
                          className="bg-[#2a221f] border border-[#3f332c] rounded-2xl p-4 hover:bg-[#2d2522] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-orange-100 italic truncate">{chain.title}</h4>
                              {chain.subject && (
                                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20">
                                  {chain.subject}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-orange-400 italic truncate">
                              Chain ({chain.items.length} items): {chain.items.join(' → ')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => startPractice(chain)}
                              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700"
                            >
                              Practice
                            </button>
                            <button 
                              onClick={() => startEditing(chain)}
                              className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => deleteChain(chain.id, e)}
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
                  <div className="grid grid-cols-1 gap-6">
                    {filteredChains.map((chain) => (
                      <motion.div 
                        layout
                        key={chain.id}
                        className="bg-[#2a221f] border border-[#3f332c] rounded-3xl sm:rounded-[3.5rem] p-4 sm:p-8 md:p-10 hover:bg-[#2d2522] transition-all group shadow-sm flex flex-col gap-4 sm:gap-6 relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start gap-4 relative z-10">
                          <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.8rem] bg-[#1a1614] text-orange-500 flex items-center justify-center shrink-0 border border-[#3f332c] group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
                              <Layers size={24} className="sm:w-8 sm:h-8" />
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <h3 className="font-black text-lg sm:text-2xl text-orange-100 tracking-tight italic mb-1 drop-shadow-sm uppercase truncate">{chain.title}</h3>
                              <p className="text-orange-200/40 font-black uppercase text-[10px] tracking-[0.2em]">{chain.items.length} Secure Links</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => startEditing(chain)}
                              className="p-3 sm:p-3.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95"
                            >
                              <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                            <button 
                              onClick={(e) => deleteChain(chain.id, e)}
                              className="p-3 sm:p-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95"
                            >
                              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10 px-1">
                          {chain.items.map((item, i) => (
                            <React.Fragment key={i}>
                              <span className="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-[#1a1614] rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-200/50 border border-[#3f332c] shadow-inner break-words">
                                {item}
                              </span>
                              {i < chain.items.length - 1 && (
                                <ArrowRight size={14} className="text-orange-500/20 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <div className="flex gap-4 pt-1 relative z-10">
                          <button 
                            onClick={() => startPractice(chain)}
                            className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-6 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-[2.5rem] text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                          >
                            <Play size={16} className="sm:w-5 sm:h-5" fill="currentColor" />
                            <span>Practice</span>
                          </button>
                        </div>

                        <MemoryLinker itemId={chain.id} itemType="link-chain" className="relative z-10 pt-2" />
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
