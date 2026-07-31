import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
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
import { LinkChain } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MemoryLinker } from './MemoryLinker';

export default function StoryMethod() {
  const { storyChains, setStoryChains, goBack, allSubjects } = useAppContext();

  const formRef = React.useRef<HTMLDivElement>(null);
  const listSectionRef = React.useRef<HTMLDivElement>(null);

  const [isAddingStory, setIsAddingStory] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newItems, setNewItems] = useState('');
  const [newStoryText, setNewStoryText] = useState('');
  const [newSubject, setNewSubject] = useState('');
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

  const activeStory = storyChains.find(s => s.id === activeStoryId);

  React.useEffect(() => {
    if (practiceMode) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [practiceMode]);

  const resetForm = () => {
    setNewStoryTitle('');
    setNewItems('');
    setNewStoryText('');
    setNewSubject('');
    setIsAddingStory(false);
    setEditingStoryId(null);
  };

  const addStory = () => {
    if (!newStoryTitle || !newItems) return;
    const itemList = newItems.split(',').map(i => i.trim()).filter(i => i);
    
    if (editingStoryId) {
      setStoryChains(storyChains.map(s => 
        s.id === editingStoryId ? {
          ...s,
          title: newStoryTitle,
          items: itemList,
          story: newStoryText,
          subject: newSubject || undefined
        } : s
      ));
    } else {
      const story: LinkChain = {
        id: Date.now().toString(),
        title: newStoryTitle,
        items: itemList,
        story: newStoryText,
        subject: newSubject || undefined
      };
      setStoryChains([story, ...storyChains]);
    }
    resetForm();
  };

  const startEditing = (story: LinkChain) => {
    setEditingStoryId(story.id);
    setNewStoryTitle(story.title);
    setNewItems(story.items.join(', '));
    setNewStoryText(story.story);
    setNewSubject(story.subject || '');
    setIsAddingStory(true);
    scrollToForm();
  };

  const startPractice = (story: LinkChain) => {
    setActiveStoryId(story.id);
    setPracticeMode(true);
    setUserAnswer('');
    setSubmitted(false);
  };

  const filteredStories = storyChains.filter(s => 
    !searchQuery.trim() || 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.story.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFlipItem = filteredStories[flipIndex] || filteredStories[0];

  if (practiceMode && activeStory) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] transition-all hover:text-orange-400"><ChevronLeft size={24} /></button>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase text-shadow-sm">Story Method Practice</h1>
            <p className="text-orange-200/40 text-xs font-bold uppercase tracking-widest">{activeStory.title}</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-orange-600/10 text-orange-500 border border-orange-500/20 rounded-xl font-black text-xs">
            {activeStory.items.length}
          </div>
        </header>

        <div className="bg-[#2a221f] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[500px] flex flex-col items-center text-center relative">
          <div className="p-4 bg-orange-600/20 rounded-full text-orange-400 border border-orange-500/30">
            <Brain size={40} />
          </div>
          
          <div className="mt-8 space-y-6 w-full max-w-xl">
            {/* Question Card displaying Story Title */}
            <div className="space-y-3 bg-[#1a1614] p-6 rounded-3xl border border-[#3f332c]">
              <span className="text-[10px] uppercase font-black text-orange-500 tracking-widest block">Question / Title</span>
              <h2 className="text-2xl font-black text-orange-100 italic">"{activeStory.title}"</h2>
              {activeStory.subject && (
                <span className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase rounded-lg border border-orange-500/20">
                  Subject: {activeStory.subject}
                </span>
              )}
              <p className="text-xs text-orange-200/50 font-medium pt-2">What information or items did you create a story out of for this topic?</p>
            </div>

            {/* Input & Reveal Section */}
            {!submitted ? (
              <div className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Your Recalled Answer:</label>
                  <textarea
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter the information / items you remember..."
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl p-4 text-xs font-bold text-orange-100 placeholder:text-orange-200/30 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <button 
                  disabled={!userAnswer.trim()}
                  onClick={() => setSubmitted(true)}
                  className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  Submit Answer & Reveal Story
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                {/* Submitted User Answer */}
                <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c] space-y-1">
                  <span className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest block">Your Recalled Answer:</span>
                  <p className="text-sm font-bold text-orange-100 whitespace-pre-wrap">{userAnswer}</p>
                </div>

                {/* Actual Information / Items */}
                <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c] space-y-2">
                  <span className="text-[10px] uppercase font-black text-orange-400 tracking-widest block">Actual Information / Items:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeStory.items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-600/20 text-orange-200 rounded-lg text-xs font-bold border border-orange-500/30">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highly Visible Story Activity Box */}
                <div className="bg-[#1f1a18] p-6 rounded-3xl border-2 border-orange-500/40 shadow-xl space-y-3">
                  <span className="text-[10px] uppercase font-black text-orange-400 tracking-widest block">Connecting Story (Memory Trick):</span>
                  <p className="text-base font-bold text-orange-50 italic leading-relaxed whitespace-pre-wrap">
                    "{activeStory.story}"
                  </p>
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
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
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
            onClick={() => { resetForm(); setIsAddingStory(true); scrollToForm(); }}
            className="flex items-center gap-4 bg-orange-600 text-white px-8 py-4 rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-2xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>Add New Story</span>
          </button>
        )}
      </header>

      {/* Toolbar: Search Bar & View Modes */}
      {!isAddingStory && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#2a221f] p-3 rounded-2xl border border-[#3f332c]">
          <div className="relative w-full sm:max-w-md flex items-center">
            <Search size={18} className="ml-3 text-amber-700 dark:text-orange-400/60 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search stories & keywords..."
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
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Story Method</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A creative association trick where you weave several unrelated key terms into a funny fictional story so your mind easily follows the sequence.
        </p>
      </div>

      <div ref={listSectionRef}>

      {isAddingStory ? (
        <div className="max-w-2xl mx-auto">
          <motion.div 
            ref={formRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2a221f] border border-[#3f332c] rounded-[4rem] p-10 shadow-2xl"
          >
            <div className="flex items-center gap-5 mb-8">
               <div className="w-14 h-14 bg-orange-600/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-500/20">
                <BookOpen size={28} />
              </div>
              <h3 className="text-2xl font-black text-orange-100 uppercase tracking-tighter italic drop-shadow-sm">
                {editingStoryId ? 'Edit' : 'Add New'} Story
              </h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-4">Title / Name</p>
                  <input 
                    autoFocus
                    type="text"
                    placeholder="e.g. The Kingdom of Cells"
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 transition-all italic text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-4">Link Subject</p>
                  <input 
                    type="text"
                    list="st-subjects-list"
                    placeholder="Select or type subject"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 text-orange-100 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-xs"
                  />
                  <datalist id="st-subjects-list">
                    {allSubjects.map(sub => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-4">Items (comma separated)</p>
                <input 
                  type="text"
                  placeholder="Nucleus, Mitochondria, Ribosomes..."
                  value={newItems}
                  onChange={(e) => setNewItems(e.target.value)}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 transition-all italic text-xs"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-4">The Story</p>
                <textarea 
                  placeholder="Once upon a time, in a microscopic castle ruled by King Nucleus..."
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  rows={4}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-5 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 resize-none italic text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={resetForm} 
                  className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button onClick={addStory} className="px-8 py-3 bg-orange-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95">Save</button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* View Modes Render */
        filteredStories.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-3xl sm:rounded-[4rem]">
            <BookOpen size={48} className="text-[#3f332c] mx-auto mb-4" />
            <p className="text-orange-200/40 font-bold text-xs uppercase tracking-widest">
              {searchQuery ? `No stories found matching "${searchQuery}"` : 'No stories created yet.'}
            </p>
          </div>
        ) : viewMode === 'flip' ? (
          /* FLIP VIEW */
          <div className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-between min-h-[420px] shadow-2xl relative">
            <div className="w-full flex justify-between items-center text-xs font-bold text-orange-200/40 border-b border-[#3f332c] pb-4">
              <span>Story Card ({flipIndex + 1} of {filteredStories.length})</span>
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
                  {isFlipped ? 'Back (Connecting Story)' : 'Front (Title & Target Items)'}
                </span>

                {!isFlipped ? (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-orange-100 italic">"{activeFlipItem.title}"</h3>
                    <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                      {activeFlipItem.items.map((it, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-orange-600/20 text-orange-300 rounded-lg text-[10px] font-bold border border-orange-500/20">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-md">
                    <p className="text-sm font-bold text-orange-100 italic leading-relaxed">
                      "{activeFlipItem.story}"
                    </p>
                  </div>
                )}

                <span className="text-[10px] uppercase font-bold text-orange-400/60 group-hover:text-orange-400 transition-all mt-2">
                  Click card to {isFlipped ? 'see Front' : 'flip Story'}
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
                Practice Story
              </button>

              <button
                disabled={flipIndex >= filteredStories.length - 1}
                onClick={() => { setFlipIndex(prev => Math.min(filteredStories.length - 1, prev + 1)); setIsFlipped(false); }}
                className="p-3 bg-[#1a1614] border border-[#3f332c] text-orange-200/60 rounded-xl disabled:opacity-20 hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : viewMode === 'line' ? (
          /* LINE VIEW */
          <div className="space-y-3">
            {filteredStories.map(story => (
              <div 
                key={story.id}
                className="bg-[#2a221f] border border-[#3f332c] rounded-2xl p-4 hover:bg-[#2d2522] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-orange-100 italic truncate">{story.title}</h4>
                    {story.subject && (
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20">
                        {story.subject}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-orange-300 italic truncate">"{story.story}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => startPractice(story)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700"
                  >
                    Practice
                  </button>
                  <button 
                    onClick={() => startEditing(story)}
                    className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setStoryChains(storyChains.filter(s => s.id !== story.id))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredStories.map((story) => (
              <motion.div 
                layout
                key={story.id}
                className="bg-[#2a221f] border border-[#3f332c] rounded-3xl sm:rounded-[3.5rem] p-6 sm:p-8 shadow-sm hover:bg-[#2d2522] transition-all group flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-[#1a1614] text-orange-500 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner border border-[#3f332c]">
                      <BookOpen size={22} />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditing(story)}
                        className="p-3 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setStoryChains(storyChains.filter(s => s.id !== story.id))}
                        className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-orange-100 tracking-tight italic mb-2 uppercase drop-shadow-sm break-words">{story.title}</h3>
                  <p className="text-orange-200/40 font-black uppercase text-[10px] tracking-[0.2em] mb-4">{story.items.length} Living Anchors</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                     {story.items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-[#1a1614] text-orange-200/80 rounded-xl text-[10px] font-black uppercase border border-[#3f332c] shadow-inner group-hover:border-orange-500/20 transition-all break-words">
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* HIGH VISIBILITY STORY BOX */}
                  <div className="bg-[#1a1614] p-5 sm:p-6 rounded-2xl border-2 border-orange-500/30 mb-6 relative shadow-md">
                    <p className="text-xs sm:text-sm font-bold text-orange-100 leading-relaxed italic line-clamp-4">"{story.story}"</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => startPractice(story)}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                  >
                    <Play size={16} fill="currentColor" /> Practice Story
                  </button>

                  <MemoryLinker itemId={story.id} itemType="story" />
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
      </div>
    </div>
  );
}
