import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Map, Edit2, Play, ChevronLeft, Home, Box, ArrowRight, ArrowLeft, ChevronRight, HelpCircle, Search, X, LayoutGrid, LayoutList, RotateCcw } from 'lucide-react';
import { MemoryPalace as PalaceType, PalaceLocation } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';
import { MemoryLinker } from './MemoryLinker';

export default function MemoryPalace() {
  const { memoryPalaces, setMemoryPalaces, goBack, allSubjects } = useAppContext();

  const palaceFormRef = React.useRef<HTMLDivElement>(null);
  const locFormRef = React.useRef<HTMLDivElement>(null);
  const listSectionRef = React.useRef<HTMLDivElement>(null);

  const [isAddingPalace, setIsAddingPalace] = useState(false);
  const [editingPalaceId, setEditingPalaceId] = useState<string | null>(null);
  const [activePalaceId, setActivePalaceId] = useState<string | null>(null);
  const [newPalaceName, setNewPalaceName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [newLocName, setNewLocName] = useState('');
  const [newLocConcept, setNewLocConcept] = useState('');

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

  const scrollToPalaceForm = () => {
    setTimeout(() => {
      palaceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scrollToLocForm = () => {
    setTimeout(() => {
      locFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Practice State
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentLocIdx, setCurrentLocIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activePalace = memoryPalaces.find(p => p.id === activePalaceId);

  React.useEffect(() => {
    if (practiceMode) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [practiceMode]);

  const addPalace = () => {
    if (!newPalaceName) return;
    if (editingPalaceId) {
      setMemoryPalaces(memoryPalaces.map(p => 
        p.id === editingPalaceId ? { ...p, name: newPalaceName, subject: newSubject || undefined } : p
      ));
      setEditingPalaceId(null);
    } else {
      const palace: PalaceType = {
        id: Date.now().toString(),
        name: newPalaceName,
        subject: newSubject || undefined,
        locations: []
      };
      setMemoryPalaces([palace, ...memoryPalaces]);
    }
    setNewPalaceName('');
    setNewSubject('');
    setIsAddingPalace(false);
  };

  const startEditPalace = (palace: PalaceType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPalaceId(palace.id);
    setNewPalaceName(palace.name);
    setNewSubject(palace.subject || '');
    setIsAddingPalace(true);
    scrollToPalaceForm();
  };

  const addLocation = () => {
    if (!newLocName || !newLocConcept || !activePalaceId) return;
    if (editingLocId) {
      setMemoryPalaces(memoryPalaces.map(p => 
        p.id === activePalaceId ? {
          ...p,
          locations: p.locations.map(l => l.id === editingLocId ? { ...l, name: newLocName, concept: newLocConcept } : l)
        } : p
      ));
      setEditingLocId(null);
    } else {
      const loc: PalaceLocation = {
        id: Date.now().toString(),
        name: newLocName,
        concept: newLocConcept
      };
      setMemoryPalaces(memoryPalaces.map(p => 
        p.id === activePalaceId ? { ...p, locations: [...p.locations, loc] } : p
      ));
    }
    setNewLocName('');
    setNewLocConcept('');
    setIsAddingLocation(false);
  };

  const startEditLocation = (loc: PalaceLocation) => {
    setEditingLocId(loc.id);
    setNewLocName(loc.name);
    setNewLocConcept(loc.concept);
    setIsAddingLocation(true);
    scrollToLocForm();
  };

  const deletePalace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemoryPalaces(memoryPalaces.filter(p => p.id !== id));
    if (activePalaceId === id) setActivePalaceId(null);
  };

  const deleteLocation = (locId: string) => {
    if (!activePalaceId) return;
    setMemoryPalaces(memoryPalaces.map(p => 
      p.id === activePalaceId ? { ...p, locations: p.locations.filter(l => l.id !== locId) } : p
    ));
  };

  const startPractice = () => {
    if (!activePalace || activePalace.locations.length === 0) return;
    setPracticeMode(true);
    setCurrentLocIdx(0);
    setUserAnswer('');
    setSubmitted(false);
  };

  if (practiceMode && activePalace) {
    const loc = activePalace.locations[currentLocIdx];
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-400 transition-all"><ChevronLeft size={24} /></button>
            <div>
               <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase">Palace Practice</h1>
               <p className="text-orange-200/40 text-xs font-bold uppercase tracking-widest">{activePalace.name}</p>
            </div>
          </div>
          <div className="text-orange-200/40 font-black text-sm italic">
            {currentLocIdx + 1} / {activePalace.locations.length}
          </div>
        </header>

        <div className="bg-[#2a221f] p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[500px] flex flex-col items-center text-center relative overflow-hidden">
          <MaanasMascot size={140} expression={submitted ? 'proud' : 'focused'} />
          
          <div className="mt-8 space-y-6 w-full max-w-xl">
            {/* Room / Item / Spot Header */}
            <div className="space-y-2 bg-[#1a1614] p-6 rounded-3xl border border-[#3f332c]">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-orange-500 block">Room / Item / Spot</span>
              <h2 className="text-3xl sm:text-4xl font-black text-orange-50 tracking-tighter italic drop-shadow-lg">{loc.name}</h2>
              <p className="text-xs text-orange-200/50 font-medium pt-1">Recall what item/concept you placed at this room/spot.</p>
            </div>

            {/* Answer Input & Submission */}
            {!submitted ? (
              <div className="space-y-4 text-left">
                <label className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Your Recalled Answer:</label>
                <textarea
                  rows={3}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the item to remember for this room/spot..."
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl p-4 text-xs font-bold text-orange-100 placeholder:text-orange-200/30 focus:outline-none focus:border-orange-500 resize-none"
                />

                <button 
                  disabled={!userAnswer.trim()}
                  onClick={() => setSubmitted(true)}
                  className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/30 active:scale-95 transition-all disabled:opacity-40"
                >
                  Submit Answer & Reveal Item
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-left"
              >
                {/* Submitted User Answer */}
                <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c] space-y-1">
                  <span className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest block">Your Recalled Answer:</span>
                  <p className="text-sm font-bold text-orange-100 whitespace-pre-wrap">{userAnswer}</p>
                </div>

                {/* Actual Item to Remember */}
                <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/30 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-orange-400 block">Actual Item to Remember (at {loc.name}):</span>
                  <p className="text-2xl font-black text-orange-100 italic tracking-tighter">"{loc.concept}"</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Location Stepper Navigation */}
          <div className="flex gap-4 mt-8 w-full max-w-sm">
            <button 
              disabled={currentLocIdx === 0}
              onClick={() => { setCurrentLocIdx(prev => prev - 1); setSubmitted(false); setUserAnswer(''); }}
              className="flex-1 py-4 bg-[#1a1614] text-orange-200/60 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-20 border border-[#3f332c]"
            >
              <ArrowLeft size={16} /> Prev Spot
            </button>
            {currentLocIdx < activePalace.locations.length - 1 ? (
              <button 
                onClick={() => { setCurrentLocIdx(prev => prev + 1); setSubmitted(false); setUserAnswer(''); }}
                className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20"
              >
                Next Spot <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={() => { setPracticeMode(false); }}
                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-95"
              >
                Done Practice
              </button>
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
            <h2 className="text-3xl font-black tracking-tight italic font-display text-orange-100 uppercase">{t.palace}</h2>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Place items in a room</p>
           </div>
        </div>
        {!activePalaceId && (
          <button 
            onClick={() => { setIsAddingPalace(true); scrollToPalaceForm(); }}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>Add New Room</span>
          </button>
        )}
      </header>

      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-orange-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Memory Palace</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A spatial association system that maps facts or checklists onto physical landmarks (like furniture) in a room you know well.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Click "Add New Room" and write a familiar physical space name.</span>
          <span className="block mt-1">2. Tap onto your room, click "Add Location Pin" to place facts on physical objects.</span>
          <span className="block mt-1">3. Tap "Begin Practice Tour" to cycle visual anchors.</span>
        </div>
      </div>

      {/* Toolbar: Search Bar & View Modes */}
      {!activePalaceId && !isAddingPalace && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#2a221f] p-3 rounded-2xl border border-[#3f332c]">
          <div className="relative w-full sm:max-w-md flex items-center">
            <Search size={18} className="ml-3 text-amber-700 dark:text-orange-400/60 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Memory Palaces & locations..."
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

      {!activePalaceId ? (
        <div ref={listSectionRef} className="space-y-6">
          <AnimatePresence>
            {isAddingPalace && (
              <motion.div 
                ref={palaceFormRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#2a221f] p-10 rounded-[4rem] border-2 border-dashed border-[#3f332c] flex flex-col items-center justify-center space-y-8 shadow-2xl shadow-orange-900/5 max-w-xl mx-auto"
              >
                <Home size={40} className="text-[#3f332c]" />
                <div className="w-full space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest text-center">Room / Palace Name</p>
                    <input 
                      autoFocus
                      type="text"
                      placeholder="e.g. My Bedroom"
                      value={newPalaceName}
                      onChange={(e) => setNewPalaceName(e.target.value)}
                      className="w-full text-center bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-black text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic text-base"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest text-center">Link Subject</p>
                    <input 
                      type="text"
                      list="palace-subjects-list"
                      placeholder="Select or type subject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full text-center bg-[#1a1614] border border-[#3f332c] rounded-2xl py-3 px-4 text-xs font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <datalist id="palace-subjects-list">
                      {allSubjects.map(sub => (
                        <option key={sub} value={sub} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <button 
                    onClick={() => setIsAddingPalace(false)} 
                    className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700"
                  >
                    Cancel
                  </button>
                  <button onClick={addPalace} className="px-6 py-3 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95">Save Room</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(() => {
            const filteredPalaces = memoryPalaces.filter(p => 
              !searchQuery.trim() || 
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              p.locations.some(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.concept.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (p.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredPalaces.length === 0 && !isAddingPalace) {
              return (
                <div className="text-center py-16 sm:py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-3xl sm:rounded-[5rem] flex flex-col items-center p-4">
                  <Home size={48} className="text-[#3f332c] mb-6" />
                  <p className="text-orange-200/20 font-black italic uppercase tracking-[0.3em] text-xs">
                    {searchQuery ? `No rooms found for "${searchQuery}"` : 'No memory palaces found.'}
                  </p>
                  <button onClick={() => { setIsAddingPalace(true); scrollToPalaceForm(); }} className="mt-4 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline">Add your first room</button>
                </div>
              );
            }

            if (viewMode === 'flip') {
              const activeFlipPalace = filteredPalaces[flipIndex] || filteredPalaces[0];
              return (
                <div className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-between min-h-[420px] shadow-2xl relative">
                  <div className="w-full flex justify-between items-center text-xs font-bold text-orange-200/40 border-b border-[#3f332c] pb-4">
                    <span>Memory Palace Card ({flipIndex + 1} of {filteredPalaces.length})</span>
                    {activeFlipPalace?.subject && (
                      <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-[10px]">
                        {activeFlipPalace.subject}
                      </span>
                    )}
                  </div>

                  {activeFlipPalace && (
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-lg bg-[#1a1614] border-2 border-[#3f332c] hover:border-orange-500/50 rounded-3xl p-8 cursor-pointer transition-all min-h-[220px] flex flex-col justify-center items-center gap-4 relative group"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                        {isFlipped ? 'Back (Room/Spot Elements)' : 'Front (Palace Name & Overview)'}
                      </span>

                      {!isFlipped ? (
                        <div className="space-y-3">
                          <h3 className="text-2xl font-black text-orange-100 italic">{activeFlipPalace.name}</h3>
                          <p className="text-xs font-bold text-orange-400/80 uppercase tracking-widest">
                            {activeFlipPalace.locations.length} Room / Spot Elements
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-w-md w-full">
                          <span className="text-xs font-bold text-orange-400 block uppercase tracking-wider">Anchors / Elements:</span>
                          {activeFlipPalace.locations.length === 0 ? (
                            <p className="text-xs text-orange-200/40 italic">No location elements added to this room yet.</p>
                          ) : (
                            <div className="flex flex-wrap justify-center gap-2 max-h-36 overflow-y-auto p-1">
                              {activeFlipPalace.locations.map((loc, i) => (
                                <span key={i} className="px-3 py-1 bg-orange-500/10 text-orange-200 border border-orange-500/20 rounded-xl text-xs font-bold">
                                  {loc.name}: {loc.concept}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <span className="text-[10px] uppercase font-bold text-orange-400/60 group-hover:text-orange-400 transition-all mt-2">
                        Click card to {isFlipped ? 'see Front' : 'reveal Elements'}
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
                      onClick={() => activeFlipPalace && setActivePalaceId(activeFlipPalace.id)}
                      className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-700 transition-all flex items-center gap-2"
                    >
                      <span>Open Palace</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      disabled={flipIndex >= filteredPalaces.length - 1}
                      onClick={() => { setFlipIndex(prev => Math.min(filteredPalaces.length - 1, prev + 1)); setIsFlipped(false); }}
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
                  {filteredPalaces.map(palace => (
                    <div 
                      key={palace.id}
                      className="bg-[#2a221f] border border-[#3f332c] rounded-2xl p-4 hover:bg-[#2d2522] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-orange-100 italic truncate">{palace.name}</h4>
                          {palace.subject && (
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded border border-orange-500/20">
                              {palace.subject}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-orange-400 italic">
                          {palace.locations.length} Room / Spot Elements
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setActivePalaceId(palace.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ChevronRight size={12} />
                        </button>
                        <button 
                          onClick={(e) => startEditPalace(palace, e)}
                          className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => deletePalace(palace.id, e)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPalaces.map(palace => (
                  <motion.div 
                    layout
                    key={palace.id}
                    onClick={() => setActivePalaceId(palace.id)}
                    className="bg-[#2a221f] p-6 sm:p-10 rounded-3xl sm:rounded-[4rem] border border-[#3f332c] shadow-sm hover:bg-[#342a27] transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[300px]"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                    <div>
                      <div className="flex justify-between items-start mb-6 sm:mb-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1a1614] text-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-[#3f332c] group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
                          <Home size={24} className="sm:w-8 sm:h-8" />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => startEditPalace(palace, e)}
                            className="p-3 sm:p-3.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95"
                          >
                            <Edit2 size={16} className="sm:w-5 sm:h-5" />
                          </button>
                          <button 
                            onClick={(e) => deletePalace(palace.id, e)}
                            className="p-3 sm:p-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95"
                          >
                            <Trash2 size={16} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-orange-100 tracking-tight italic mb-2 drop-shadow-sm break-words">{palace.name}</h3>
                      <p className="text-orange-200/40 font-black uppercase text-[10px] tracking-[0.2em]">{palace.locations.length} Elements</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6 text-orange-500 font-black text-[10px] uppercase tracking-widest">
                      <span>Open Palace</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 bg-[#2a221f] p-6 sm:p-10 rounded-3xl sm:rounded-[4rem] border border-[#3f332c] shadow-xl">
            <div className="flex items-center gap-4 sm:gap-8 min-w-0 w-full md:w-auto">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-orange-600 text-white rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-600/30 ring-4 ring-orange-600/10 shrink-0">
                <Home size={28} className="sm:w-10 sm:h-10" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-3xl font-black text-orange-100 tracking-tight italic mb-1 uppercase truncate">{activePalace.name}</h3>
                <button onClick={() => setActivePalaceId(null)} className="text-orange-500 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">Change Room <ArrowRight size={10} /></button>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4 w-full md:w-auto justify-end">
              <button 
                onClick={() => { setIsAddingLocation(true); setEditingLocId(null); setNewLocName(''); setNewLocConcept(''); scrollToLocForm(); }}
                className="flex items-center justify-center gap-2 bg-white/5 text-orange-100 px-4 sm:px-8 py-3 sm:py-5 rounded-xl sm:rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all border border-[#3f332c] flex-1 md:flex-initial"
              >
                <Plus size={16} /> New Element
              </button>
              <button 
                disabled={activePalace.locations.length === 0}
                onClick={startPractice}
                className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 sm:px-12 py-3 sm:py-5 rounded-xl sm:rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-orange-700 shadow-xl shadow-orange-600/20 disabled:hidden transition-all active:scale-95 flex-1 md:flex-initial"
              >
                <Play size={16} fill="currentColor" /> Practice
              </button>
            </div>
          </div>

          <MemoryLinker itemId={activePalace.id} itemType="palace" className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c]" />

          <AnimatePresence>
            {isAddingLocation && (
              <motion.div 
                ref={locFormRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2a221f] p-10 rounded-[3.5rem] border border-[#3f332c] flex flex-col md:flex-row gap-8 items-end shadow-2xl"
              >
                <div className="flex-2 w-full space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-4">room/ spot/ item (e.g. Bed)</p>
                  <input 
                    type="text"
                    placeholder="e.g. Wooden Sofa"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-5 px-8 font-black text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  />
                </div>
                <div className="flex-2 w-full space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-4">Item to remember</p>
                  <input 
                    type="text"
                    placeholder="e.g. Newton's Law"
                    value={newLocConcept}
                    onChange={(e) => setNewLocConcept(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-5 px-8 font-black text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  />
                </div>
                <div className="flex gap-4 shrink-0 mb-1">
                  <button 
                    onClick={() => { setIsAddingLocation(false); setEditingLocId(null); }} 
                    className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700"
                  >
                    Cancel
                  </button>
                  <button onClick={addLocation} className="px-10 py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase shadow-xl shadow-emerald-500/20 active:scale-95">Save</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activePalace.locations.map((loc, idx) => (
              <motion.div 
                layout
                key={loc.id}
                className="bg-[#2a221f] p-8 rounded-[3.5rem] border border-[#3f332c] shadow-sm relative group overflow-hidden hover:bg-[#2d2522] transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-orange-900/40 group-hover:text-orange-500/20 transition-all italic font-display">{(idx + 1).toString().padStart(2, '0')}</span>
                    <Box size={20} className="text-orange-500/40 group-hover:text-orange-500 transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditLocation(loc)} 
                      className="p-3.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteLocation(loc.id)} 
                      className="p-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h4 className="text-2xl font-black text-orange-100 tracking-tighter bg-[#1a1614] px-6 py-4 rounded-2xl mb-6 italic truncate border border-[#3f332c]">{loc.name}</h4>
                <div className="space-y-1.5 px-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-orange-500">Item to remember</p>
                  <p className="font-black text-orange-100/70 italic text-lg line-clamp-2 leading-tight">"{loc.concept}"</p>
                </div>
              </motion.div>
            ))}
          </div>

          {activePalace.locations.length === 0 && (
            <div className="text-center py-32 bg-[#2a221f]/30 rounded-[5rem] border-2 border-dashed border-[#3f332c] flex flex-col items-center">
              <Map size={64} className="text-[#3f332c] mb-6" />
              <p className="text-orange-200/20 font-black italic uppercase tracking-[0.3em] text-xs">Room is empty.</p>
              <button 
                onClick={() => { setIsAddingLocation(true); scrollToLocForm(); }}
                className="mt-6 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline"
              >
                Add Your First Element
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
