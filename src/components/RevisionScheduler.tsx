import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Calendar, CheckCircle2, Clock, Edit2, ChevronLeft, Zap, Sparkles, Brain } from 'lucide-react';
import { Revision } from '../types';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';

export default function RevisionScheduler() {
  const { revisions, setRevisions, goBack, addXP } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [examDate, setExamDate] = useState('');
  const [nextRevisionDate, setNextRevisionDate] = useState('');

  const addRevision = () => {
    if (!newSubject || !newChapter) return;
    
    if (editingId) {
      setRevisions(prev => prev.map(rev => 
        rev.id === editingId 
          ? { 
              ...rev, 
              subject: newSubject, 
              chapter: newChapter, 
              examDate: examDate || '',
              nextRevision: nextRevisionDate ? new Date(nextRevisionDate).toISOString() : rev.nextRevision
            } 
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
        nextRevision: nextRevisionDate ? new Date(nextRevisionDate).toISOString() : new Date(Date.now() + 86400000).toISOString()
      };
      setRevisions([rev, ...revisions]);
      addXP(50);
    }
    
    setNewSubject('');
    setNewChapter('');
    setExamDate('');
    setNextRevisionDate('');
    setIsAdding(false);
  };

  const startEdit = (rev: Revision) => {
    setNewSubject(rev.subject);
    setNewChapter(rev.chapter);
    setExamDate(rev.examDate);
    setNextRevisionDate(new Date(rev.nextRevision).toISOString().split('T')[0]);
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
        const intervals = [1, 3, 7, 14, 30, 60, 90];
        const completedCount = rev.completedDates.length;
        const nextInterval = intervals[Math.min(completedCount, intervals.length - 1)];
        const nextDate = new Date(Date.now() + nextInterval * 86400000).toISOString();
        
        addXP(75);
        
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
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div>
            <h2 className="text-3xl font-black tracking-tight italic font-display text-orange-100 uppercase">Revision Hall</h2>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Master of Spaced Repetition</p>
           </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>Schedule Review</span>
          </button>
        )}
      </header>

      {isAdding ? (
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2a221f] border border-[#3f332c] rounded-[3rem] p-10 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-500/20">
                <Brain size={28} />
              </div>
              <h3 className="text-2xl font-black text-orange-100 uppercase tracking-tighter italic">Plan Your Recall</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Subject</p>
                  <input 
                    type="text"
                    placeholder="e.g. History"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Chapter</p>
                  <input 
                    type="text"
                    placeholder="e.g. World War II"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Exam Date (Optional)</p>
                  <input 
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-black text-orange-200/40 tracking-widest ml-2">Next Review Date</p>
                  <input 
                    type="date"
                    value={nextRevisionDate}
                    onChange={(e) => setNextRevisionDate(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-orange-200/30">Cancel</button>
                <button onClick={addRevision} className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-orange-600/20 active:scale-95">Save Schedule</button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gradient-to-br from-[#2a221f] to-[#1a1614] rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden shadow-2xl border border-[#3f332c]">
             <div className="absolute top-0 right-0 p-12 opacity-5">
               <Zap size={200} fill="currentColor" />
             </div>
             
             <div className="flex items-center gap-8 relative z-10">
                <MaanasMascot size={150} expression="proud" />
                <div>
                   <h3 className="text-3xl font-black tracking-tighter italic uppercase mb-2 text-orange-100">Forget No More!</h3>
                   <p className="text-orange-200/60 font-medium max-w-sm italic">Maanas says: Spaced repetition is the secret of the masters. You have {revisions.length} active review cycles.</p>
                </div>
             </div>
             
             <div className="mt-8 md:mt-0 relative z-10 flex flex-col items-center gap-2">
                <div className="text-5xl font-black font-display italic tracking-tighter text-orange-500">{revisions.length}</div>
                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-200/40">Active Chapters</div>
             </div>
          </div>

          <div className="space-y-4">
            {revisions.map((rev) => (
              <motion.div 
                layout
                key={rev.id} 
                className="bg-[#2a221f] border border-[#3f332c] rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-sm hover:bg-[#2d2522] transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1614] text-orange-500 flex items-center justify-center border border-[#3f332c] group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-orange-100 tracking-tight italic">{rev.chapter}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-orange-500 font-black">{rev.subject}</span>
                      <span className="w-1 h-1 bg-[#3f332c] rounded-full" />
                      <span className="text-[10px] uppercase tracking-widest text-orange-200/40 font-black">{rev.completedDates.length} reviews done</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="flex flex-col items-center md:items-end">
                    <p className="text-[10px] uppercase tracking-widest text-orange-200/40 font-black mb-1">Next Review</p>
                    <div className="flex items-center gap-2 text-orange-400">
                      <Clock size={16} />
                      <span className="text-lg font-black italic">{new Date(rev.nextRevision).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="h-12 w-[2px] bg-[#3f332c] hidden md:block" />

                  <button 
                    onClick={() => markDone(rev.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                  >
                    <Sparkles size={16} className="text-amber-400" />
                    <span>Recall Complete</span>
                  </button>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(rev)} className="p-3 text-orange-200/40 hover:text-orange-100 bg-white/5 rounded-2xl transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => deleteRevision(rev.id)} className="p-3 text-orange-200/40 hover:text-rose-500 bg-white/5 rounded-2xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              </motion.div>
            ))}

            {revisions.length === 0 && (
              <div className="text-center py-24 bg-[#2a221f]/30 rounded-[3rem] border-2 border-dashed border-[#3f332c]">
                <Calendar size={48} className="mx-auto text-orange-200/10 mb-4" />
                <p className="text-orange-200/20 font-black uppercase tracking-widest italic text-xs">No chapters scheduled for revision</p>
                <button onClick={() => setIsAdding(true)} className="mt-4 text-orange-500 font-black uppercase text-[10px] hover:underline">Start your first cycle</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
