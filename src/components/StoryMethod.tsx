import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, BookOpen, Edit2, Play, ChevronLeft, Sparkles, Box, ArrowRight, ArrowLeft } from 'lucide-react';
import { LinkChain } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';

export default function StoryMethod() {
  const { storyChains, setStoryChains, goBack, addXP } = useAppContext();

  const [isAddingStory, setIsAddingStory] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newItems, setNewItems] = useState('');
  const [newStoryText, setNewStoryText] = useState('');

  // Practice State
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [userRecall, setUserRecall] = useState('');

  const activeStory = storyChains.find(s => s.id === activeStoryId);

  const resetForm = () => {
    setNewStoryTitle('');
    setNewItems('');
    setNewStoryText('');
    setIsAddingStory(false);
    setActiveStoryId(null);
  };

  const addStory = () => {
    if (!newStoryTitle || !newItems) return;
    const story: LinkChain = {
      id: Date.now().toString(),
      title: newStoryTitle,
      items: newItems.split(',').map(i => i.trim()).filter(i => i),
      story: newStoryText
    };
    setStoryChains([story, ...storyChains]);
    resetForm();
    addXP(50);
  };

  const startPractice = (story: LinkChain) => {
    setActiveStoryId(story.id);
    setPracticeMode(true);
    setCurrentIdx(0);
    setUserRecall('');
    setFeedback(null);
  };

  const checkRecall = () => {
    if (!activeStory) return;
    if (userRecall.toLowerCase().trim() === activeStory.items[currentIdx].toLowerCase().trim()) {
      setFeedback('correct');
      addXP(20);
    } else {
      setFeedback('wrong');
    }
  };

  const nextStep = () => {
    if (!activeStory) return;
    if (currentIdx < activeStory.items.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setUserRecall('');
      setFeedback(null);
    } else {
      setPracticeMode(false);
      addXP(100);
    }
  };

  if (practiceMode && activeStory) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
         <header className="flex items-center justify-between">
          <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] transition-all hover:text-orange-500"><ChevronLeft size={24} /></button>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase text-shadow-sm">Practice</h1>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-widest">{activeStory.title}</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-orange-600/10 text-orange-500 border border-orange-500/20 rounded-xl font-black text-xs">
            {currentIdx + 1}/{activeStory.items.length}
          </div>
        </header>

        <div className="bg-[#2a221f] p-12 rounded-[4rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[650px] flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
          
          <div className="w-full flex flex-col items-center">
             <MaanasMascot size={180} expression={feedback === 'correct' ? 'proud' : feedback === 'wrong' ? 'focused' : 'encouraging'} />
             
             <div className="mt-12 space-y-8 w-full max-w-lg">
                <div className="bg-[#1a1614] p-8 rounded-[2.5rem] border border-[#3f332c] mb-8 relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4 absolute -top-3 left-8 bg-[#2a221f] px-3 border border-[#3f332c] rounded-full">The Story Context</p>
                  <p className="text-lg font-bold text-orange-100/70 leading-relaxed italic line-clamp-4">"{activeStory.story}"</p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-orange-100 tracking-tight italic uppercase drop-shadow-sm">What was the next mental anchor?</h2>
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Recall linked item..."
                    value={userRecall}
                    onChange={(e) => setUserRecall(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !feedback && checkRecall()}
                    className="w-full bg-[#1a1614] border-2 border-[#3f332c] rounded-[2rem] py-8 px-8 text-center text-4xl font-black text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 transition-all italic tracking-tighter"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {feedback === 'correct' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      <div className="py-5 px-10 bg-emerald-500 text-white rounded-[2.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 text-xs shadow-xl shadow-emerald-500/20 shadow-orange-900/20">
                        <Sparkles size={20} /> Brilliant Recall!
                      </div>
                      <button onClick={nextStep} className="text-orange-400 font-black uppercase text-[10px] tracking-[0.3em] hover:text-orange-300 transition-all">
                        Advance to Next Memory
                      </button>
                    </motion.div>
                  ) : feedback === 'wrong' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      <div className="py-6 px-10 bg-[#1a1614] text-orange-200/40 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] border border-[#3f332c]">
                        The correct anchor was: <span className="text-orange-400 text-2xl block mt-2 italic capitalize tracking-tighter">"{activeStory.items[currentIdx]}"</span>
                      </div>
                      <button onClick={nextStep} className="text-orange-400/50 font-black uppercase text-[10px] tracking-[0.3em] hover:text-orange-400 transition-all">
                        Continue the Journey
                      </button>
                    </motion.div>
                  ) : (
                    <button 
                      disabled={!userRecall}
                      onClick={checkRecall}
                      className="w-full py-6 bg-orange-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-orange-600/30 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      Authenticate Memory
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
            <h2 className="text-3xl font-black tracking-tight italic font-display text-orange-100 uppercase">{t.story}</h2>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Make a story to remember</p>
           </div>
        </div>
        {!isAddingStory && (
          <button 
            onClick={() => setIsAddingStory(true)}
            className="flex items-center gap-4 bg-orange-600 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all shadow-2xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={20} />
            <span>Add New Story</span>
          </button>
        )}
      </header>

      {isAddingStory ? (
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2a221f] border border-[#3f332c] rounded-[4rem] p-12 shadow-2xl"
          >
            <div className="flex items-center gap-5 mb-10">
               <div className="w-16 h-16 bg-orange-600/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-500/20">
                <BookOpen size={32} />
              </div>
              <h3 className="text-3xl font-black text-orange-100 uppercase tracking-tighter italic drop-shadow-sm">Add New Story</h3>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-6">Name</p>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. The Kingdom of Cells"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-5 px-8 font-black text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 transition-all italic tracking-tight"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-6">Items (use commas)</p>
                <input 
                  type="text"
                  placeholder="Nucleus, Mitochondria, Ribosomes..."
                  value={newItems}
                  onChange={(e) => setNewItems(e.target.value)}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-5 px-8 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 transition-all italic tracking-tight"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-6">The Story</p>
                <textarea 
                  placeholder="Once upon a time, in a microscopic castle ruled by King Nucleus..."
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  rows={6}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-[2rem] py-5 px-8 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 resize-none italic leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-6 pt-4">
                <button onClick={resetForm} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#3f332c] hover:text-orange-200/40 transition-all">Cancel</button>
                <button onClick={addStory} className="px-12 py-5 bg-orange-600 text-white rounded-[2rem] font-black text-[10px] uppercase shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95">Save</button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
           {storyChains.map((story) => (
            <motion.div 
              layout
              key={story.id}
              className="bg-[#2a221f] border border-[#3f332c] rounded-[4rem] p-12 shadow-sm hover:bg-[#2d2522] transition-all group flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-[#1a1614] text-orange-500 rounded-[1.8rem] flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner border border-[#3f332c]">
                    <BookOpen size={28} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setStoryChains(storyChains.filter(s => s.id !== story.id)); }}
                    className="p-3 text-orange-200/20 hover:text-rose-500 bg-white/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <h3 className="text-3xl font-black text-orange-100 tracking-tighter italic mb-4 uppercase drop-shadow-sm">{story.title}</h3>
                <p className="text-orange-200/40 font-black uppercase text-[10px] tracking-[0.2em] mb-8">{story.items.length} Living Anchors</p>
                
                <div className="flex flex-wrap gap-3 mb-10">
                   {story.items.map((item, idx) => (
                    <span key={idx} className="px-5 py-2.5 bg-[#1a1614] text-orange-200/50 rounded-2xl text-[10px] font-black uppercase border border-[#3f332c] shadow-inner group-hover:border-orange-500/20 transition-all">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="bg-[#1a1614] p-8 rounded-[2.5rem] border border-[#3f332c] mb-10 h-36 overflow-hidden relative shadow-inner">
                  <p className="text-base font-bold text-orange-100/40 leading-relaxed italic line-clamp-3">"{story.story}"</p>
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#1a1614] to-transparent" />
                </div>
              </div>

              <button 
                onClick={() => startPractice(story)}
                className="w-full py-6 bg-orange-600 text-white rounded-[2.8rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
              >
                <Play size={20} fill="currentColor" /> Practice
              </button>
            </motion.div>
          ))}

          {storyChains.length === 0 && (
             <div className="col-span-full py-32 bg-[#2a221f]/30 rounded-[5rem] border-2 border-dashed border-[#3f332c] flex flex-col items-center">
                <BookOpen size={64} className="text-[#3f332c] mb-8" />
                <h4 className="text-2xl font-black text-orange-200/20 uppercase tracking-[0.3em] italic mb-4">Nothing here</h4>
                <p className="text-orange-200/40 font-bold italic mb-10">Turn facts into a story.</p>
                <button 
                  onClick={() => setIsAddingStory(true)}
                  className="px-14 py-5 bg-orange-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
                >
                  Add First Story
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
