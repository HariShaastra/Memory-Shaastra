import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Calendar, 
  Layers, 
  RefreshCw, 
  Target, 
  Zap, 
  Brain, 
  BookOpen, 
  Link as LinkIcon, 
  Type, 
  Plus,
  List
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

export const HomeScreen: React.FC = () => {
  const { setView, user, studyTasks, examPlans } = useAppContext();

  const quickActions = [
    { id: 'icebreaker', icon: Zap, label: t.icebreakerWarmup, view: 'icebreaker', color: 'bg-amber-100 text-amber-600' },
    { id: 'focus', icon: Play, label: t.startFocus, view: 'focus', color: 'bg-emerald-100 text-emerald-600' },
  ];

  const memoryTools = [
    { id: 'mnemonics', icon: Brain, label: t.mnemonics, view: 'mnemonics' },
    { id: 'palace', icon: BookOpen, label: t.palace, view: 'palace' },
    { id: 'linking', icon: LinkIcon, label: t.linking, view: 'linking' },
    { id: 'first-letter', icon: Type, label: t.firstLetter, view: 'first-letter' },
  ];

  const todayTasks = studyTasks.filter(task => !task.completed).slice(0, 3);
  const activePlan = examPlans.find(p => p.isActive) || examPlans[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t.welcomeBack}, {user?.name || t.guest}
          </h1>
          <p className="text-slate-500 mt-1 italic">
            {t.yourLearningCompanion}
          </p>
        </div>
        <div className="flex gap-3">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => setView(action.view as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 ${action.color}`}
            >
              <action.icon size={18} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Study Planner Summary */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Calendar size={20} />
              <h2 className="font-bold">{t.todayTasks}</h2>
            </div>
            <button onClick={() => setView('planner')} className="text-xs text-slate-500 hover:text-indigo-600 underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.topic}</p>
                    <p className="text-xs text-slate-500">{task.subject}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center italic">No tasks for today</p>
            )}
            <button 
              onClick={() => setView('planner')}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm">Add Task</span>
            </button>
          </div>
        </motion.div>

        {/* Flashcards & Revisions */}
        <div className="space-y-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-2 text-rose-600 mb-4">
              <Layers size={20} />
              <h2 className="font-bold">{t.flashcardsDue}</h2>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold">12</span>
              <button onClick={() => setView('flashcards')} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors">
                Practice
              </button>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <RefreshCw size={20} />
              <h2 className="font-bold">{t.revisionsDue}</h2>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold">5</span>
              <button onClick={() => setView('scheduler')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                Review
              </button>
            </div>
          </motion.div>
        </div>

        {/* Exam Mode Status */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <Target size={20} />
            <h2 className="font-bold">{t.examStatus}</h2>
          </div>
          {activePlan ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 truncate mr-2">{activePlan.title}</span>
                <span className="font-bold">{activePlan.examDate || 'TBD'}</span>
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">
                  {examPlans.length} active plan{examPlans.length !== 1 ? 's' : ''}
                </p>
                <button 
                  onClick={() => setView('exam-mode')}
                  className="w-full py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                >
                  <List size={16} />
                  Manage Exam Plans
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <p className="text-sm text-slate-500 italic">No active exam plan</p>
              <button 
                onClick={() => setView('exam-mode')}
                className="px-6 py-2 border-2 border-amber-500 text-amber-600 rounded-xl text-sm font-bold hover:bg-amber-50 transition-colors"
              >
                {t.setupExam}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Memory Tools Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Brain size={24} className="text-indigo-500" />
          {t.memoryTools}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {memoryTools.map(tool => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView(tool.view as any)}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 transition-all group"
            >
              <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors mb-3">
                <tool.icon size={24} className="text-slate-600 group-hover:text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-slate-700 text-center">{tool.label}</span>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};
