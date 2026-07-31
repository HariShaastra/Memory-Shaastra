import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Edit2, 
  HelpCircle,
  TrendingUp,
  X,
  Search,
  Play,
  LayoutGrid,
  LayoutList,
  Sparkles,
  Flame,
  Zap,
  Check
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ExamPlan, ExamSubject, ExamChapter, ExamTopic, ExamSubTopic } from '../types';

const MOTIVATIONAL_QUOTES = [
  "🔥 \"The key to success is to focus on goals, not obstacles. Step by step, chapter by chapter, you are conquering your future!\"",
  "⚡ \"Success isn't always about greatness. It's about consistency. Consistent study habits lead to top scores!\"",
  "🌟 \"Believe you can and you're halfway there. Master each concept with clarity and confidence!\"",
  "🎯 \"Small daily improvements in your revision schedule lead to massive exam day breakthroughs!\"",
  "🚀 \"Don't watch the clock; do what it does. Keep going and turn your effort into achievement!\""
];

export const ExamMode: React.FC = () => {
  const { 
    examPlans, 
    setExamPlans, 
    autoCreateSM2ScheduleForSubject, 
    startStudyNow, 
    setPersonalization 
  } = useAppContext();

  const [activePlanId, setActivePlanId] = useState<string | null>(examPlans[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ExamPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View mode state for syllabus elements: Grid vs Line
  const [viewMode, setViewMode] = useState<'grid' | 'line'>('grid');

  // Rotating Motivational Quote index
  const [quoteIndex, setQuoteIndex] = useState(0);

  const activePlan = examPlans.find(p => p.id === activePlanId) || examPlans[0];

  const cycleMotivationalQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const createNewPlan = () => {
    const newPlan: ExamPlan = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Competitive Exam Syllabus Plan',
      examDate: '2026-06-15',
      subjects: [
        {
          id: 's1',
          name: 'General Shaastra & Science',
          chapters: [
            {
              id: 'c1',
              name: 'Chapter 1: Memory & Cognitive Psychology',
              completed: false,
              topics: [
                {
                  id: 't1',
                  name: 'Spaced Repetition SM-2 Intervals',
                  completed: false,
                  subTopics: [
                    { id: 'st1', name: 'Ease Factor Calculations', completed: false },
                    { id: 'st2', name: 'Recall Threshold Curves', completed: false }
                  ]
                }
              ]
            }
          ]
        }
      ],
      phases: [],
      revisionSchedule: [],
      isActive: true
    };
    setEditingPlan(newPlan);
    setIsCreating(true);
  };

  const savePlan = () => {
    if (!editingPlan) return;
    
    if (isCreating) {
      setExamPlans([...examPlans, editingPlan]);
    } else {
      setExamPlans(examPlans.map(p => p.id === editingPlan.id ? editingPlan : p));
    }
    
    // Automatically trigger SM-2 Study Schedule creation for all subjects in the plan
    editingPlan.subjects.forEach(sub => {
      if (sub.name) {
        autoCreateSM2ScheduleForSubject(sub.name, editingPlan.examDate);
      }
    });

    // Sync personalization settings with target exam name and target exam date
    setPersonalization(prev => ({
      ...prev,
      targetExamName: editingPlan.title,
      targetExamDate: editingPlan.examDate
    }));

    setEditingPlan(null);
    setIsCreating(false);
    setActivePlanId(editingPlan.id);
  };

  const deletePlan = (id: string) => {
    setExamPlans(examPlans.filter(p => p.id !== id));
    if (activePlanId === id) setActivePlanId(null);
  };

  const toggleSubtopic = (subjectIndex: number, chapterIndex: number, topicIndex: number, subIndex: number) => {
    if (!activePlan) return;
    const updated = JSON.parse(JSON.stringify(activePlan)) as ExamPlan;
    const sub = updated.subjects[subjectIndex].chapters[chapterIndex].topics[topicIndex].subTopics[subIndex];
    sub.completed = !sub.completed;

    setExamPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const toggleTopic = (subjectIndex: number, chapterIndex: number, topicIndex: number) => {
    if (!activePlan) return;
    const updated = JSON.parse(JSON.stringify(activePlan)) as ExamPlan;
    const topic = updated.subjects[subjectIndex].chapters[chapterIndex].topics[topicIndex];
    const nextState = !topic.completed;
    topic.completed = nextState;
    topic.subTopics.forEach(s => s.completed = nextState);

    setExamPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Editing Plan View
  if (editingPlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between bg-white dark:bg-[#2a221f] p-6 rounded-3xl border border-amber-200 dark:border-[#3f332c] shadow-lg transition-colors">
          <h1 className="text-2xl font-black text-stone-900 dark:text-[#fef3c7]">
            {isCreating ? 'Create Exam Planning Schedule' : 'Edit Exam Plan'}
          </h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => setEditingPlan(null)} 
              className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700"
            >
              Cancel
            </button>
            <button onClick={savePlan} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95">
              Save Plan
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2a221f] p-6 rounded-3xl border border-amber-200 dark:border-[#3f332c] space-y-6 shadow-xl transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-orange-300 block mb-1">Plan Name</label>
              <input 
                type="text" 
                value={editingPlan.title}
                onChange={e => setEditingPlan({ ...editingPlan, title: e.target.value })}
                className="w-full bg-amber-50/60 dark:bg-[#1a1614] border border-amber-200 dark:border-[#3f332c] px-4 py-2.5 rounded-xl text-xs font-bold text-stone-900 dark:text-[#fef3c7] focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-orange-300 block mb-1">Target Exam Date</label>
              <input 
                type="date" 
                value={editingPlan.examDate}
                onChange={e => setEditingPlan({ ...editingPlan, examDate: e.target.value })}
                className="w-full bg-amber-50/60 dark:bg-[#1a1614] border border-amber-200 dark:border-[#3f332c] px-4 py-2.5 rounded-xl text-xs font-bold text-stone-900 dark:text-[#fef3c7] focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4 pt-4 border-t border-[#3f332c]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#fef3c7]">Syllabus Subjects & Topics</h3>
              <button 
                onClick={() => {
                  const newSub: ExamSubject = {
                    id: 'sub_' + Math.random().toString(36).substr(2, 7),
                    name: 'New Subject',
                    chapters: []
                  };
                  setEditingPlan({ ...editingPlan, subjects: [...editingPlan.subjects, newSub] });
                }}
                className="text-xs text-orange-400 font-bold flex items-center space-x-1"
              >
                <Plus size={14} /><span>Add Subject</span>
              </button>
            </div>

            {editingPlan.subjects.map((sub, sIdx) => (
              <div key={sub.id} className="p-4 bg-[#1a1614] rounded-2xl border border-[#3f332c] space-y-4">
                <div className="flex items-center justify-between border-b border-[#3f332c] pb-2">
                  <div className="flex items-center space-x-2 flex-1 mr-3">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Subject:</span>
                    <input 
                      type="text"
                      value={sub.name}
                      onChange={e => {
                        const updated = [...editingPlan.subjects];
                        updated[sIdx].name = e.target.value;
                        setEditingPlan({ ...editingPlan, subjects: updated });
                      }}
                      className="bg-[#2a221f] border border-[#3f332c] px-3 py-1.5 rounded-xl text-xs font-bold text-[#fef3c7] flex-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        const updated = [...editingPlan.subjects];
                        updated[sIdx].chapters.push({
                          id: 'c_' + Math.random().toString(36).substr(2, 7),
                          name: 'New Chapter',
                          completed: false,
                          topics: []
                        });
                        setEditingPlan({ ...editingPlan, subjects: updated });
                      }}
                      className="text-xs bg-orange-600/20 text-orange-300 hover:bg-orange-600 hover:text-white border border-orange-500/30 px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Add Chapter</span>
                    </button>
                    <button 
                      onClick={() => {
                        const updated = editingPlan.subjects.filter((_, i) => i !== sIdx);
                        setEditingPlan({ ...editingPlan, subjects: updated });
                      }}
                      className="text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg"
                      title="Delete Subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Chapters list inside Subject editor */}
                <div className="pl-3 space-y-3">
                  {sub.chapters.map((chap, cIdx) => (
                    <div key={chap.id} className="p-3 bg-[#2a221f] rounded-xl border border-[#3f332c] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 mr-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase">Chapter:</span>
                          <input 
                            type="text"
                            value={chap.name}
                            onChange={e => {
                              const updated = [...editingPlan.subjects];
                              updated[sIdx].chapters[cIdx].name = e.target.value;
                              setEditingPlan({ ...editingPlan, subjects: updated });
                            }}
                            className="bg-[#1a1614] border border-[#3f332c] px-2.5 py-1 rounded-lg text-xs font-bold text-[#fef3c7] flex-1"
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => {
                              const updated = [...editingPlan.subjects];
                              updated[sIdx].chapters[cIdx].topics.push({
                                id: 't_' + Math.random().toString(36).substr(2, 7),
                                name: 'New Topic',
                                completed: false,
                                subTopics: []
                              });
                              setEditingPlan({ ...editingPlan, subjects: updated });
                            }}
                            className="text-[11px] bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white px-2 py-0.5 rounded-lg font-bold flex items-center space-x-1"
                          >
                            <Plus size={10} /><span>Topic</span>
                          </button>
                          <button 
                            onClick={() => {
                              const updated = [...editingPlan.subjects];
                              updated[sIdx].chapters = updated[sIdx].chapters.filter((_, i) => i !== cIdx);
                              setEditingPlan({ ...editingPlan, subjects: updated });
                            }}
                            className="text-rose-400 p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Topics inside Chapter */}
                      <div className="pl-3 space-y-2">
                        {chap.topics.map((top, tIdx) => (
                          <div key={top.id} className="p-2 bg-[#1a1614] rounded-lg border border-[#3f332c]/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <input 
                                type="text"
                                value={top.name}
                                onChange={e => {
                                  const updated = [...editingPlan.subjects];
                                  updated[sIdx].chapters[cIdx].topics[tIdx].name = e.target.value;
                                  setEditingPlan({ ...editingPlan, subjects: updated });
                                }}
                                className="bg-[#2a221f] border border-[#3f332c] px-2 py-0.5 rounded text-xs text-[#fef3c7] flex-1 mr-2 font-medium"
                              />
                              <div className="flex items-center space-x-1">
                                <button 
                                  onClick={() => {
                                    const updated = [...editingPlan.subjects];
                                    updated[sIdx].chapters[cIdx].topics[tIdx].subTopics.push({
                                      id: 'st_' + Math.random().toString(36).substr(2, 7),
                                      name: 'New Sub-topic',
                                      completed: false
                                    });
                                    setEditingPlan({ ...editingPlan, subjects: updated });
                                  }}
                                  className="text-[10px] bg-white/5 text-orange-200 hover:bg-white/10 px-1.5 py-0.5 rounded font-bold"
                                >
                                  + Subtopic
                                </button>
                                <button 
                                  onClick={() => {
                                    const updated = [...editingPlan.subjects];
                                    updated[sIdx].chapters[cIdx].topics = updated[sIdx].chapters[cIdx].topics.filter((_, i) => i !== tIdx);
                                    setEditingPlan({ ...editingPlan, subjects: updated });
                                  }}
                                  className="text-rose-400 p-1"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Subtopics inside Topic */}
                            {top.subTopics.length > 0 && (
                              <div className="pl-3 space-y-1">
                                {top.subTopics.map((subtop, stIdx) => (
                                  <div key={subtop.id} className="flex items-center justify-between text-xs">
                                    <input 
                                      type="text"
                                      value={subtop.name}
                                      onChange={e => {
                                        const updated = [...editingPlan.subjects];
                                        updated[sIdx].chapters[cIdx].topics[tIdx].subTopics[stIdx].name = e.target.value;
                                        setEditingPlan({ ...editingPlan, subjects: updated });
                                      }}
                                      className="bg-transparent border-b border-[#3f332c] px-1 py-0.5 text-xs text-orange-200/90 flex-1 mr-2"
                                    />
                                    <button 
                                      onClick={() => {
                                        const updated = [...editingPlan.subjects];
                                        updated[sIdx].chapters[cIdx].topics[tIdx].subTopics = updated[sIdx].chapters[cIdx].topics[tIdx].subTopics.filter((_, i) => i !== stIdx);
                                        setEditingPlan({ ...editingPlan, subjects: updated });
                                      }}
                                      className="text-rose-400/70 hover:text-rose-400"
                                    >
                                      <X size={12} />
                                    </button>
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fef3c7]">Exam Planning</h1>
            <p className="text-xs text-orange-200/60">Syllabus breakdown, milestone tracking & chapter ticks</p>
          </div>
        </div>

        <button 
          onClick={createNewPlan}
          className="flex items-center space-x-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>New Exam Plan</span>
        </button>
      </div>

      {/* MOTIVATIONAL MESSAGE BANNER */}
      <div className="bg-gradient-to-r from-amber-900/40 via-orange-950/40 to-rose-950/40 p-5 rounded-3xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/30 shrink-0">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">Daily Exam Motivation</span>
            <p className="text-xs font-bold text-[#fef3c7] leading-relaxed italic">
              {MOTIVATIONAL_QUOTES[quoteIndex]}
            </p>
          </div>
        </div>

        <button
          onClick={cycleMotivationalQuote}
          className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-xl text-xs font-bold border border-amber-500/30 shrink-0 transition-all flex items-center space-x-1.5 z-10"
        >
          <Zap size={14} />
          <span>New Spark</span>
        </button>
      </div>

      {/* Guide Banner & Search/View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar for Exam Plans */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search subjects, chapters, topics..."
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

        {/* View Mode Toggle: Grid vs Line View */}
        <div className="flex items-center space-x-1 bg-stone-200/80 dark:bg-[#1a1614] p-1 rounded-2xl border border-stone-300 dark:border-[#3f332c] shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'grid' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-stone-700 dark:text-orange-200/60 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid size={15} />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('line')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'line' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-stone-700 dark:text-orange-200/60 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <LayoutList size={15} />
            <span>Line View</span>
          </button>
        </div>
      </div>

      {/* Exam Plan List / Selector */}
      {examPlans.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {examPlans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setActivePlanId(plan.id)}
              className={`px-5 py-3 rounded-2xl border text-xs font-bold transition-all text-left space-y-1 ${
                activePlan?.id === plan.id
                  ? 'bg-orange-600 text-white border-orange-500 shadow-lg'
                  : 'bg-white dark:bg-[#2a221f] text-stone-800 dark:text-orange-200/70 border-stone-200 dark:border-[#3f332c] hover:border-orange-500/40'
              }`}
            >
              <div className="font-black text-sm">{plan.title}</div>
              <div className="text-[10px] opacity-80">Target Date: {plan.examDate || '2026'}</div>
            </button>
          ))}
        </div>
      )}

      {/* Active Exam Plan Syllabus Dashboard */}
      {activePlan && (
        <div className="bg-amber-50 dark:bg-[#2a221f] p-6 rounded-3xl border border-amber-200 dark:border-[#3f332c] space-y-8 shadow-xl transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-[#3f332c] pb-6">
            <div>
              <h2 className="text-xl font-black text-stone-900 dark:text-[#fef3c7]">{activePlan.title}</h2>
              <p className="text-xs text-stone-600 dark:text-orange-200/60 mt-0.5">Target Exam Date: {activePlan.examDate}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => { setEditingPlan(activePlan); setIsCreating(false); }}
                className="py-2 px-4 bg-stone-200/60 dark:bg-white/5 hover:bg-stone-300 dark:hover:bg-white/10 text-stone-800 dark:text-amber-300 rounded-xl text-xs font-bold border border-stone-300 dark:border-white/10 flex items-center space-x-1.5 transition-all"
              >
                <Edit2 size={14} /><span>Edit Syllabus</span>
              </button>
              <button 
                onClick={() => deletePlan(activePlan.id)}
                className="py-2 px-3 bg-rose-50 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 dark:border-white/10 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Subjects & Nested Topics rendered in GRID or LINE view */}
          {activePlan.subjects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1a1614] rounded-3xl border border-stone-200 dark:border-[#3f332c] p-8 space-y-4 shadow-sm">
              <BookOpen size={40} className="mx-auto text-orange-500 opacity-60" />
              <div>
                <h3 className="font-black text-lg text-stone-900 dark:text-[#fef3c7]">No Subjects in {activePlan.title}</h3>
                <p className="text-xs text-stone-500 dark:text-orange-200/60 mt-1 max-w-md mx-auto">
                  Add your subjects, chapters, and topics to structure your syllabus and track revision progress.
                </p>
              </div>
              <button
                onClick={() => { setEditingPlan(activePlan); setIsCreating(false); }}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 inline-flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Subjects & Edit Syllabus</span>
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6 w-full'}>
              {activePlan.subjects.filter(s => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                if (s.name.toLowerCase().includes(q)) return true;
                return s.chapters.some(c => 
                  c.name.toLowerCase().includes(q) || 
                  c.topics.some(t => t.name.toLowerCase().includes(q) || t.subTopics.some(st => st.name.toLowerCase().includes(q)))
                );
              }).map((subject, sIdx) => (
                <div 
                  key={subject.id} 
                  className={`p-6 bg-white dark:bg-[#1a1614] rounded-3xl border border-stone-200 dark:border-[#3f332c] shadow-sm transition-all ${
                    viewMode === 'line' ? 'space-y-4 w-full' : 'space-y-4 flex flex-col justify-between'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 dark:border-[#3f332c]/60 pb-3 gap-3">
                    <h3 className="font-black text-base text-orange-600 dark:text-orange-400 flex items-center space-x-2">
                      <BookOpen size={18} />
                      <span>{subject.name}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startStudyNow(`Study Session: ${subject.name}`, 30, subject.name)}
                        className="flex items-center space-x-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        <Play size={10} className="fill-current" />
                        <span>Study Now</span>
                      </button>
                      <span className="text-xs text-stone-500 dark:text-orange-200/50 font-bold">{subject.chapters.length} Chapters</span>
                    </div>
                  </div>

                  {/* Chapters rendering according to View Mode */}
                  <div className={viewMode === 'grid' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
                    {subject.chapters.map((chapter, cIdx) => (
                      <div 
                        key={chapter.id} 
                        className="p-4 bg-amber-50/60 dark:bg-[#2a221f] rounded-2xl border border-amber-200/60 dark:border-[#3f332c] space-y-3"
                      >
                        <div className="space-y-2 flex-1">
                          <h4 className="font-bold text-sm text-stone-900 dark:text-[#fef3c7]">{chapter.name}</h4>

                          <div className="pl-3 border-l-2 border-orange-500/30 space-y-2">
                            {chapter.topics.map((topic, tIdx) => (
                              <div key={topic.id} className="space-y-1.5">
                                <div className="flex items-center space-x-2.5">
                                  <button 
                                    onClick={() => toggleTopic(sIdx, cIdx, tIdx)}
                                    className="text-orange-600 dark:text-orange-400 hover:text-emerald-500 shrink-0"
                                  >
                                    {topic.completed ? <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" /> : <Circle size={16} />}
                                  </button>
                                  <span className={`text-xs font-bold ${topic.completed ? 'line-through text-stone-400 dark:text-orange-200/40' : 'text-stone-800 dark:text-[#fef3c7]'}`}>
                                    {topic.name}
                                  </span>
                                </div>

                                {/* Subtopics */}
                                {topic.subTopics.length > 0 && (
                                  <div className="pl-5 space-y-1">
                                    {topic.subTopics.map((sub, stIdx) => (
                                      <div key={sub.id} className="flex items-center space-x-2 text-[11px]">
                                        <button 
                                          onClick={() => toggleSubtopic(sIdx, cIdx, tIdx, stIdx)}
                                          className="text-orange-500 dark:text-orange-300 hover:text-emerald-500 shrink-0"
                                        >
                                          {sub.completed ? <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" /> : <Circle size={13} />}
                                        </button>
                                        <span className={sub.completed ? 'line-through text-stone-400 dark:text-orange-200/40' : 'text-stone-700 dark:text-orange-200/80'}>
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
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
