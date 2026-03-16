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
          <h2 className="text-3xl font-bold tracking-tight italic serif dark:text-white">Flashcards</h2>
          <p className="text-zinc-500 text-sm">{cards.length} cards in your library</p>
        </div>
        <button 
          onClick={() => {
            setNewQ('');
            setNewA('');
            setEditingId(null);
            setIsAdding(true);
          }}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          <span>Add Card</span>
        </button>
      </header>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="space-y-4">
            <input 
              placeholder="Question..." 
              value={newQ} 
              onChange={e => setNewQ(e.target.value)} 
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
            />
            <textarea 
              placeholder="Answer..." 
              value={newA} 
              onChange={e => setNewA(e.target.value)} 
              rows={3} 
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none dark:text-white" 
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-sm text-zinc-500 font-bold uppercase tracking-widest">Cancel</button>
              <button onClick={addCard} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">Save</button>
            </div>
          </div>
        </motion.div>
      )}

      {cards.length > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-xl aspect-[3/2]">
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-full cursor-pointer perspective-1000 group"
            >
              <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 bg-white dark:bg-[#151619] border border-zinc-200 dark:border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl transition-colors duration-500">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6 font-bold">Question</span>
                  <p className="text-2xl font-medium leading-relaxed text-zinc-900 dark:text-white">{currentCard.question}</p>
                  <div className="absolute bottom-10 flex items-center space-x-2 text-zinc-400 text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <RotateCcw size={12} />
                    <span>Click to flip</span>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-emerald-500 text-white rounded-[40px] p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-100 mb-6 font-bold">Answer</span>
                  <p className="text-xl font-medium leading-relaxed">{currentCard.answer}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute -right-16 top-0 flex flex-col gap-4">
              <button 
                onClick={() => startEdit(currentCard)}
                className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-white/10 text-zinc-400 hover:text-emerald-500 transition-all"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={() => deleteCard(currentCard.id)}
                className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-white/10 text-zinc-400 hover:text-rose-500 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="mt-12 flex items-center space-x-8">
            <button 
              disabled={currentIndex === 0}
              onClick={() => { setCurrentIndex(currentIndex - 1); setIsFlipped(false); }}
              className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono text-zinc-400 mb-1">{currentIndex + 1} / {cards.length}</span>
              <div className="flex space-x-1">
                {cards.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-white/10'}`} />
                ))}
              </div>
            </div>

            <button 
              disabled={currentIndex === cards.length - 1}
              onClick={() => { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }}
              className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {isFlipped && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex space-x-4 mt-12">
              <button className="px-8 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Hard</button>
              <button className="px-8 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 text-[10px] font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all">Medium</button>
              <button className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Easy</button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 italic text-sm">
          No flashcards yet. Create your first card to start learning.
        </div>
      )}
    </div>
  );
}
