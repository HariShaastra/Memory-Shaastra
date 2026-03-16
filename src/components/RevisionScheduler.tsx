import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, CheckCircle2, Clock, Edit2 } from 'lucide-react';
import { Revision } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

export default function RevisionScheduler() {
  const { revisions, setRevisions } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [examDate, setExamDate] = useState('');

  const addRevision = () => {
    if (!newSubject || !newChapter) return;
    
    if (editingId) {
      setRevisions(prev => prev.map(rev => 
        rev.id === editingId 
          ? { ...rev, subject: newSubject, chapter: newChapter, examDate: examDate || '' } 
          : rev
      ));
      setEditingId(null);
    } else {
      const rev: Revision = {
        id: Date.now().toString(),
        subject: newSubject,
        chapter: newChapter,
        dateStudied: new Date().toISOString(),
        examDate: examDate || '',
        completedDates: [],
        nextRevision: new Date(Date.now() + 86400000).toISOString()
      };
      setRevisions([rev, ...revisions]);
    }
    
    setNewSubject('');
    setNewChapter('');
    setExamDate('');
    setIsAdding(false);
  };

  const startEdit = (rev: Revision) => {
    setNewSubject(rev.subject);
    setNewChapter(rev.chapter);
    setExamDate(rev.examDate);
    setEditingId(rev.id);
    setIsAdding(true);
  };

  const deleteRevision = (id: string) => {
    setRevisions(prev => prev.filter(r => r.id !== id));
  };

  const markDone = (id: string) => {
    setRevisions(prev => prev.map(rev => {
      if (rev.id === id) {
        const now = new Date().toISOString();
        // Simple spaced repetition logic: next revision in 1, 3, 7, 14, 30 days
        const intervals = [1, 3, 7, 14, 30, 60, 90];
        const completedCount = rev.completedDates.length;
        const nextInterval = intervals[Math.min(completedCount, intervals.length - 1)];
        const nextDate = new Date(Date.now() + nextInterval * 86400000).toISOString();
        
        return {
          ...rev,
          completedDates: [...rev.completedDates, now],
          nextRevision: nextDate
        };
      }
      return rev;
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic serif">Revision Scheduler</h2>
          <p className="text-zinc-500 text-sm">Scientifically planned revision cycles for long-term memory.</p>
        </div>
        <button 
          onClick={() => {
            setNewSubject('');
            setNewChapter('');
            setExamDate('');
            setEditingId(null);
            setIsAdding(true);
          }}
          className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          <span>Add Chapter</span>
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input 
                type="text" 
                placeholder="Chapter Name"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }} 
                className="px-6 py-2 text-sm text-zinc-500 font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
              <button onClick={addRevision} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
                {editingId ? 'Update' : 'Schedule'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {revisions.map((rev) => (
          <div key={rev.id} className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{rev.chapter}</h3>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{rev.subject}</p>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Next Revision</p>
                <div className="flex items-center space-x-2 text-emerald-500">
                  <Clock size={14} />
                  <span className="text-sm font-bold">{new Date(rev.nextRevision).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="h-10 w-[1px] bg-zinc-200 hidden md:block" />

              <button 
                onClick={() => markDone(rev.id)}
                className="flex items-center space-x-2 bg-zinc-100 text-zinc-900 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
              >
                <CheckCircle2 size={16} />
                <span>Mark Done</span>
              </button>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => startEdit(rev)}
                  className="text-zinc-300 hover:text-emerald-500 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deleteRevision(rev.id)}
                  className="text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
