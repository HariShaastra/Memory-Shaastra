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
  Target,
  LayoutGrid,
  LayoutList,
  CalendarDays
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StudyTask, ScheduledRevisionTask } from '../types';

export const StudyPlanner: React.FC = () => {
  const { 
    studyTasks, 
    setStudyTasks, 
    scheduledRevisions, 
    toggleScheduledRevision,
    deleteScheduledRevision,
    updateScheduledRevision,
    addScheduledRevision,
    startStudyNow,
    examPlans,
    allSubjects,
    autoCreateSM2ScheduleForSubject,
    personalization
  } = useAppContext();

  const formRef = React.useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'task' | 'revision' | null>(null);
  const [activityCategory, setActivityCategory] = useState<'task' | 'revision'>('task');
  const [filter, setFilter] = useState<'daily' | 'all' | 'revisions' | 'completed'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'line'>('line');

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    plannedDate: new Date().toISOString().split('T')[0],
    estimatedTime: '25 mins',
    intervalDays: 1,
    completed: false
  });

  const activeExamPlan = examPlans.find(p => p.isActive) || examPlans[0];

  const resetForm = () => {
    setFormData({
      subject: '',
      topic: '',
      plannedDate: new Date().toISOString().split('T')[0],
      estimatedTime: '25 mins',
      intervalDays: 1,
      completed: false
    });
    setEditingId(null);
    setEditingType(null);
    setActivityCategory('task');
  };

  const handleSaveActivity = () => {
    if (!formData.topic) return;
    
    if (editingId && editingType === 'task') {
      setStudyTasks(prev => prev.map(task => 
        task.id === editingId 
          ? { 
              ...task, 
              topic: formData.topic, 
              subject: formData.subject || 'General', 
              plannedDate: formData.plannedDate, 
              estimatedTime: formData.estimatedTime 
            } 
          : task
      ));
    } else if (editingId && editingType === 'revision') {
      const durMins = parseInt(formData.estimatedTime) || 20;
      updateScheduledRevision(editingId, {
        itemTitle: formData.topic,
        dueDate: formData.plannedDate,
        durationMinutes: durMins,
        intervalDays: formData.intervalDays || 1
      });
    } else {
      // Adding New
      if (activityCategory === 'revision') {
        const durMins = parseInt(formData.estimatedTime) || 20;
        addScheduledRevision({
          itemTitle: formData.topic,
          dueDate: formData.plannedDate,
          durationMinutes: durMins,
          intervalDays: formData.intervalDays || 1,
          itemType: 'study-task'
        });
      } else {
        const task: StudyTask = {
          id: Date.now().toString(),
          subject: formData.subject || 'General',
          topic: formData.topic,
          plannedDate: formData.plannedDate,
          estimatedTime: formData.estimatedTime || '25 mins',
          completed: false
        };
        setStudyTasks(prev => [...prev, task]);
      }
    }
    
    setIsAdding(false);
    resetForm();
  };

  const startEditTask = (task: StudyTask) => {
    setFormData({
      subject: task.subject || '',
      topic: task.topic,
      plannedDate: task.plannedDate,
      estimatedTime: task.estimatedTime || '25 mins',
      intervalDays: 1,
      completed: task.completed
    });
    setEditingId(task.id);
    setEditingType('task');
    setActivityCategory('task');
    setIsAdding(true);
    scrollToForm();
  };

  const startEditRevision = (rev: ScheduledRevisionTask) => {
    setFormData({
      subject: '',
      topic: rev.itemTitle,
      plannedDate: rev.dueDate,
      estimatedTime: `${rev.durationMinutes || 20} mins`,
      intervalDays: rev.intervalDays || 1,
      completed: rev.completed
    });
    setEditingId(rev.id);
    setEditingType('revision');
    setActivityCategory('revision');
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fef3c7]">Flexible Study Schedule</h1>
          <p className="text-xs text-orange-200/60 mt-1">Full control to add, edit, delete, and manage all study activities & revisions</p>
        </div>

        {!isAdding && (
          <button 
            onClick={() => { resetForm(); setIsAdding(true); scrollToForm(); }}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            <span>+ Add Activity / Revision</span>
          </button>
        )}
      </header>

      {/* Guide Banner */}
      <div className="bg-[#2a221f]/60 p-5 rounded-2xl border border-[#3f332c] flex items-start space-x-3 text-xs text-orange-100/90">
        <HelpCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-orange-300 font-bold">Flexible Schedule Management:</strong>
          <p className="text-orange-200/70 mt-0.5">
            Easily click the <strong>Edit (pencil)</strong> icon or <strong>Delete (trash)</strong> icon on any study activity or revision item below to adjust dates, durations, and topics anytime.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#2a221f] p-4 rounded-3xl border border-[#3f332c]">
        {/* Search Input Facility */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60" />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search activities by topic, subject, or revision name..."
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

        {/* Filter Tabs & Grid/Line View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 bg-[#1a1614] p-1.5 rounded-2xl border border-[#3f332c] text-xs font-bold">
            <button
              onClick={() => setFilter('daily')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${filter === 'daily' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60 hover:text-white'}`}
            >
              Today's Schedule
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${filter === 'all' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60 hover:text-white'}`}
            >
              All Activities
            </button>
            <button
              onClick={() => setFilter('revisions')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${filter === 'revisions' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60 hover:text-white'}`}
            >
              Revisions ({scheduledRevisions.filter(r => !r.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${filter === 'completed' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-200/60 hover:text-white'}`}
            >
              Completed
            </button>
          </div>

          {/* Grid View / Line View Switcher */}
          <div className="flex items-center space-x-1 bg-[#1a1614] p-1 rounded-2xl border border-[#3f332c] shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-orange-200/60 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('line')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'line' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-orange-200/60 hover:text-white'
              }`}
              title="Line View"
            >
              <LayoutList size={14} />
              <span>Line</span>
            </button>
          </div>
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
            className="bg-white dark:bg-[#2a221f] rounded-3xl p-6 border border-orange-500/30 space-y-4 shadow-xl transition-colors"
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#3f332c] pb-3">
              <h3 className="font-bold text-orange-600 dark:text-orange-300 text-sm">
                {editingId ? `Edit ${editingType === 'revision' ? 'Revision Activity' : 'Study Activity'}` : 'Add New Study Activity'}
              </h3>

              {!editingId && (
                <div className="flex items-center space-x-2 bg-stone-100 dark:bg-[#1a1614] p-1 rounded-xl border border-stone-200 dark:border-[#3f332c]">
                  <button
                    type="button"
                    onClick={() => setActivityCategory('task')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${activityCategory === 'task' ? 'bg-orange-600 text-white shadow' : 'text-stone-600 dark:text-orange-200/60'}`}
                  >
                    Regular Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityCategory('revision')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${activityCategory === 'revision' ? 'bg-orange-600 text-white shadow' : 'text-stone-600 dark:text-orange-200/60'}`}
                  >
                    Revision Item
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text"
                value={formData.topic}
                onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                className="bg-amber-50/60 dark:bg-[#1a1614] border border-amber-200 dark:border-[#3f332c] rounded-xl py-3 px-4 text-xs font-bold text-stone-900 dark:text-[#fef3c7] focus:outline-none focus:border-orange-500"
                placeholder="Topic / Activity Title (e.g. Chemical Bonds)"
              />
              <div>
                <input 
                  type="text"
                  list="subjects-list"
                  value={formData.subject}
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-amber-50/60 dark:bg-[#1a1614] border border-amber-200 dark:border-[#3f332c] rounded-xl py-3 px-4 text-xs font-bold text-stone-900 dark:text-[#fef3c7] focus:outline-none focus:border-orange-500"
                  placeholder="Subject (e.g. Science or General)"
                />
                <datalist id="subjects-list">
                  {allSubjects.map(sub => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-stone-500 dark:text-orange-200/50 block mb-1">
                  Scheduled Date
                </label>
                <input 
                  type="date"
                  value={formData.plannedDate}
                  onChange={e => setFormData(prev => ({ ...prev, plannedDate: e.target.value }))}
                  className="w-full bg-amber-50/60 dark:bg-[#1a1614] border border-amber-200 dark:border-[#3f332c] rounded-xl py-2.5 px-4 text-xs font-bold text-stone-900 dark:text-[#fef3c7] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-stone-500 dark:text-orange-200/50 block mb-1">
                  Estimated Duration
                </label>
                <input 
                  type="text"
                  value={formData.estimatedTime}
                  onChange={e => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full bg-amber-50/60 dark:bg-[#1a1614] border border-amber-200 dark:border-[#3f332c] rounded-xl py-2.5 px-4 text-xs font-bold text-stone-900 dark:text-[#fef3c7] focus:outline-none focus:border-orange-500"
                  placeholder="Focus Duration (e.g. 25 mins)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveActivity}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Schedule Activity'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task & Revision List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {/* Custom Study Tasks */}
        {filteredCustomTasks.map(task => (
          <div 
            key={task.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              task.completed 
                ? 'bg-emerald-500/10 dark:bg-[#1a1614]/40 border-emerald-500/30 opacity-70' 
                : 'bg-amber-50 dark:bg-[#2a221f] border-amber-200 dark:border-[#3f332c] hover:border-orange-500/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <button 
                onClick={() => toggleTask(task.id)}
                className="mt-1 shrink-0 text-orange-500 dark:text-orange-400 hover:text-emerald-500 cursor-pointer"
              >
                {task.completed ? <CheckCircle2 size={22} className="text-emerald-500 dark:text-emerald-400" /> : <Circle size={22} />}
              </button>

              <div className="space-y-1">
                <h3 className={`font-bold text-base ${task.completed ? 'line-through text-stone-400 dark:text-orange-200/50' : 'text-stone-900 dark:text-[#fef3c7]'}`}>
                  {task.topic}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-orange-200/60 font-medium">
                  <span className="flex items-center space-x-1"><Book size={12} className="text-orange-500 dark:text-orange-400" /><span>{task.subject}</span></span>
                  <span className="flex items-center space-x-1"><CalendarIcon size={12} className="text-amber-600 dark:text-amber-400" /><span>{task.plannedDate}</span></span>
                  <span className="flex items-center space-x-1"><Clock size={12} className="text-sky-600 dark:text-sky-400" /><span>{task.estimatedTime}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => {
                  const minutes = parseInt(task.estimatedTime) || 25;
                  startStudyNow(task.topic, minutes, task.subject);
                }}
                className="flex items-center space-x-1.5 py-2 px-3.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>Study Now</span>
              </button>

              <button 
                onClick={() => startEditTask(task)} 
                className="p-2 bg-stone-200 dark:bg-white/5 hover:bg-stone-300 dark:hover:bg-white/10 text-stone-800 dark:text-amber-300 rounded-xl cursor-pointer transition-all"
                title="Edit Activity"
              >
                <Edit2 size={15} />
              </button>
              <button 
                onClick={() => deleteTask(task.id)} 
                className="p-2 bg-stone-200 dark:bg-white/5 hover:bg-stone-300 dark:hover:bg-white/10 text-rose-600 dark:text-rose-400 rounded-xl cursor-pointer transition-all"
                title="Delete Activity"
              >
                <Trash2 size={15} />
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
                className="mt-1 shrink-0 text-orange-400 hover:text-emerald-400 cursor-pointer"
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
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-orange-200/60 font-medium">
                  <span className="flex items-center space-x-1">
                    <CalendarIcon size={12} className="text-amber-400" />
                    <span>Due: <strong className="text-amber-300">{rev.dueDate}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock size={12} className="text-sky-400" />
                    <span>{rev.durationMinutes || 20} mins</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => startStudyNow(rev.itemTitle, rev.durationMinutes || 20)}
                className="flex items-center space-x-1.5 py-2 px-3.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>Revise Now</span>
              </button>

              <button 
                onClick={() => startEditRevision(rev)} 
                className="p-2 bg-white/5 hover:bg-white/10 text-amber-300 rounded-xl cursor-pointer transition-all"
                title="Edit Revision"
              >
                <Edit2 size={15} />
              </button>

              <button 
                onClick={() => deleteScheduledRevision(rev.id)} 
                className="p-2 bg-white/5 hover:bg-white/10 text-rose-400 rounded-xl cursor-pointer transition-all"
                title="Delete Revision"
              >
                <Trash2 size={15} />
              </button>
            </div>
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
