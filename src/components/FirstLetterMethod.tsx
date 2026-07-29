import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Type, Edit2, Play, ChevronLeft, Box, ArrowRight, ArrowLeft, HelpCircle, Search, X, Brain } from 'lucide-react';
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
  const { firstLetterEntries, setFirstLetterEntries, goBack } = useAppContext();

  const [isAddingAid, setIsAddingAid] = useState(false);
  const [activeAidId, setActiveAidId] = useState<string | null>(null);
  const [editingAidId, setEditingAidId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Practice State
  const [practiceMode, setPracticeMode] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const activeAid = firstLetterEntries.find(a => a.id === activeAidId);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setItemsText('');
    setIsAddingAid(false);
    setEditingAidId(null);
  };

  const saveAid = () => {
    if (!title || !itemsText) return;
    const itemsList = itemsText.split('\n').map(i => i.trim()).filter(i => i);
    
    if (editingAidId) {
      setFirstLetterEntries(firstLetterEntries.map(a => 
        a.id === editingAidId ? { ...a, title, description, items: itemsList } : a
      ));
    } else {
      const newAid: FirstLetterAid = {
        id: Date.now().toString(),
        title,
        description,
        items: itemsList,
        mnemonic: ''
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
    setIsAddingAid(true);
  };

  const deleteAid = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFirstLetterEntries(firstLetterEntries.filter(a => a.id !== id));
  };

  const startPractice = (aid: FirstLetterAid) => {
    setActiveAidId(aid.id);
    setPracticeMode(true);
    setShowMnemonic(false);
  };

  const autoGenerate = () => {
    // This feature is no longer needed as per user request to just show initials.
    // We can use it to maybe format the initials better if needed, but the user says
    // "that facility should convert that text into just the first letters"
  };

  if (practiceMode && activeAid) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <button onClick={() => setPracticeMode(false)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] transition-all hover:bg-[#342a27]"><ChevronLeft size={24} /></button>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase text-shadow-sm">Practice</h1>
            <p className="text-orange-200/40 text-xs font-bold uppercase tracking-widest">{activeAid.title}</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 text-orange-400 rounded-xl font-black border border-orange-500/20">
            {activeAid.items.length}
          </div>
        </header>

        <div className="bg-[#2a221f] p-12 rounded-[3.5rem] shadow-2xl shadow-orange-900/10 border border-[#3f332c] min-h-[500px] flex flex-col items-center justify-center text-center">
          <div className="p-5 bg-orange-600/20 rounded-full text-orange-400 border border-orange-500/30">
            <Brain size={48} />
          </div>
          
          <div className="mt-12 space-y-8 w-full">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-orange-50 tracking-tighter italic">Recall all items in the set:</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {activeAid.items.map((item, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-[#1a1614] border-2 border-dashed border-[#3f332c] flex items-center justify-center font-black text-orange-200/20">
                    {item[0].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <button 
                onClick={() => { setPracticeMode(false); }}
                className="w-full max-w-sm py-6 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
              >
                Done
              </button>
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
            <h2 className="text-3xl font-black tracking-tight italic font-display bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent uppercase">{t.firstLetter}</h2>
            <p className="text-orange-200/40 text-xs font-bold uppercase tracking-widest">Learn First Letters</p>
           </div>
        </div>
        {!isAddingAid && (
          <button 
            onClick={() => setIsAddingAid(true)}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>New Mnemonic Aid</span>
          </button>
        )}
      </header>

      {/* Search Bar for First Letter Method */}
      {!isAddingAid && !practiceMode && (
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search first letter aids..."
            className="w-full bg-[#1a1614] border border-[#3f332c] text-xs py-3 pl-12 pr-10 rounded-2xl text-orange-100 placeholder:text-orange-200/30 focus:outline-none focus:border-orange-500 font-bold"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-orange-200/40 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
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

      {isAddingAid ? (
        <div className="max-w-2xl mx-auto">
          <motion.div 
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
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Name</p>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Rainbow Colors / Solar System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-black text-orange-100 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Items to remember (one per line)</p>
                <textarea 
                  placeholder="Mercury&#10;Venus&#10;Earth&#10;Mars..."
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  rows={4}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest">Calculated Initials</p>
                </div>
                <div className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-6 px-6 flex items-center justify-center gap-2">
                  {itemsText.split('\n').map(i => i.trim()[0]).filter(Boolean).map((char, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-12 h-12 bg-orange-600/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 font-black text-xl italic"
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
                <button onClick={resetForm} className="px-6 py-2 text-xs font-black uppercase tracking-widest text-[#3f332c]">Cancel</button>
                <button onClick={saveAid} className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-orange-600/20 active:scale-95">Save Aid</button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {firstLetterEntries.filter(aid => !searchQuery.trim() || aid.title.toLowerCase().includes(searchQuery.toLowerCase()) || aid.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-[3rem]">
              <Type size={40} className="text-[#3f332c] mx-auto mb-3" />
              <p className="text-orange-200/40 font-bold text-xs uppercase tracking-widest">
                {searchQuery ? `No aids found matching "${searchQuery}"` : 'No first-letter aids created yet.'}
              </p>
            </div>
          ) : (
            firstLetterEntries.filter(aid => !searchQuery.trim() || aid.title.toLowerCase().includes(searchQuery.toLowerCase()) || aid.items.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))).map((aid) => (
            <motion.div 
              layout
              key={aid.id}
              className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-orange-900/10 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-orange-600/10 text-orange-400 rounded-2xl flex items-center justify-center">
                    <Type size={28} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditing(aid)} 
                      className="p-3 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => deleteAid(aid.id, e)} 
                      className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-orange-100 tracking-tighter italic mb-4">{aid.title}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {aid.items.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-[#1a1614] rounded-lg text-[10px] font-black uppercase text-orange-200/40 border border-[#3f332c]">
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
          )))}
        </div>
      )}
    </div>
  );
}
