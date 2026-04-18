import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronLeft, ChevronRight, Check, X, RotateCcw, Trash2, Edit2 } from 'lucide-react';
import { Flashcard } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

export default function FlashcardDeck() {
  const { flashcards: cards, setFlashcards: setCards } = useAppContext();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  const currentCard = cards[currentIndex];

  const addCard = () => {
    if (!newQ || !newA) return;
    
    if (editingId) {
      setCards(prev => prev.map(card => 
        card.id === editingId 
          ? { ...card, question: newQ, answer: newA } 
          : card
      ));
      setEditingId(null);
    } else {
      const card: Flashcard = {
        id: Date.now().toString(),
        question: newQ,
        answer: newA,
        difficulty: 'medium',
        nextReview: new Date().toISOString(),
        interval: 0,
        easeFactor: 2.5
      };
      setCards([...cards, card]);
    }
    
    setNewQ('');
    setNewA('');
    setIsAdding(false);
  };

  const startEdit = (card: Flashcard) => {
    setNewQ(card.question);
    setNewA(card.answer);
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
    if (currentIndex >= cards.length - 1) {
      setCurrentIndex(Math.max(0, cards.length - 2));
    }
    setIsFlipped(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-black text-orange-100 italic uppercase tracking-tighter drop-shadow-sm">Divine Scrolls</h2>
          <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{cards.length} Scrolls in your Sanctum</p>
        </div>
        <button 
          onClick={() => {
            setNewQ('');
            setNewA('');
            setEditingId(null);
            setIsAdding(true);
          }}
          className="flex items-center space-x-2 bg-orange-600 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
        >
          <Plus size={18} />
          <span>Manifest Scroll</span>
        </button>
      </header>

      {isAdding && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-8 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Plus size={120} className="text-orange-500" />
          </div>
          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6">Question / Rune</label>
              <input 
                placeholder="The inquiry..." 
                value={newQ} 
                onChange={e => setNewQ(e.target.value)} 
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold italic outline-none focus:ring-2 focus:ring-orange-500 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6">Answer / Truth</label>
              <textarea 
                placeholder="The ancient wisdom..." 
                value={newA} 
                onChange={e => setNewA(e.target.value)} 
                rows={4} 
                className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-orange-100 font-bold italic outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all" 
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setIsAdding(false)} className="px-8 py-3 text-[10px] text-[#3f332c] font-black uppercase tracking-widest hover:text-orange-200/40 transition-all">Vanish</button>
              <button onClick={addCard} className="px-10 py-3.5 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95 transition-all">Seal Scroll</button>
            </div>
          </div>
        </motion.div>
      )}

      {cards.length > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="relative w-full max-w-xl aspect-[3/2] group">
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-full cursor-pointer perspective-2000"
            >
              <div className={`relative w-full h-full transition-all duration-1000 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 bg-[#2a221f] border border-[#3f332c] rounded-[4rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] group-hover:border-orange-500/30 transition-all">
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-orange-200/20 mb-8 italic">The Inquiry</span>
                  <p className="text-3xl font-black italic tracking-tighter text-orange-100 drop-shadow-lg uppercase leading-tight">{currentCard.question}</p>
                  <div className="absolute bottom-12 flex items-center space-x-3 text-orange-200/20 text-[9px] uppercase tracking-[0.3em] font-black group-hover:text-orange-500 transition-all">
                    <RotateCcw size={14} className="animate-spin-slow" />
                    <span>Click to Reveal Truth</span>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-[#3f332c] group-hover:border-orange-500/30 transition-all rounded-tl-xl" />
                  <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-[#3f332c] group-hover:border-orange-500/30 transition-all rounded-br-xl" />
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-orange-600 text-white rounded-[4rem] p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-[0_30px_60px_-12px_rgba(234,88,12,0.3)]">
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-orange-100/40 mb-8 italic">The Ancient Wisdom</span>
                  <p className="text-2xl font-black italic tracking-tight uppercase leading-relaxed">{currentCard.answer}</p>
                  
                  <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl" />
                  <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <button 
                onClick={() => startEdit(currentCard)}
                className="p-4 bg-[#2a221f] rounded-2xl shadow-xl border border-[#3f332c] text-[#3f332c] hover:text-orange-500 hover:border-orange-500/30 transition-all scale-90 hover:scale-100"
                title="Manifest Edits"
              >
                <Edit2 size={24} />
              </button>
              <button 
                onClick={() => deleteCard(currentCard.id)}
                className="p-4 bg-[#2a221f] rounded-2xl shadow-xl border border-[#3f332c] text-[#3f332c] hover:text-rose-500 hover:border-rose-500/30 transition-all scale-90 hover:scale-100"
                title="Incinerate Scroll"
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
              <span className="text-[10px] font-black text-orange-200/20 mb-3 tracking-[0.3em] uppercase italic">{currentIndex + 1} / {cards.length} Scrolls</span>
              <div className="flex space-x-1.5 bg-[#1a1614] p-2 rounded-full border border-[#3f332c]">
                {cards.map((_, i) => (
                  <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-6 bg-orange-600' : 'w-1.5 bg-[#3f332c]'}`} />
                ))}
              </div>
            </div>

            <button 
              disabled={currentIndex === cards.length - 1}
              onClick={() => { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }}
              className="w-16 h-16 rounded-[2rem] bg-[#2a221f] border border-[#3f332c] text-orange-200/20 hover:text-orange-500 hover:border-orange-500/30 disabled:opacity-5 transition-all shadow-xl active:scale-90"
            >
              <ChevronRight size={32} className="mx-auto" />
            </button>
          </div>

          {isFlipped && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex space-x-6 mt-16">
              <button className="px-10 py-4 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95">Forgotten (Hard)</button>
              <button className="px-10 py-4 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95">Vague (Medium)</button>
              <button className="px-10 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">Engraved (Easy)</button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
           <div className="w-24 h-24 bg-[#2a221f] rounded-[2rem] border border-[#3f332c] flex items-center justify-center opacity-20">
             <RotateCcw size={40} className="text-orange-500" />
           </div>
           <p className="text-orange-200/20 font-black italic uppercase tracking-[0.3em] text-sm">Sanctum is vacant of scrolls.</p>
           <button onClick={() => setIsAdding(true)} className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] hover:underline">Manifest your first rune</button>
        </div>
      )}
    </div>
  );
}
