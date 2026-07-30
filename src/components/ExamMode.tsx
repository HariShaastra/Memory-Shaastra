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
  Play
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ExamPlan, ExamSubject, ExamChapter, ExamTopic, ExamSubTopic } from '../types';

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

  const activePlan = examPlans.find(p => p.id === activePlanId) || examPlans[0];

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
        <div className="flex items-center justify-between bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c]">
          <h1 className="text-2xl font-black text-[#fef3c7]">
            {isCreating ? 'Create Exam Planning Schedule' : 'Edit Exam Plan'}
          </h1>
          <div className="flex space-x-3">
            <button onClick={() => setEditingPlan(null)} className="px-4 py-2 text-xs font-bold text-orange-200/50 hover:text-white">
              Cancel
            </button>
            <button onClick={savePlan} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg">
              Save Plan
            </button>
          </div>
        </div>

        <div className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Plan Name</label>
              <input 
                type="text" 
                value={editingPlan.title}
                onChange={e => setEditingPlan({ ...editingPlan, title: e.target.value })}
                className="w-full bg-[#1a1614] border border-[#3f332c] px-4 py-2.5 rounded-xl text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-orange-300 block mb-1">Target Exam Date</label>
              <input 
                type="date" 
                value={editingPlan.examDate}
                onChange={e => setEditingPlan({ ...editingPlan, examDate: e.target.value })}
                className="w-full bg-[#1a1614] border border-[#3f332c] px-4 py-2.5 rounded-xl text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
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
              <div key={sub.id} className="p-4 bg-[#1a1614] rounded-2xl border border-[#3f332c] space-y-3">
                <div className="flex items-center justify-between">
                  <input 
                    type="text"
                    value={sub.name}
                    onChange={e => {
                      const updated = [...editingPlan.subjects];
                      updated[sIdx].name = e.target.value;
                      setEditingPlan({ ...editingPlan, subjects: updated });
                    }}
                    className="bg-[#2a221f] border border-[#3f332c] px-3 py-1.5 rounded-xl text-xs font-bold text-[#fef3c7]"
                  />
                  <button 
                    onClick={() => {
                      const updated = editingPlan.subjects.filter((_, i) => i !== sIdx);
                      setEditingPlan({ ...editingPlan, subjects: updated });
                    }}
                    className="text-rose-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c]">
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

      {/* Guide Banner */}
      <div className="bg-[#2a221f]/60 p-4 rounded-2xl border border-[#3f332c] flex items-center space-x-3 text-xs text-orange-100/90">
        <HelpCircle size={18} className="text-orange-400 shrink-0" />
        <p>
          Track your exam syllabus subject by subject. Completing subtopic checkboxes automatically updates your overall <strong>"Your Progress"</strong> bar!
        </p>
      </div>

      {/* Search Bar for Exam Plans */}
      <div className="relative max-w-md">
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
                  : 'bg-[#2a221f] text-orange-200/70 border-[#3f332c] hover:border-orange-500/40'
              }`}
            >
              <div className="font-black text-sm">{plan.title}</div>
              <div className="text-[10px] opacity-80">Date: {plan.examDate || '2026'}</div>
            </button>
          ))}
        </div>
      )}

      {/* Active Exam Plan Syllabus Dashboard */}
      {activePlan && (
        <div className="bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3f332c] pb-6">
            <div>
              <h2 className="text-xl font-black text-[#fef3c7]">{activePlan.title}</h2>
              <p className="text-xs text-orange-200/60 mt-0.5">Target Exam Date: {activePlan.examDate}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => { setEditingPlan(activePlan); setIsCreating(false); }}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 text-amber-300 rounded-xl text-xs font-bold border border-white/10 flex items-center space-x-1.5"
              >
                <Edit2 size={14} /><span>Edit Syllabus</span>
              </button>
              <button 
                onClick={() => deletePlan(activePlan.id)}
                className="py-2 px-3 bg-white/5 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold border border-white/10"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Subjects & Nested Topics */}
          <div className="space-y-6">
            {activePlan.subjects.filter(s => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              if (s.name.toLowerCase().includes(q)) return true;
              return s.chapters.some(c => 
                c.name.toLowerCase().includes(q) || 
                c.topics.some(t => t.name.toLowerCase().includes(q) || t.subTopics.some(st => st.name.toLowerCase().includes(q)))
              );
            }).map((subject, sIdx) => (
              <div key={subject.id} className="p-6 bg-[#1a1614] rounded-3xl border border-[#3f332c] space-y-4">
                <div className="flex items-center justify-between border-b border-[#3f332c]/60 pb-3">
                  <h3 className="font-black text-base text-orange-400 flex items-center space-x-2">
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
                    <span className="text-xs text-orange-200/50 font-bold">{subject.chapters.length} Chapters</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {subject.chapters.map((chapter, cIdx) => (
                    <div key={chapter.id} className="p-4 bg-[#2a221f] rounded-2xl border border-[#3f332c] space-y-3">
                      <h4 className="font-bold text-sm text-[#fef3c7]">{chapter.name}</h4>

                      <div className="pl-4 border-l-2 border-orange-500/20 space-y-3">
                        {chapter.topics.map((topic, tIdx) => (
                          <div key={topic.id} className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => toggleTopic(sIdx, cIdx, tIdx)}
                                className="text-orange-400 hover:text-emerald-400 shrink-0"
                              >
                                {topic.completed ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} />}
                              </button>
                              <span className={`text-xs font-bold ${topic.completed ? 'line-through text-orange-200/40' : 'text-[#fef3c7]'}`}>
                                {topic.name}
                              </span>
                            </div>

                            {/* Subtopics */}
                            {topic.subTopics.length > 0 && (
                              <div className="pl-6 space-y-1.5">
                                {topic.subTopics.map((sub, stIdx) => (
                                  <div key={sub.id} className="flex items-center space-x-2 text-xs">
                                    <button 
                                      onClick={() => toggleSubtopic(sIdx, cIdx, tIdx, stIdx)}
                                      className="text-orange-300 hover:text-emerald-400 shrink-0"
                                    >
                                      {sub.completed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Circle size={14} />}
                                    </button>
                                    <span className={sub.completed ? 'line-through text-orange-200/40' : 'text-orange-200/80'}>
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
      )}
    </div>
  );
};
