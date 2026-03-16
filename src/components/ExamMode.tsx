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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setEditingPlan(null)} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft size={24} /></button>
            <h1 className="text-2xl font-bold">{isCreating ? 'Create Exam Plan' : 'Edit Exam Plan'}</h1>
          </div>
          <button 
            onClick={savePlan}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <Save size={18} /> Save Plan
          </button>
        </header>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Plan Title</label>
              <input 
                type="text"
                value={editingPlan.title}
                onChange={e => setEditingPlan({ ...editingPlan, title: e.target.value })}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Final Semester Exams"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Exam Date</label>
              <input 
                type="date"
                value={editingPlan.examDate}
                onChange={e => setEditingPlan({ ...editingPlan, examDate: e.target.value })}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Subjects & Topics</h2>
              <button 
                onClick={() => {
                  const newSubject: ExamSubject = { id: Math.random().toString(36).substr(2, 9), name: '', chapters: [] };
                  setEditingPlan({ ...editingPlan, subjects: [...editingPlan.subjects, newSubject] });
                }}
                className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
              >
                <Plus size={16} /> Add Subject
              </button>
            </div>

            <div className="space-y-4">
              {editingPlan.subjects.map((subject, sIndex) => (
                <div key={subject.id} className="p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="text"
                      value={subject.name}
                      onChange={e => {
                        const newSubjects = [...editingPlan.subjects];
                        newSubjects[sIndex].name = e.target.value;
                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                      }}
                      placeholder="Subject Name"
                      className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                    />
                    <button 
                      onClick={() => {
                        const newSubjects = editingPlan.subjects.filter((_, i) => i !== sIndex);
                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                      }}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="pl-6 space-y-4">
                    {subject.chapters.map((chapter, cIndex) => (
                      <div key={chapter.id} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <input 
                            type="text"
                            value={chapter.name}
                            onChange={e => {
                              const newSubjects = [...editingPlan.subjects];
                              newSubjects[sIndex].chapters[cIndex].name = e.target.value;
                              setEditingPlan({ ...editingPlan, subjects: newSubjects });
                            }}
                            placeholder="Chapter Name"
                            className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-sm outline-none"
                          />
                          <button 
                            onClick={() => {
                              const newSubjects = [...editingPlan.subjects];
                              newSubjects[sIndex].chapters = newSubjects[sIndex].chapters.filter((_, i) => i !== cIndex);
                              setEditingPlan({ ...editingPlan, subjects: newSubjects });
                            }}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Topics */}
                        <div className="pl-6 space-y-2">
                          {chapter.topics.map((topic, tIndex) => (
                            <div key={topic.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  value={topic.name}
                                  onChange={e => {
                                    const newSubjects = [...editingPlan.subjects];
                                    newSubjects[sIndex].chapters[cIndex].topics[tIndex].name = e.target.value;
                                    setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                  }}
                                  placeholder="Topic Name"
                                  className="flex-1 p-1.5 rounded-md bg-white border border-slate-200 text-xs outline-none"
                                />
                                <button 
                                  onClick={() => {
                                    const newSubjects = [...editingPlan.subjects];
                                    newSubjects[sIndex].chapters[cIndex].topics = newSubjects[sIndex].chapters[cIndex].topics.filter((_, i) => i !== tIndex);
                                    setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                  }}
                                  className="text-slate-300 hover:text-rose-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {/* Subtopics */}
                              <div className="pl-6 space-y-1">
                                {topic.subTopics.map((sub, stIndex) => (
                                  <div key={sub.id} className="flex items-center gap-2">
                                    <input 
                                      type="text"
                                      value={sub.name}
                                      onChange={e => {
                                        const newSubjects = [...editingPlan.subjects];
                                        newSubjects[sIndex].chapters[cIndex].topics[tIndex].subTopics[stIndex].name = e.target.value;
                                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                      }}
                                      placeholder="Subtopic Name"
                                      className="flex-1 p-1 rounded-md bg-white border border-slate-200 text-[10px] outline-none"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newSubjects = [...editingPlan.subjects];
                                        newSubjects[sIndex].chapters[cIndex].topics[tIndex].subTopics = newSubjects[sIndex].chapters[cIndex].topics[tIndex].subTopics.filter((_, i) => i !== stIndex);
                                        setEditingPlan({ ...editingPlan, subjects: newSubjects });
                                      }}
                                      className="text-slate-300 hover:text-rose-500"
                                    >
                                      <X size={12} />
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
                                  className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1"
                                >
                                  <Plus size={10} /> Add Subtopic
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
                            className="text-xs text-emerald-500 hover:underline flex items-center gap-1"
                          >
                            <Plus size={12} /> Add Topic
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
                      className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Chapter
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft size={24} /></button>
            <h1 className="text-2xl font-bold">Exam Plans</h1>
          </div>
          <button 
            onClick={createNewPlan}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Create New Plan
          </button>
        </header>

        {examPlans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Target size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No exam plans created yet.</p>
            <button onClick={createNewPlan} className="mt-4 text-emerald-600 font-bold hover:underline">Create your first plan</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examPlans.map(plan => (
              <div 
                key={plan.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group"
                onClick={() => setActivePlanId(plan.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-emerald-600 transition-colors">{plan.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <Calendar size={14} /> {plan.examDate || 'No date set'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingPlan(plan); setIsCreating(false); }}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(plan.id); }}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>Subjects</span>
                    <span>{plan.subjects.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.subjects.slice(0, 3).map(s => (
                      <span key={s.id} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                        {s.name}
                      </span>
                    ))}
                    {plan.subjects.length > 3 && (
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400">
                        +{plan.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {confirmDeleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Delete Plan?</h2>
                <p className="text-slate-500 mb-8">This action cannot be undone. All subjects and topics in this plan will be lost.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => deletePlan(confirmDeleteId)}
                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
                  >
                    Delete
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
      return accC + c.topics.filter(t => t.completed).length;
    }, 0);
  }, 0);

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setActivePlanId(null)} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft size={24} /></button>
          <h1 className="text-2xl font-bold">{activePlan.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setEditingPlan(activePlan); setIsCreating(false); }}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Edit Plan
          </button>
          <button 
            onClick={() => deletePlan(activePlan.id)}
            className="text-sm text-slate-500 hover:text-rose-600 underline"
          >
            Delete
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Exam Date</p>
            <p className="text-lg font-bold">{activePlan.examDate || 'Not set'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Topics Remaining</p>
            <p className="text-lg font-bold">{totalItems - completedItems} / {totalItems}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Progress</p>
            <div className="flex items-center gap-3">
              <p className="text-lg font-bold">{progress}%</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revision Schedule */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-amber-500" />
              Revision Schedule
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
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {activePlan.revisionSchedule.map((item, i) => (
              <div key={item.id} className="p-5 bg-white rounded-2xl border border-slate-200 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${item.completed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const updated = { ...activePlan };
                        updated.revisionSchedule[i].completed = !updated.revisionSchedule[i].completed;
                        updatePlan(updated);
                      }}
                      className={`transition-colors ${item.completed ? 'text-emerald-500' : 'text-slate-300'}`}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <div>
                      <input 
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const updated = { ...activePlan };
                          updated.revisionSchedule[i].label = e.target.value;
                          updatePlan(updated);
                        }}
                        className="font-bold text-sm bg-transparent border-none p-0 outline-none w-full"
                      />
                      <input 
                        type="date"
                        value={item.date}
                        onChange={(e) => {
                          const updated = { ...activePlan };
                          updated.revisionSchedule[i].date = e.target.value;
                          updatePlan(updated);
                        }}
                        className="text-xs text-slate-500 mt-1 bg-transparent border-none p-0 outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = { ...activePlan, revisionSchedule: activePlan.revisionSchedule.filter(s => s.id !== item.id) };
                      updatePlan(updated);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects & Nested Topics */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <List className="text-indigo-500" />
            Subjects & Topics
          </h2>
          <div className="space-y-6">
            {activePlan.subjects.map((subject, sIndex) => (
              <div key={subject.id} className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  {subject.name}
                </h3>
                
                <div className="space-y-4 pl-4">
                  {subject.chapters.map((chapter, cIndex) => (
                    <div key={chapter.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <BookOpen size={16} className="text-slate-400" />
                          {chapter.name}
                        </h4>
                        <button 
                          onClick={() => {
                            const updated = { ...activePlan };
                            const allCompleted = chapter.topics.every(t => t.completed);
                            updated.subjects[sIndex].chapters[cIndex].topics.forEach(t => t.completed = !allCompleted);
                            updatePlan(updated);
                          }}
                          className={`text-xs font-bold transition-colors ${chapter.topics.every(t => t.completed) ? 'text-emerald-600' : 'text-slate-400'}`}
                        >
                          {chapter.topics.every(t => t.completed) ? 'All Done' : 'Mark All'}
                        </button>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {chapter.topics.map((topic, tIndex) => (
                          <div key={topic.id} className="space-y-2">
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-3 flex-1">
                                <button 
                                  onClick={() => {
                                    const updated = { ...activePlan };
                                    updated.subjects[sIndex].chapters[cIndex].topics[tIndex].completed = !topic.completed;
                                    updatePlan(updated);
                                  }}
                                  className={`transition-colors ${topic.completed ? 'text-emerald-500' : 'text-slate-300'}`}
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <span className={`text-sm font-medium ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {topic.name}
                                </span>
                              </div>
                            </div>

                            {/* Subtopics */}
                            {topic.subTopics.length > 0 && (
                              <div className="ml-7 pl-4 border-l-2 border-slate-100 space-y-2">
                                {topic.subTopics.map((sub, stIndex) => (
                                  <div key={sub.id} className="flex items-center gap-3">
                                    <button 
                                      onClick={() => {
                                        const updated = { ...activePlan };
                                        updated.subjects[sIndex].chapters[cIndex].topics[tIndex].subTopics[stIndex].completed = !sub.completed;
                                        updatePlan(updated);
                                      }}
                                      className={`transition-colors ${sub.completed ? 'text-emerald-500' : 'text-slate-300'}`}
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 ${sub.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`} />
                                    </button>
                                    <span className={`text-xs ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
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
