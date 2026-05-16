import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Link as LinkIcon, Edit2, Play, ChevronLeft, Sparkles, Layers, Box, ArrowRight, ArrowLeft } from 'lucide-react';
import { LinkChain } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';

export default function LinkingMethod() {
  const { linkChains, setLinkChains, goBack, addXP } = useAppContext();

  const [isAddingChain, setIsAddingChain] = useState(false);
  const [activeChainId, setActiveChainId] = useState<string | null>(null);
  const [newChainTitle, setNewChainTitle] = useState('');
  const [newItems, setNewItems] = useState('');
  const [newStory, setNewStory] = useState('');

  // Practice State
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const activeChain = linkChains.find(c => c.id === activeChainId);

  const addChain = () => {
    if (!newChainTitle || !newItems) return;
    const chain: LinkChain = {
      id: Date.now().toString(),
      title: newChainTitle,
      items: newItems.split(',').map(i => i.trim()).filter(i => i),
      story: newStory
    };
    setLinkChains([chain, ...linkChains]);
    resetForm();
    addXP(40);
  };

  const startEditing = (chain: LinkChain) => {
    setActiveChainId(chain.id);
    setNewChainTitle(chain.title);
    setNewItems(chain.items.join(', '));
    setNewStory(chain.story);
    setIsAddingChain(true);
  };

  const saveEdit = () => {
    if (!activeChainId || !newChainTitle || !newItems) return;
    setLinkChains(linkChains.map(c => 
      c.id === activeChainId ? { 
        ...c, 
        title: newChainTitle, 
        items: newItems.split(',').map(i => i.trim()).filter(i => i),
        story: newStory 
      } : c
    ));
    resetForm();
  };

  const resetForm = () => {
    setNewChainTitle('');
    setNewItems('');
    setNewStory('');
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
    setCurrentIdx(0);
    setUserGuess('');
    setFeedback(null);
  };

  const handleCheck = () => {
    if (!activeChain) return;
    const correctValue = activeChain.items[currentIdx].toLowerCase().trim();
    if (userGuess.toLowerCase().trim() === correctValue) {
      setFeedback('correct');
      addXP(20);
    } else {
      setFeedback('wrong');
    }
  };

  const nextStep = () => {
    if (!activeChain) return;
    if (currentIdx < activeChain.items.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setUserGuess('');
      setFeedback(null);
    } else {
      setPracticeMode(false);
      addXP(50);
    }
  };

  if (practiceMode && activeChain) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all"><ChevronLeft size={24} /></button>
            <div>
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase text-shadow-sm">Practice</h1>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-widest">{activeChain.title}</p>
            </div>
          </div>
          <div className="text-orange-200/40 font-black text-sm italic">
            {currentIdx + 1} / {activeChain.items.length}
          </div>
        </header>

        <div className="bg-[#2a221f] p-12 rounded-[4rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[550px] flex flex-col items-center justify-center text-center">
          <MaanasMascot size={180} expression={feedback === 'correct' ? 'proud' : feedback === 'wrong' ? 'focused' : 'encouraging'} />
          
          <div className="mt-12 space-y-8 w-full max-w-md">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-orange-500">Position {currentIdx + 1}</span>
              <h2 className="text-2xl font-black text-orange-100 italic tracking-tight uppercase">Recall the next link?</h2>
            </div>

            <div className="space-y-6">
               <input 
                autoFocus
                type="text"
                placeholder="Recall item..."
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !feedback && handleCheck()}
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-[2rem] py-8 px-8 text-3xl font-black text-center text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 transition-all italic tracking-tighter"
              />

              <AnimatePresence mode="wait">
                {feedback === 'correct' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <p className="text-emerald-400 font-black text-xl flex items-center justify-center gap-2 italic uppercase">
                      <Sparkles /> Correct!
                    </p>
                    <button 
                      onClick={nextStep}
                      className="w-full py-6 bg-emerald-500 text-white rounded-[2.2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      {currentIdx < activeChain.items.length - 1 ? 'Go to Next Link' : 'Seal the Chain'}
                    </button>
                  </motion.div>
                ) : feedback === 'wrong' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <p className="text-rose-400 font-bold italic">Oops! The correct link was: <span className="text-orange-100 text-2xl block mt-2">"{activeChain.items[currentIdx]}"</span></p>
                    <button 
                      onClick={nextStep}
                      className="w-full py-6 bg-white/5 text-orange-200/40 rounded-[2.2rem] font-black uppercase tracking-widest text-[10px] border border-[#3f332c]"
                    >
                      Next Link anyway
                    </button>
                  </motion.div>
                ) : (
                  <button 
                    disabled={!userGuess}
                    onClick={handleCheck}
                    className="w-full py-6 bg-orange-600 text-white rounded-[2.2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    Forge Link
                  </button>
                )}
              </AnimatePresence>
            </div>
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
            onClick={() => { resetForm(); setIsAddingChain(true); }}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>Connect New Ideas</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAddingChain ? (
          <div className="lg:col-span-3">
             <motion.div 
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
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-4">Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. European Capitals"
                      value={newChainTitle}
                      onChange={(e) => setNewChainTitle(e.target.value)}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-5 px-8 text-orange-100 font-black outline-none focus:ring-2 focus:ring-orange-500 transition-all italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-4">Items (use commas)</label>
                    <input 
                      type="text" 
                      placeholder="Paris, London, Berlin, Rome..."
                      value={newItems}
                      onChange={(e) => setNewItems(e.target.value)}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-5 px-8 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-200/40 ml-4">The Story</label>
                    <textarea 
                      placeholder="Mnemonic tip: Paris Eiffel Tower grew clock hands from London..."
                      value={newStory}
                      onChange={(e) => setNewStory(e.target.value)}
                      rows={4}
                      className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-5 px-8 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none italic"
                    />
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button onClick={resetForm} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#3f332c] hover:text-orange-200/40">
                      Cancel
                    </button>
                    <button 
                      onClick={activeChainId ? saveEdit : addChain} 
                      className="px-10 py-5 bg-orange-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
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
              <div className="bg-[#2a221f] p-10 rounded-[4rem] border border-[#3f332c] flex flex-col items-center text-center sticky top-24 shadow-2xl shadow-orange-900/5">
                <MaanasMascot size={150} expression="encouraging" />
                <div className="mt-8 space-y-4">
                  <h3 className="font-black text-orange-500 uppercase tracking-widest text-[10px]">Linking Tip</h3>
                  <p className="text-orange-100/70 font-bold italic text-lg leading-relaxed">"Connect items in a chain. Item A knocks over Item B, which falls onto Item C. The more action and color, the better!"</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 gap-6">
              {linkChains.length === 0 ? (
                <div className="text-center py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-[5rem] flex flex-col items-center col-span-2">
                  <Layers size={48} className="text-[#3f332c] mb-6" />
                  <p className="text-orange-200/20 font-black italic uppercase tracking-[0.3em] text-xs">No concept links found.</p>
                  <button onClick={() => setIsAddingChain(true)} className="mt-4 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline">Create your first chain</button>
                </div>
              ) : (
                linkChains.map((chain) => (
                  <motion.div 
                    layout
                    key={chain.id}
                    className="bg-[#2a221f] border border-[#3f332c] rounded-[3.5rem] p-10 hover:bg-[#2d2522] transition-all group shadow-sm flex flex-col gap-8 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.8rem] bg-[#1a1614] text-orange-500 flex items-center justify-center shrink-0 border border-[#3f332c] group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
                          <Layers size={32} />
                        </div>
                        <div>
                          <h3 className="font-black text-2xl text-orange-100 tracking-tighter italic mb-1 drop-shadow-sm uppercase">{chain.title}</h3>
                          <p className="text-orange-200/40 font-black uppercase text-[10px] tracking-[0.2em]">{chain.items.length} Secure Links</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => startEditing(chain)}
                          className="p-3.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => deleteChain(chain.id, e)}
                          className="p-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 relative z-10 px-2">
                      {chain.items.map((item, i) => (
                        <React.Fragment key={i}>
                          <span className="px-5 py-2.5 bg-[#1a1614] rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-200/50 border border-[#3f332c] shadow-inner">
                            {item}
                          </span>
                          {i < chain.items.length - 1 && (
                            <ArrowRight size={16} className="text-orange-500/20 mx-1" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-2 relative z-10">
                      <button 
                        onClick={() => startPractice(chain)}
                        className="w-full flex items-center justify-center gap-4 bg-orange-600 text-white px-10 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                      >
                        <Play size={20} fill="currentColor" />
                        <span>Practice</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
