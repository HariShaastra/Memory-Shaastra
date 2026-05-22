import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Book, 
  ChevronLeft,
  Edit2,
  Save,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { StudyTask } from '../types';

export const StudyPlanner: React.FC = () => {
  const { goBack, studyTasks, setStudyTasks } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'completed'>('daily');
  
  const [newTask, setNewTask] = useState<Partial<StudyTask>>({
    subject: '',
    topic: '',
    plannedDate: new Date().toISOString().split('T')[0],
    estimatedTime: '',
    completed: false
  });

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
        estimatedTime: newTask.estimatedTime!,
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
      estimatedTime: '',
      completed: false
    });
    setEditingId(null);
  };

  const startEdit = (task: StudyTask) => {
    setNewTask(task);
    setEditingId(task.id);
    setIsAdding(true);
  };

  const toggleTask = (id: string) => {
    setStudyTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setStudyTasks(prev => prev.filter(t => t.id !== id));
  };

  const filteredTasks = studyTasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      return !task.completed && (task.plannedDate === today || !task.plannedDate);
    }
    return !task.completed; // Weekly/All
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div>
            <h2 className="text-3xl font-black tracking-tight italic font-display text-orange-100 uppercase">{t.planner}</h2>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">List your tasks</p>
           </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 w-full md:w-auto justify-center active:scale-95"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        )}
      </header>

      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-indigo-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Study Planner</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A personal calendar list that logs upcoming exam topics and revision dates to keep your daily schedule disciplined and fully organized.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Tap the "Add Task" button.</span>
          <span className="block mt-1">2. Enter a subject name, target topic, focus date, and estimated duration.</span>
          <span className="block mt-1">3. Tap "Schedule Task" and complete them sequentially!</span>
        </div>
      </div>

      {/* Quick Add Form (Inline) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#2a221f] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-2">Topic</label>
                <input 
                  type="text"
                  value={newTask.topic}
                  onChange={e => setNewTask(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  placeholder="e.g. Chemical Reactions"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-2">Subject</label>
                <input 
                  type="text"
                  value={newTask.subject}
                  onChange={e => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  placeholder="e.g. Science"
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-2">Date</label>
                <input 
                  type="date"
                  value={newTask.plannedDate}
                  onChange={e => setNewTask(prev => ({ ...prev, plannedDate: e.target.value }))}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-2">Time</label>
                <input 
                  type="text"
                  value={newTask.estimatedTime}
                  onChange={e => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                  placeholder="e.g. 45 mins"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-orange-200/30 hover:text-orange-200/60"
              >
                Cancel
              </button>
              <button 
                onClick={addTask}
                className="px-10 py-4 bg-orange-600 text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl shadow-orange-600/20 active:scale-95"
              >
                {editingId ? 'Save' : 'Add'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 p-1.5 bg-[#2a221f] rounded-2xl w-fit border border-[#3f332c]/50">
        {(['daily', 'weekly', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                : 'text-orange-200/40 hover:text-orange-100'
            }`}
          >
            {f === 'daily' ? 'Today' : f === 'weekly' ? 'All' : 'Done'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center gap-5 p-6 bg-[#2a221f] rounded-[2rem] border border-[#3f332c] transition-all hover:bg-[#2d2522] ${
                  task.completed ? 'opacity-40 grayscale' : ''
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    task.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-orange-500/20 text-transparent hover:border-orange-500'
                  }`}
                >
                  {task.completed && <CheckCircle2 size={16} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-black text-lg italic tracking-tight text-orange-100 ${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.topic}
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-200/40">
                      <Book size={10} className="text-orange-500" /> {task.subject}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-200/40">
                      <Calendar size={10} className="text-amber-500" /> {task.plannedDate}
                    </span>
                    {task.estimatedTime && (
                      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-200/40">
                        <Clock size={10} className="text-orange-400" /> {task.estimatedTime}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEdit(task)}
                    className="p-3.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-[#2a221f]/30 rounded-[3rem] border-2 border-dashed border-[#3f332c]">
              <p className="text-orange-200/20 font-black uppercase tracking-widest text-xs">No tasks here.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
