import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  Clock, 
  Book, 
  Edit2, 
  Play, 
  Sparkles,
  HelpCircle,
  Brain,
  Search,
  BookOpen,
  Zap,
  Target
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StudyTask } from '../types';

export const StudyPlanner: React.FC = () => {
  const { 
    studyTasks, 
    setStudyTasks, 
    scheduledRevisions, 
    toggleScheduledRevision,
    startStudyNow,
    examPlans,
    allSubjects,
    autoCreateSM2ScheduleForSubject,
    personalization
  } = useAppContext();

  const formRef = React.useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'daily' | 'all' | 'revisions' | 'completed'>('daily');
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  
  const [newTask, setNewTask] = useState<Partial<StudyTask>>({
    subject: '',
    topic: '',
    plannedDate: new Date().toISOString().split('T')[0],
    estimatedTime: '25 mins',
    completed: false
  });

  const activeExamPlan = examPlans.find(p => p.isActive) || examPlans[0];

  const syncExamSchedule = () => {
    if (!activeExamPlan) return;
    activeExamPlan.subjects.forEach(sub => {
      if (sub.name) {
        autoCreateSM2ScheduleForSubject(sub.name, activeExamPlan.examDate);
      }
    });
  };

  const addTask = () => {
    if (!newTask.subject || !newTask.topic) return;
    
    if (editingId) {
      setStudyTasks(prev => prev.map(task => 
        task.id === editingId 
          ? { ...task, ...newTask as StudyTask } 
          : task
      ));
      setEditingId(null);
    } else {
      const task: StudyTask = {
        id: Date.now().toString(),
        subject: newTask.subject!,
        topic: newTask.topic!,
        plannedDate: newTask.plannedDate!,
        estimatedTime: newTask.estimatedTime || '25 mins',
        completed: false
      };
      setStudyTasks(prev => [...prev, task]);
    }
    
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTask({
      subject: '',
      topic: '',
      plannedDate: new Date().toISOString().split('T')[0],
      estimatedTime: '25 mins',
      completed: false
    });
    setEditingId(null);
  };

  const startEdit = (task: StudyTask) => {
    setNewTask(task);
    setEditingId(task.id);
    setIsAdding(true);
    scrollToForm();
  };

  const toggleTask = (id: string) => {
    setStudyTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setStudyTasks(prev => prev.filter(t => t.id !== id));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredCustomTasks = studyTasks.filter(task => {
    const matchesSearch = searchQuery.trim() === '' || 
      task.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'completed') return task.completed;
    if (filter === 'daily') return !task.completed && (task.plannedDate === todayStr || !task.plannedDate);
    if (filter === 'revisions') return false;
    return !task.completed;
  });

  const activeRevisions = scheduledRevisions.filter(rev => {
    const matchesSearch = searchQuery.trim() === '' || 
      rev.itemTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'completed') return rev.completed;
    if (filter === 'daily') return !rev.completed && rev.dueDate <= todayStr;
    if (filter === 'revisions') return !rev.completed;
    return !rev.completed;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fef3c7]">Study Schedule</h1>
          <p className="text-xs text-orange-200/60 mt-1">Organized study roadmap with search & direct Focus Timer integration</p>
        </div>

        {!isAdding && (
          <button 
            onClick={() => { resetForm(); setIsAdding(true); scrollToForm(); }}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Add Study Activity</span>
          </button>
        )}
      </header>

      {/* Guide Banner */}
      <div className="bg-[#2a221f]/60 p-5 rounded-2xl border border-[#3f332c] flex items-start space-x-3 text-xs text-orange-100/90">
        <HelpCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-orange-300 font-bold">How "Study Schedule" Works:</strong>
          <p className="text-orange-200/70 mt-0.5">
            Create tasks with planned dates and focus durations. Use the <strong>Search Facility</strong> below to instantly filter activities by subject or topic. Click <strong>"Study Now"</strong> on any task to enter Monk Mode focus timer.
          </p>
        </div>
      </div>

      {/* Upcoming Exam Schedule Sync Card */}
      {activeExamPlan && (
        <div className="bg-gradient-to-r from-[#2a221f] via-[#332824] to-[#2a221f] p-6 rounded-3xl border border-orange-500/30 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="bg-orange-600/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center space-x-1">
                  <Target size={12} />
                  <span>Active Exam Schedule</span>
                </span>
                <span className="text-xs font-bold text-orange-200/60">
                  Target Date: {activeExamPlan.examDate}
                </span>
              </div>
              <h3 className="text-xl font-black text-orange-100 italic">{activeExamPlan.title}</h3>
              <p className="text-xs text-orange-200/70">
                Subjects in Exam Plan: {activeExamPlan.subjects.map(s => s.name).join(', ') || 'No subjects set'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={syncExamSchedule}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-black shadow-lg transition-all flex items-center space-x-2 active:scale-95"
              >
                <Zap size={14} />
                <span>Auto SM-2 Schedule Sync</span>
              </button>
              <button
                onClick={() => startStudyNow(`Exam Prep: ${activeExamPlan.title}`, 45, activeExamPlan.subjects[0]?.name)}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black shadow-lg transition-all flex items-center space-x-2 active:scale-95"
              >
                <Play size={14} className="fill-current" />
                <span>Study Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#2a221f] p-4 rounded-3xl border border-[#3f332c]">
        {/* Search Input Facility */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search activities in Study Schedule by topic or subject..."
            className="w-full bg-[#1a1614] border border-[#3f332c] text-xs py-3 pl-12 pr-4 rounded-2xl text-[#fef3c7] focus:outline-none focus:border-orange-500 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-200/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#1a1614] p-1.5 rounded-2xl border border-[#3f332c] text-xs font-bold">
          <button
            onClick={() => setFilter('daily')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'daily' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60'}`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'all' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60'}`}
          >
            All Activities
          </button>
          <button
            onClick={() => setFilter('revisions')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'revisions' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60'}`}
          >
            Revisions ({scheduledRevisions.filter(r => !r.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-2 rounded-xl transition-all ${filter === 'completed' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60'}`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            ref={formRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#2a221f] rounded-3xl p-6 border border-orange-500/30 space-y-4 shadow-xl"
          >
            <h3 className="font-bold text-orange-300 text-sm">{editingId ? 'Edit Activity' : 'Add New Study Activity'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text"
                value={newTask.topic}
                onChange={e => setNewTask(prev => ({ ...prev, topic: e.target.value }))}
                className="bg-[#1a1614] border border-[#3f332c] rounded-xl py-3 px-4 text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
                placeholder="Topic Name (e.g. Chemical Bonds)"
              />
              <div>
                <input 
                  type="text"
                  list="subjects-list"
                  value={newTask.subject}
                  onChange={e => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-xl py-3 px-4 text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
                  placeholder="Subject (e.g. Science or select existing)"
                />
                <datalist id="subjects-list">
                  {allSubjects.map(sub => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="date"
                value={newTask.plannedDate}
                onChange={e => setNewTask(prev => ({ ...prev, plannedDate: e.target.value }))}
                className="bg-[#1a1614] border border-[#3f332c] rounded-xl py-3 px-4 text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
              />
              <input 
                type="text"
                value={newTask.estimatedTime}
                onChange={e => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                className="bg-[#1a1614] border border-[#3f332c] rounded-xl py-3 px-4 text-xs font-bold text-[#fef3c7] focus:outline-none focus:border-orange-500"
                placeholder="Focus Duration (e.g. 25 mins)"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-4 py-2 text-xs font-bold text-orange-200/50 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={addTask}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                {editingId ? 'Save Changes' : 'Schedule Activity'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task & Revision List */}
      <div className="space-y-4">
        {filteredCustomTasks.map(task => (
          <div 
            key={task.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              task.completed 
                ? 'bg-[#1a1614]/40 border-emerald-500/30 opacity-70' 
                : 'bg-[#2a221f] border-[#3f332c] hover:border-orange-500/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <button 
                onClick={() => toggleTask(task.id)}
                className="mt-1 shrink-0 text-orange-400 hover:text-emerald-400"
              >
                {task.completed ? <CheckCircle2 size={22} className="text-emerald-400" /> : <Circle size={22} />}
              </button>

              <div className="space-y-1">
                <h3 className={`font-bold text-base ${task.completed ? 'line-through text-orange-200/50' : 'text-[#fef3c7]'}`}>
                  {task.topic}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-orange-200/60 font-medium">
                  <span className="flex items-center space-x-1"><Book size={12} className="text-orange-400" /><span>{task.subject}</span></span>
                  <span className="flex items-center space-x-1"><CalendarIcon size={12} className="text-amber-400" /><span>{task.plannedDate}</span></span>
                  <span className="flex items-center space-x-1"><Clock size={12} className="text-sky-400" /><span>{task.estimatedTime}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
              <button
                onClick={() => {
                  const minutes = parseInt(task.estimatedTime) || 25;
                  startStudyNow(task.topic, minutes, task.subject);
                }}
                className="flex items-center space-x-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Play size={14} fill="currentColor" />
                <span>Study Now</span>
              </button>

              <button 
                onClick={() => startEdit(task)} 
                className="p-2 bg-white/5 hover:bg-white/10 text-amber-300 rounded-xl"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => deleteTask(task.id)} 
                className="p-2 bg-white/5 hover:bg-white/10 text-rose-400 rounded-xl"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Spaced Calendar Revisions */}
        {activeRevisions.map(rev => (
          <div 
            key={rev.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              rev.completed 
                ? 'bg-[#1a1614]/40 border-emerald-500/30 opacity-70' 
                : 'bg-[#2a221f] border-orange-500/40 hover:border-orange-500'
            }`}
          >
            <div className="flex items-start space-x-4">
              <button 
                onClick={() => toggleScheduledRevision(rev.id)}
                className="mt-1 shrink-0 text-orange-400 hover:text-emerald-400"
              >
                {rev.completed ? <CheckCircle2 size={22} className="text-emerald-400" /> : <Circle size={22} />}
              </button>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-orange-600/20 text-orange-400 rounded-md border border-orange-500/30">
                    {rev.intervalDays}d Revision
                  </span>
                  <h3 className={`font-bold text-base ${rev.completed ? 'line-through text-orange-200/50' : 'text-[#fef3c7]'}`}>
                    {rev.itemTitle}
                  </h3>
                </div>
                <p className="text-xs text-orange-200/60 font-medium">
                  Due Date: <strong className="text-amber-300">{rev.dueDate}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => startStudyNow(rev.itemTitle, 20)}
              className="flex items-center space-x-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0 self-end md:self-center"
            >
              <Play size={14} fill="currentColor" />
              <span>Revise Now</span>
            </button>
          </div>
        ))}

        {filteredCustomTasks.length === 0 && activeRevisions.length === 0 && (
          <div className="text-center py-12 bg-[#2a221f]/50 rounded-3xl border border-[#3f332c] text-xs text-orange-200/40 space-y-2">
            <Brain size={32} className="mx-auto text-orange-200/20" />
            <p>No study activities or revisions found.</p>
            {searchQuery && <p className="text-orange-400 font-bold">Try clearing your search query above.</p>}
          </div>
        )}
      </div>

    </div>
  );
};
