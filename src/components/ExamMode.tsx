import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Clock,
  ChevronRight,
  ChevronDown,
  Edit2,
  Save,
  X,
  List
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';
import { ExamPlan, ExamSubject, ExamChapter, ExamTopic, ExamSubTopic, RevisionScheduleItem } from '../types';

export const ExamMode: React.FC = () => {
  const { goBack, examPlans, setExamPlans } = useAppContext();

  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ExamPlan | null>(null);

  const activePlan = examPlans.find(p => p.id === activePlanId);

  const generateRevisionSchedule = (examDateStr: string): RevisionScheduleItem[] => {
    const today = new Date();
    const examDate = new Date(examDateStr);
    const schedule: RevisionScheduleItem[] = [];

    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const studyDay = today;
    const nextDay = addDays(studyDay, 1);
    const day5 = addDays(studyDay, 5);
    const day10 = addDays(studyDay, 10);
    const day25 = addDays(studyDay, 25);
    const beforeExam = addDays(examDate, -1);

    const checkAndAdd = (date: Date, label: string) => {
      if (date < examDate) {
        schedule.push({
          id: Math.random().toString(36).substr(2, 9),
          label,
          date: date.toISOString().split('T')[0],
          completed: false
        });
      }
    };

    checkAndAdd(studyDay, 'Study Day');
    checkAndAdd(nextDay, 'Next Day Revision');
    checkAndAdd(day5, '5 Days Revision');
    checkAndAdd(day10, '10 Days Revision');
    checkAndAdd(day25, '25 Days Revision');
    checkAndAdd(beforeExam, 'Before Exam Revision');

    return schedule;
  };

  const createNewPlan = () => {
    const newPlan: ExamPlan = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Exam Plan',
      examDate: '',
      subjects: [],
      phases: [],
      revisionSchedule: [],
      isActive: true
    };
    setEditingPlan(newPlan);
    setIsCreating(true);
  };

  const savePlan = () => {
    if (!editingPlan) return;
    
    // Generate schedule if it's new or date changed
    const existingPlan = examPlans.find(p => p.id === editingPlan.id);
    let updatedPlan = { ...editingPlan };
    
    if (editingPlan.examDate && (!existingPlan || existingPlan.examDate !== editingPlan.examDate)) {
      updatedPlan.revisionSchedule = generateRevisionSchedule(editingPlan.examDate);
    }

    if (isCreating) {
      setExamPlans([...examPlans, updatedPlan]);
    } else {
      setExamPlans(examPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    }
    
    setEditingPlan(null);
    setIsCreating(false);
    setActivePlanId(updatedPlan.id);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deletePlan = (id: string) => {
    setExamPlans(examPlans.filter(p => p.id !== id));
    if (activePlanId === id) setActivePlanId(null);
    setConfirmDeleteId(null);
  };

  const updatePlan = (updated: ExamPlan) => {
    setExamPlans(examPlans.map(p => p.id === updated.id ? updated : p));
  };

  if (editingPlan) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setEditingPlan(null)} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all"><ChevronLeft size={24} /></button>
            <h1 className="text-3xl font-black text-orange-100 italic uppercase tracking-tighter">{isCreating ? 'Forge Exam Plan' : 'Refine Exam Plan'}</h1>
          </div>
          <button 
            onClick={savePlan}
            className="px-8 py-4 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Save size={18} /> Seal Plan
          </button>
        </header>

        <div className="bg-[#2a221f] p-10 rounded-[4rem] shadow-2xl border border-[#3f332c] space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-orange-200/40 uppercase tracking-[0.2em] ml-6">Plan Title</label>
              <input 
                type="text"
                value={editingPlan.title}
                onChange={e => setEditingPlan({ ...editingPlan, title: e.target.value })}
                className="w-full p-5 rounded-2xl bg-[#1a1614] border border-[#3f332c] outline-none focus:ring-2 focus:ring-orange-500 text-orange-100 font-bold italic"
                placeholder="e.g. Final Semester Exams"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-orange-200/40 uppercase tracking-[0.2em] ml-6">Exam Date</label>
              <input 
                type="date"
                value={editingPlan.examDate}
                onChange={e => setEditingPlan({ ...editingPlan, examDate: e.target.value })}
                className="w-full p-5 rounded-2xl bg-[#1a1614] border border-[#3f332c] outline-none focus:ring-2 focus:ring-orange-500 text-orange-100 font-bold"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-orange-100 uppercase italic tracking-tight">Subjects & Topics</h2>
              <button 
                onClick={() => {
                  const newSubject: ExamSubject = { id: Math.random().toString(36).substr(2, 9), name: '', chapters: [] };
                  setEditingPlan({ ...editingPlan, subjects: [...editingPlan.subjects, newSubject] });
                }}
                className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest hover:text-orange-400 transition-all bg-[#1a1614] px-5 py-2.5 rounded-full border border-[#3f332c]"
              >
                <Plus size={14} /> Add Subject
              </button>
            </div>

            <div className="space-y-6">
              {editingPlan.subjects.map((subject, sIndex) => (
                <div key={subject.id} className="p-8 rounded-[3rem] border border-[#3f332c] bg-[#1a1614]/50 space-y-6 relative overflow-hidden">
                  <div className="flex items-center gap-4 relative z-10">
                    <input 
                      type="text"
                      value={subject.name}
                      onChange={e => {
                        const newSubjects = [...editingPlan.subjects];
                        newSubjects[sIndex].name = e.target.value;
                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                      }}
                      placeholder="Subject Name"
                      className="flex-1 p-4 rounded-xl bg-[#1a1614] border border-[#3f332c] outline-none text-orange-100 font-black italic text-lg"
                    />
                    <button 
                      onClick={() => {
                        const newSubjects = editingPlan.subjects.filter((_, i) => i !== sIndex);
                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                      }}
                      className="p-3 text-[#3f332c] hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>

                  <div className="pl-6 space-y-4 relative z-10">
                    {subject.chapters.map((chapter, cIndex) => (
                      <div key={chapter.id} className="space-y-4 p-6 bg-[#1a1614] rounded-[2.5rem] border border-[#3f332c]">
                        <div className="flex items-center gap-4">
                          <input 
                            type="text"
                            value={chapter.name}
                            onChange={e => {
                              const newSubjects = [...editingPlan.subjects];
                              newSubjects[sIndex].chapters[cIndex].name = e.target.value;
                              setEditingPlan({ ...editingPlan, subjects: newSubjects });
                            }}
                            placeholder="Chapter Name"
                            className="flex-1 p-3 rounded-xl bg-[#2a221f] border border-[#3f332c] outline-none text-orange-100 font-bold italic"
                          />
                          <button 
                            onClick={() => {
                              const newSubjects = [...editingPlan.subjects];
                              newSubjects[sIndex].chapters = newSubjects[sIndex].chapters.filter((_, i) => i !== cIndex);
                              setEditingPlan({ ...editingPlan, subjects: newSubjects });
                            }}
                            className="p-2 text-[#3f332c] hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Topics */}
                        <div className="pl-8 space-y-3">
                          {chapter.topics.map((topic, tIndex) => (
                            <div key={topic.id} className="space-y-3">
                              <div className="flex items-center gap-3">
                                <input 
                                  type="text"
                                  value={topic.name}
                                  onChange={e => {
                                    const newSubjects = [...editingPlan.subjects];
                                    newSubjects[sIndex].chapters[cIndex].topics[tIndex].name = e.target.value;
                                    setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                  }}
                                  placeholder="Topic Name"
                                  className="flex-1 p-2.5 rounded-xl bg-orange-600/5 border border-orange-500/10 outline-none text-orange-100/80 font-bold text-sm italic"
                                />
                                <button 
                                  onClick={() => {
                                    const newSubjects = [...editingPlan.subjects];
                                    newSubjects[sIndex].chapters[cIndex].topics = newSubjects[sIndex].chapters[cIndex].topics.filter((_, i) => i !== tIndex);
                                    setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                  }}
                                  className="text-[#3f332c] hover:text-rose-500 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              {/* Subtopics */}
                              <div className="pl-8 space-y-2">
                                {topic.subTopics.map((sub, stIndex) => (
                                  <div key={sub.id} className="flex items-center gap-3">
                                    <input 
                                      type="text"
                                      value={sub.name}
                                      onChange={e => {
                                        const newSubjects = [...editingPlan.subjects];
                                        newSubjects[sIndex].chapters[cIndex].topics[tIndex].subTopics[stIndex].name = e.target.value;
                                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                      }}
                                      placeholder="Subtopic Name"
                                      className="flex-1 p-2 rounded-lg bg-orange-600/5 border border-orange-500/5 outline-none text-orange-200/50 font-medium text-xs italic"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newSubjects = [...editingPlan.subjects];
                                        newSubjects[sIndex].chapters[cIndex].topics[tIndex].subTopics = newSubjects[sIndex].chapters[cIndex].topics[tIndex].subTopics.filter((_, i) => i !== stIndex);
                                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                      }}
                                      className="text-[#3f332c] hover:text-rose-500 transition-all"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  onClick={() => {
                                    const newSubjects = [...editingPlan.subjects];
                                    const newSub: ExamSubTopic = { id: Math.random().toString(36).substr(2, 9), name: '', completed: false };
                                    newSubjects[sIndex].chapters[cIndex].topics[tIndex].subTopics.push(newSub);
                                    setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                  }}
                                  className="text-[10px] text-orange-500/50 hover:text-orange-500 transition-all font-black uppercase tracking-widest flex items-center gap-2 ml-2"
                                >
                                  <Plus size={12} /> Add Subtopic
                                </button>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newSubjects = [...editingPlan.subjects];
                              const newTopic: ExamTopic = { id: Math.random().toString(36).substr(2, 9), name: '', completed: false, subTopics: [] };
                              newSubjects[sIndex].chapters[cIndex].topics.push(newTopic);
                              setEditingPlan({ ...editingPlan, subjects: newSubjects });
                            }}
                            className="text-xs text-orange-500 uppercase font-black tracking-widest flex items-center gap-2 ml-2 hover:text-orange-400 transition-all"
                          >
                            <Plus size={14} /> Add Topic
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newSubjects = [...editingPlan.subjects];
                        const newChapter: ExamChapter = { id: Math.random().toString(36).substr(2, 9), name: '', completed: false, topics: [] };
                        newSubjects[sIndex].chapters.push(newChapter);
                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                      }}
                      className="text-sm text-orange-500 font-black uppercase tracking-widest flex items-center gap-2 ml-2 hover:text-orange-400 transition-all"
                    >
                      <Plus size={16} /> Add Chapter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activePlanId) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-3 bg-[#2a221f] rounded-2xl shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all"><ChevronLeft size={24} /></button>
            <div>
              <h1 className="text-3xl font-black text-orange-100 italic uppercase tracking-tighter">Exam Sanctums</h1>
              <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Strategic Study Planning</p>
            </div>
          </div>
          <button 
            onClick={createNewPlan}
            className="px-10 py-5 bg-orange-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-3"
          >
            <Plus size={20} /> Manifest New Plan
          </button>
        </header>

        {examPlans.length === 0 ? (
          <div className="text-center py-24 bg-[#2a221f]/30 rounded-[5rem] border-2 border-dashed border-[#3f332c] flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-600/5 blur-[100px] pointer-events-none" />
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-orange-600/10 blur-[40px] rounded-full" />
              <MaanasMascot size={200} expression="encouraging" />
            </div>
            <p className="text-orange-200/20 font-black italic uppercase tracking-[0.3em] text-xs max-w-xs mx-auto leading-relaxed relative z-10">Your mental sanctum is waiting for its first scroll. Manifest your destiny, explorer.</p>
            <button onClick={createNewPlan} className="mt-8 px-12 py-5 bg-orange-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-orange-700 transition-all active:scale-95 shadow-2xl shadow-orange-600/30 relative z-10">Manifest First Scroll</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {examPlans.map(plan => (
              <div 
                key={plan.id}
                className="bg-[#2a221f] p-10 rounded-[4rem] border border-[#3f332c] hover:bg-[#2d2522] hover:border-orange-500/30 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                onClick={() => setActivePlanId(plan.id)}
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-orange-100 group-hover:text-orange-500 transition-colors italic uppercase tracking-tight">{plan.title}</h3>
                      <p className="text-[10px] text-orange-200/40 font-black uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500/50" /> {plan.examDate || 'Eternal Wait'}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingPlan(plan); setIsCreating(false); }}
                        className="p-3 text-orange-200/20 hover:text-orange-400 bg-white/5 rounded-2xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(plan.id); }}
                        className="p-3 text-orange-200/20 hover:text-rose-500 bg-white/5 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[#3f332c] space-y-4">
                    <div className="flex items-center justify-between text-[9px] font-black text-orange-200/20 uppercase tracking-[0.2em]">
                      <span>Scrolls (Subjects)</span>
                      <span>{plan.subjects.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {plan.subjects.slice(0, 3).map(s => (
                        <span key={s.id} className="px-4 py-1.5 bg-[#1a1614] rounded-2xl text-[9px] font-black text-orange-200/30 uppercase tracking-widest border border-[#3f332c]">
                          {s.name}
                        </span>
                      ))}
                      {plan.subjects.length > 3 && (
                        <span className="px-4 py-1.5 bg-[#1a1614] rounded-2xl text-[9px] font-black text-[#3f332c] uppercase tracking-widest border border-[#3f332c]">
                          +{plan.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 flex justify-center">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                    Enter Plan <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {confirmDeleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#2a221f] w-full max-w-sm rounded-[3.5rem] p-12 shadow-2xl border border-[#3f332c] text-center"
              >
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                  <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-orange-100 italic uppercase mb-4">Dissolve Plan?</h2>
                <p className="text-orange-100/40 font-bold mb-10 italic">This scroll will be incinerated. All subjects and topics within will be lost forever.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#3f332c] hover:text-orange-200/40 transition-all"
                  >
                    Keep It
                  </button>
                  <button 
                    onClick={() => deletePlan(confirmDeleteId)}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95"
                  >
                    Incinerate
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Dashboard View for Active Plan
  const totalItems = activePlan.subjects.reduce((acc, s) => {
    return acc + s.chapters.reduce((accC, c) => {
      return accC + (c.topics.length || 1); // If no topics, count chapter as 1
    }, 0);
  }, 0);

  const completedItems = activePlan.subjects.reduce((acc, s) => {
    return acc + s.chapters.reduce((accC, c) => {
      return accC + (c.topics.filter(t => t.completed).length || 0);
    }, 0);
  }, 0);

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => setActivePlanId(null)} className="p-4 bg-[#2a221f] rounded-[1.5rem] shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-4xl font-black text-orange-100 italic tracking-tighter uppercase drop-shadow-sm">{activePlan.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-950/30 px-3 py-1 rounded-full border border-orange-500/20 italic">Commander Mode</span>
              <span className="text-[10px] text-orange-200/20 font-black uppercase tracking-[0.2em]">Target Date: {activePlan.examDate || 'The Unknown'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setEditingPlan(activePlan); setIsCreating(false); }}
            className="flex items-center gap-3 px-8 py-4 bg-[#2a221f] border border-[#3f332c] rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-orange-200/50 hover:bg-[#322925] hover:text-orange-100 transition-all shadow-sm active:scale-95"
          >
            <Edit2 size={16} /> Refine Scroll
          </button>
          <button 
            onClick={() => setConfirmDeleteId(activePlan.id)}
            className="text-[10px] text-rose-500/40 hover:text-rose-500 font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Abondon Quest
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-[#2a221f] p-10 rounded-[3.5rem] border border-[#3f332c] flex flex-col justify-between group hover:border-orange-500/20 transition-all shadow-sm">
          <div className="w-16 h-16 bg-orange-600/5 text-orange-500 rounded-[1.5rem] flex items-center justify-center border border-orange-500/10 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-[10px] text-orange-200/20 uppercase tracking-[0.2em] font-black mb-2">Judgment Day</p>
            <p className="text-2xl font-black text-orange-100 italic capitalize tracking-tighter">{activePlan.examDate || 'Eternal'}</p>
          </div>
        </div>
        
        <div className="bg-[#2a221f] p-10 rounded-[3.5rem] border border-[#3f332c] flex flex-col justify-between group hover:border-indigo-500/20 transition-all shadow-sm">
          <div className="w-16 h-16 bg-indigo-500/5 text-indigo-400 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/10 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-[10px] text-orange-200/20 uppercase tracking-[0.2em] font-black mb-2">Scroll Mastery</p>
            <p className="text-2xl font-black text-orange-100 italic capitalize tracking-tighter">{totalItems - completedItems} / {totalItems} Left</p>
          </div>
        </div>

        <div className="bg-[#2a221f] p-10 rounded-[3.5rem] border border-[#3f332c] col-span-1 md:col-span-2 flex flex-col justify-between group hover:border-emerald-500/20 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-emerald-500/5 text-emerald-400 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
              <TrendingUp size={28} />
            </div>
            <p className="text-4xl font-black text-orange-100 italic tracking-tighter">{progress}%</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] text-orange-200/20 uppercase tracking-[0.2em] font-black">
              <span>Overall Achievement</span>
              <span>Completion Velocity</span>
            </div>
            <div className="h-2.5 bg-[#1a1614] rounded-full overflow-hidden border border-[#3f332c] shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Revision Schedule */}
        <div className="lg:col-span-1 space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-orange-100 uppercase italic tracking-tight flex items-center gap-4">
              <Clock className="text-orange-500" size={24} />
              Chronology
            </h2>
            <button 
              onClick={() => {
                const newItem: RevisionScheduleItem = {
                  id: Math.random().toString(36).substr(2, 9),
                  label: 'Custom Revision',
                  date: new Date().toISOString().split('T')[0],
                  completed: false
                };
                const updated = { ...activePlan, revisionSchedule: [...activePlan.revisionSchedule, newItem] };
                updatePlan(updated);
              }}
              className="p-2.5 text-orange-500 hover:text-white hover:bg-orange-600 transition-all bg-[#1a1614] rounded-xl border border-[#3f332c]"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-6 relative ml-4 px-2">
            <div className="absolute top-0 left-[-16px] w-[2px] h-full bg-[#3f332c] z-0" />
            {activePlan.revisionSchedule.map((item, i) => (
              <div key={item.id} className="relative z-10 p-6 bg-[#2a221f] rounded-[2.5rem] border border-[#3f332c] group hover:bg-[#2d2522] transition-all shadow-sm">
                <div className={`absolute left-[-26px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-[#1a1614] transition-all ${item.completed ? 'bg-emerald-500 scale-125' : 'bg-orange-500 hover:scale-110'}`} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 group/item cursor-pointer" 
                    onClick={() => {
                      const updated = { ...activePlan };
                      updated.revisionSchedule[i].completed = !updated.revisionSchedule[i].completed;
                      updatePlan(updated);
                    }}
                  >
                    <div className={`transition-all ${item.completed ? 'text-emerald-500' : 'text-[#3f332c] group-hover/item:text-orange-500'}`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-tight transition-all ${item.completed ? 'text-orange-200/20 line-through italic' : 'text-orange-100'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${item.completed ? 'text-orange-200/10' : 'text-orange-200/30'}`}>
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = { ...activePlan, revisionSchedule: activePlan.revisionSchedule.filter(s => s.id !== item.id) };
                      updatePlan(updated);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-[#3f332c] hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects & Nested Topics */}
        <div className="lg:col-span-3 space-y-10">
          <h2 className="text-2xl font-black text-orange-100 uppercase italic tracking-tight flex items-center gap-6 px-4">
            <List className="text-orange-500" size={32} />
            The Master Ledger
          </h2>
          <div className="space-y-12 px-2">
            {activePlan.subjects.map((subject, sIndex) => (
              <div key={subject.id} className="space-y-8 bg-[#2a221f]/50 p-10 rounded-[4.5rem] border border-[#3f332c]/50">
                <div className="flex items-center justify-between border-b border-[#3f332c] pb-8">
                  <h3 className="font-black text-orange-100 flex items-center gap-6 text-3xl italic uppercase tracking-tighter drop-shadow-sm">
                    <div className="w-4 h-12 bg-orange-600 rounded-full" />
                    {subject.name}
                  </h3>
                  <div className="flex gap-4">
                     <span className="text-[10px] font-black text-orange-200/20 uppercase tracking-[0.2em]">{subject.chapters.length} Scrolls</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {subject.chapters.map((chapter, cIndex) => (
                    <div key={chapter.id} className="bg-[#2a221f] rounded-[3rem] border border-[#3f332c] overflow-hidden group hover:border-orange-500/20 transition-all shadow-sm">
                      <div className="p-8 bg-[#1a1614] border-b border-[#3f332c] flex items-center justify-between">
                        <h4 className="font-black text-orange-100 italic uppercase tracking-tight flex items-center gap-4 text-base">
                          <BookOpen size={20} className="text-orange-500" />
                          {chapter.name}
                        </h4>
                        <button 
                          onClick={() => {
                            const updated = { ...activePlan };
                            const allCompleted = chapter.topics.every(t => t.completed);
                            updated.subjects[sIndex].chapters[cIndex].topics.forEach(t => t.completed = !allCompleted);
                            updatePlan(updated);
                          }}
                          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all px-4 py-1.5 rounded-full border ${chapter.topics.every(t => t.completed) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'text-orange-200/20 hover:text-orange-500 border-[#3f332c]'}`}
                        >
                          {chapter.topics.every(t => t.completed) ? 'Conquered' : 'Conquer All'}
                        </button>
                      </div>
                      
                      <div className="p-8 space-y-6">
                        {chapter.topics.length === 0 ? (
                           <p className="text-[10px] font-black text-orange-200/10 uppercase tracking-[0.2em] italic text-center py-4">Scroll is empty</p>
                        ) : chapter.topics.map((topic, tIndex) => (
                          <div key={topic.id} className="space-y-4">
                            <div className="flex items-center justify-between group/topic cursor-pointer"
                              onClick={() => {
                                const updated = { ...activePlan };
                                updated.subjects[sIndex].chapters[cIndex].topics[tIndex].completed = !topic.completed;
                                updatePlan(updated);
                              }}
                            >
                              <div className="flex items-center gap-5 flex-1">
                                <div className={`transition-all ${topic.completed ? 'text-emerald-500' : 'text-[#3f332c] group-hover/topic:text-orange-500'}`}>
                                  <CheckCircle2 size={22} />
                                </div>
                                <span className={`text-base font-bold transition-all italic tracking-tight uppercase ${topic.completed ? 'text-orange-200/10 line-through' : 'text-orange-100/80 group-hover/topic:text-orange-100'}`}>
                                  {topic.name}
                                </span>
                              </div>
                            </div>

                            {/* Subtopics */}
                            {topic.subTopics.length > 0 && (
                              <div className="ml-8 pl-6 border-l-2 border-[#1a1614] space-y-3">
                                {topic.subTopics.map((sub, stIndex) => (
                                  <div key={sub.id} className="flex items-center gap-4 group/sub cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = { ...activePlan };
                                      updated.subjects[sIndex].chapters[cIndex].topics[tIndex].subTopics[stIndex].completed = !sub.completed;
                                      updatePlan(updated);
                                    }}
                                  >
                                    <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${sub.completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110' : 'border-[#3f332c] group-hover/sub:border-orange-500 scale-100'}`} />
                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${sub.completed ? 'text-orange-200/10 line-through italic' : 'text-orange-200/40 group-hover/sub:text-orange-200/60'}`}>
                                      {sub.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
