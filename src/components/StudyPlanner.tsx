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
  Save
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
      return !task.completed && task.plannedDate === today;
    }
    return !task.completed; // Weekly/All
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{t.planner}</h1>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>{t.add}</span>
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {(['daily', 'weekly', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'daily' ? t.dailyTasks : f === 'weekly' ? t.weeklyOverview : t.completed}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 transition-all ${
                  task.completed ? 'opacity-60' : 'hover:border-indigo-300'
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.topic}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Book size={12} /> {task.subject}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={12} /> {task.plannedDate}
                    </span>
                    {task.estimatedTime && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={12} /> {task.estimatedTime}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => startEdit(task)}
                    className="p-2 text-slate-300 hover:text-indigo-500"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-300 hover:text-rose-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 italic">No tasks found for this view.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-6">{editingId ? t.edit : t.add} {t.planner}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">{t.subject}</label>
                  <input 
                    type="text"
                    value={newTask.subject}
                    onChange={e => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Biology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">{t.topic}</label>
                  <input 
                    type="text"
                    value={newTask.topic}
                    onChange={e => setNewTask(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Cell Structure"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">{t.date}</label>
                    <input 
                      type="date"
                      value={newTask.plannedDate}
                      onChange={e => setNewTask(prev => ({ ...prev, plannedDate: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">{t.time}</label>
                    <input 
                      type="text"
                      value={newTask.estimatedTime}
                      onChange={e => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 1h 30m"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => { setIsAdding(false); resetForm(); }}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={addTask}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {t.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
