import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  RotateCcw, 
  Trash2, 
  Edit2, 
  LayoutGrid, 
  LayoutList,
  Tags,
  Search,
  Filter
} from 'lucide-react';
import { Flashcard } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

export default function FlashcardDeck() {
  const { flashcards: cards, setFlashcards: setCards } = useAppContext();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'flip' | 'grid' | 'list'>('flip');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const subjects = ['all', ...Array.from(new Set(cards.map(c => c.subject).filter(Boolean))) as string[]];
  const filteredCards = selectedSubject === 'all' 
    ? cards 
    : cards.filter(c => c.subject === selectedSubject);

  const currentCard = filteredCards[currentIndex];

  const addCard = () => {
    if (!newQ || !newA) return;
    
    if (editingId) {
      setCards(prev => prev.map(card => 
        card.id === editingId 
          ? { ...card, question: newQ, answer: newA, subject: newSubject } 
          : card
      ));
      setEditingId(null);
    } else {
      const card: Flashcard = {
        id: Date.now().toString(),
        question: newQ,
        answer: newA,
        subject: newSubject,
        difficulty: 'medium',
        nextReview: new Date().toISOString(),
        interval: 0,
        easeFactor: 2.5
      };
      setCards([...cards, card]);
    }
    
    setNewQ('');
    setNewA('');
    setNewSubject('');
    setIsAdding(false);
  };

  const startEdit = (card: Flashcard) => {
    setNewQ(card.question);
    setNewA(card.answer);
    setNewSubject(card.subject || '');
    setEditingId(card.id);
    setIsAdding(true);
  };

  const deleteCard = (id: string) => {
    if (cards.length === 1) {
      setCards([]);
      setCurrentIndex(0);
      return;
    }
    
    setCards(prev => prev.filter(c => c.id !== id));
    if (currentIndex >= filteredCards.length - 1) {
      setCurrentIndex(Math.max(0, filteredCards.length - 2));
    }
    setIsFlipped(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 h-full flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-orange-100 italic uppercase tracking-tighter drop-shadow-sm">Flashcards</h2>
          <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{cards.length} Cards in your Deck</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#1a1614] p-1.5 rounded-2xl border border-[#3f332c]">
            <button 
              onClick={() => setViewMode('flip')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'flip' ? 'bg-orange-600 text-white shadow-lg' : 'text-orange-200/20 hover:text-orange-200/40'}`}
              title="Flip View"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-orange-600 text-white shadow-lg' : 'text-orange-200/20 hover:text-orange-200/40'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-orange-600 text-white shadow-lg' : 'text-orange-200/20 hover:text-orange-200/40'}`}
              title="List View"
            >
              <LayoutList size={18} />
            </button>
          </div>

          <button 
            onClick={() => {
              setNewQ('');
              setNewA('');
              setNewSubject('');
              setEditingId(null);
              setIsAdding(true);
            }}
            className="flex items-center space-x-2 bg-orange-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Add Card</span>
          </button>
        </div>
      </header>

      {/* Category Filter */}
      {subjects.length > 1 && (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          <Filter size={16} className="text-orange-200/20 flex-shrink-0" />
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => { setSelectedSubject(subject); setCurrentIndex(0); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedSubject === subject 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-lg' 
                  : 'bg-[#1a1614] border-[#3f332c] text-orange-200/20 hover:border-orange-200/20'
              }`}
            >
              {subject === 'all' ? 'All Cards' : subject}
            </button>
          ))}
        </div>
      )}

      {isAdding && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Question</label>
                <input 
                  placeholder="What do you want to learn?" 
                  value={newQ} 
                  onChange={e => setNewQ(e.target.value)} 
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold italic outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Category / Subject</label>
                <div className="relative">
                  <Tags className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-200/20" size={18} />
                  <input 
                    placeholder="e.g. History, Math, Biology..." 
                    value={newSubject} 
                    onChange={e => setNewSubject(e.target.value)} 
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 pl-14 pr-6 text-orange-100 font-bold italic outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Answer</label>
              <textarea 
                placeholder="The information to remember..." 
                value={newA} 
                onChange={e => setNewA(e.target.value)} 
                rows={4} 
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold italic outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all shadow-inner" 
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setIsAdding(false)} className="px-8 py-3 text-[10px] text-orange-200/20 font-black uppercase tracking-widest hover:text-orange-200/40 transition-all">Cancel</button>
              <button onClick={addCard} className="px-10 py-3.5 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95 transition-all">Save Card</button>
            </div>
          </div>
        </motion.div>
      )}

      {filteredCards.length > 0 ? (
        <div className="flex-1">
          {viewMode === 'flip' && (
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="relative w-full max-w-xl aspect-[4/3] md:aspect-[3/2] group">
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-full cursor-pointer perspective-2000"
                >
                  <div className={`relative w-full h-full transition-all duration-1000 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-[#2a221f] border border-[#3f332c] rounded-[4rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] group-hover:border-orange-500/30 transition-all">
                      {currentCard.subject && (
                        <div className="absolute top-10 px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                          <span className="text-[8px] uppercase font-black tracking-widest text-orange-500">{currentCard.subject}</span>
                        </div>
                      )}
                      <span className="text-[10px] uppercase font-black tracking-[0.4em] text-orange-200/20 mb-8 italic">The Question</span>
                      <p className="text-3xl font-black italic tracking-tighter text-orange-100 drop-shadow-lg uppercase leading-tight">{currentCard.question}</p>
                      <div className="absolute bottom-12 flex items-center space-x-3 text-orange-200/20 text-[9px] uppercase tracking-[0.3em] font-black group-hover:text-orange-500 transition-all">
                        <RotateCcw size={14} className="animate-spin-slow" />
                        <span>Click to Reveal Answer</span>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-orange-600 text-white rounded-[4rem] p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-[0_30px_60px_-12px_rgba(234,88,12,0.3)]">
                      <span className="text-[10px] uppercase font-black tracking-[0.4em] text-orange-100/40 mb-8 italic">The Answer</span>
                      <p className="text-2xl font-black italic tracking-tight uppercase leading-relaxed">{currentCard.answer}</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Actions - Contrasting colors */}
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button 
                    onClick={() => startEdit(currentCard)}
                    className="p-5 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all scale-90 hover:scale-100 border-2 border-white/10"
                    title="Edit Card"
                  >
                    <Edit2 size={24} />
                  </button>
                  <button 
                    onClick={() => deleteCard(currentCard.id)}
                    className="p-5 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all scale-90 hover:scale-100 border-2 border-white/10"
                    title="Remove Card"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>

              <div className="mt-16 flex items-center space-x-12">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => { setCurrentIndex(currentIndex - 1); setIsFlipped(false); }}
                  className="w-16 h-16 rounded-[2rem] bg-[#2a221f] border border-[#3f332c] text-orange-200/20 hover:text-orange-500 hover:border-orange-500/30 disabled:opacity-5 transition-all shadow-xl active:scale-90"
                >
                  <ChevronLeft size={32} className="mx-auto" />
                </button>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-orange-200/20 mb-3 tracking-[0.3em] uppercase italic">{currentIndex + 1} / {filteredCards.length} Cards</span>
                  <div className="flex space-x-1.5 bg-[#1a1614] p-2 rounded-full border border-[#3f332c]">
                    {filteredCards.map((_, i) => (
                      <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-6 bg-orange-600' : 'w-1.5 bg-[#3f332c]'}`} />
                    ))}
                  </div>
                </div>

                <button 
                  disabled={currentIndex === filteredCards.length - 1}
                  onClick={() => { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }}
                  className="w-16 h-16 rounded-[2rem] bg-[#2a221f] border border-[#3f332c] text-orange-200/20 hover:text-orange-500 hover:border-orange-500/30 disabled:opacity-5 transition-all shadow-xl active:scale-90"
                >
                  <ChevronRight size={32} className="mx-auto" />
                </button>
              </div>

              {isFlipped && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-4 mt-16">
                  <button className="px-10 py-4 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95">Forgotten</button>
                  <button className="px-10 py-4 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95">Vague</button>
                  <button className="px-10 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">Engraved</button>
                </motion.div>
              )}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map(card => (
                <div key={card.id} className="bg-[#2a221f] border border-[#3f332c] rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-orange-500/30 transition-all shadow-xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] uppercase font-black tracking-widest text-orange-200/20 italic">Question</span>
                      {card.subject && (
                        <span className="text-[8px] font-black uppercase bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20">
                          {card.subject}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-black text-orange-100 uppercase italic tracking-tight line-clamp-3">{card.question}</p>
                    <div className="h-px bg-[#3f332c] w-12" />
                    <p className="text-xs text-orange-200/40 font-bold italic line-clamp-4">{card.answer}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-8">
                    <button 
                      onClick={() => startEdit(card)}
                      className="flex-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredCards.map(card => (
                <div key={card.id} className="bg-[#2a221f] border border-[#3f332c] rounded-[2rem] p-6 flex items-center justify-between group hover:bg-[#2e2623] transition-all shadow-md">
                  <div className="flex items-center gap-8 flex-1 mr-8">
                    <div className="w-1.5 h-12 bg-orange-600 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-black text-orange-100 uppercase italic tracking-tight">{card.question}</p>
                        {card.subject && (
                          <span className="text-[8px] font-black uppercase text-orange-500">{card.subject}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-orange-200/40 font-bold italic truncate max-w-xl">{card.answer}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(card)}
                      className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20 hover:scale-110 transition-all border border-white/10"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/20 hover:scale-110 transition-all border border-white/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 bg-[#1a1614] rounded-[4rem] border border-[#3f332c] border-dashed">
           <div className="w-24 h-24 bg-[#2a221f] rounded-[2rem] border border-[#3f332c] flex items-center justify-center opacity-20 group">
             <RotateCcw size={40} className="text-orange-500 group-hover:rotate-180 transition-transform duration-700" />
           </div>
           <div className="text-center space-y-2">
             <p className="text-orange-200/20 font-black italic uppercase tracking-[0.3em] text-sm">No cards found in this sanctuary.</p>
             <p className="text-orange-200/10 text-[10px] uppercase font-black italic tracking-widest leading-relaxed">
               {selectedSubject !== 'all' ? `Category "${selectedSubject}" holds no secrets yet.` : 'Add your first scroll to begin your journey.'}
             </p>
           </div>
           <button onClick={() => setIsAdding(true)} className="px-10 py-4 bg-orange-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20">
             Manifest First Rune
           </button>
        </div>
      )}
    </div>
  );
}
