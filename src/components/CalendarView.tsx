import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Play, 
  Settings2, 
  Plus, 
  Clock, 
  Sparkles,
  Layers,
  Brain,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function CalendarView() {
  const { 
    activityEvents, 
    scheduledRevisions, 
    toggleScheduledRevision, 
    deleteScheduledRevision,
    revisionIntervals, 
    updateRevisionIntervals,
    startStudyNow,
    logActivity
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showIntervalSettings, setShowIntervalSettings] = useState(false);
  const [customIntervalsInput, setCustomIntervalsInput] = useState(revisionIntervals.join(', '));
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityType, setNewActivityType] = useState<'flashcard' | 'mnemonic' | 'palace' | 'link-chain' | 'story' | 'first-letter'>('flashcard');

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const handleSaveIntervals = () => {
    const nums = customIntervalsInput
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);
    if (nums.length > 0) {
      updateRevisionIntervals(nums);
      setShowIntervalSettings(false);
    }
  };

  const handleAddManualActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;
    logActivity(newActivityTitle.trim(), newActivityType);
    setNewActivityTitle('');
  };

  // Filter tasks for selected date or overall
  const selectedDateTasks = scheduledRevisions.filter(task => {
    const matchesDate = task.dueDate === selectedDate;
    if (!matchesDate) return false;
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const selectedDateActivities = activityEvents.filter(act => 
    act.createdAt.split('T')[0] === selectedDate
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c]">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-orange-600/20 text-orange-400 rounded-2xl border border-orange-500/20">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fef3c7]">Calendar</h1>
              <p className="text-sm text-orange-200/70">Automatic spaced interval task scheduling & activity log</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowIntervalSettings(!showIntervalSettings)}
            className="flex items-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-orange-200 rounded-2xl border border-white/10 text-xs font-bold transition-all"
          >
            <Settings2 size={16} />
            <span>Edit Intervals ({revisionIntervals.join(', ')} days)</span>
          </button>
        </div>
      </div>

      {/* Interval Customization Settings Modal */}
      {showIntervalSettings && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2a221f] p-6 rounded-3xl border border-orange-500/30 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-orange-300 text-sm flex items-center space-x-2">
              <Clock size={16} />
              <span>Customize Revision Spaced Intervals (in days)</span>
            </h3>
            <button onClick={() => setShowIntervalSettings(false)} className="text-xs text-orange-200/60 hover:text-white">Close</button>
          </div>
          <p className="text-xs text-orange-200/70">
            Whenever you create a Flashcard, Mnemonic, Memory Palace, Link Trick, Story, or First Letter Method, 
            tasks are automatically created for these day intervals.
          </p>
          <div className="flex items-center space-x-3">
            <input 
              type="text" 
              value={customIntervalsInput}
              onChange={e => setCustomIntervalsInput(e.target.value)}
              placeholder="e.g. 1, 3, 7, 14, 30"
              className="flex-1 bg-[#1a1614] border border-[#3f332c] px-4 py-2.5 rounded-xl text-sm text-[#fef3c7] focus:outline-none focus:border-orange-500"
            />
            <button 
              onClick={handleSaveIntervals}
              className="py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
            >
              Save Intervals
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Calendar Grid & Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#fef3c7]">
              {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button onClick={prevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-orange-300">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-orange-300">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-orange-300/60">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 bg-[#1a1614]/20 rounded-2xl border border-transparent" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              // Count tasks and activities for this day
              const dayTasks = scheduledRevisions.filter(t => t.dueDate === dateStr);
              const dayActs = activityEvents.filter(a => a.createdAt.split('T')[0] === dateStr);
              const hasPending = dayTasks.some(t => !t.completed);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 p-2 rounded-2xl border flex flex-col justify-between items-start transition-all text-left relative overflow-hidden ${
                    isSelected 
                      ? 'bg-orange-600/30 border-orange-500 shadow-lg shadow-orange-500/10' 
                      : isToday 
                        ? 'bg-amber-500/10 border-amber-500/40 text-[#fef3c7]' 
                        : 'bg-[#1a1614] border-[#3f332c] hover:border-orange-500/40'
                  }`}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-amber-400 font-black' : 'text-orange-100/90'}`}>
                    {dayNum}
                  </span>

                  <div className="flex items-center space-x-1">
                    {dayTasks.length > 0 && (
                      <span className={`w-2 h-2 rounded-full ${hasPending ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
                    )}
                    {dayActs.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-6 text-xs text-orange-200/60 pt-2 border-t border-[#3f332c]/50">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Pending Revision</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Completed Revision</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Creation Event</span>
            </div>
          </div>
        </div>

        {/* Selected Day Agenda & Tasks (5 cols) */}
        <div className="lg:col-span-5 bg-[#2a221f] p-6 rounded-3xl border border-[#3f332c] space-y-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-[#3f332c]/60 pb-4">
            <div>
              <h3 className="text-base font-black text-[#fef3c7]">Agenda for {selectedDate}</h3>
              <p className="text-xs text-orange-200/60">
                {selectedDateTasks.length} Revision Task(s), {selectedDateActivities.length} Creation Event(s)
              </p>
            </div>
            
            {/* Filter Toggle */}
            <div className="flex bg-[#1a1614] p-1 rounded-xl border border-[#3f332c] text-[10px] font-bold">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${filter === 'all' ? 'bg-orange-600 text-white' : 'text-orange-200/60'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('pending')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${filter === 'pending' ? 'bg-orange-600 text-white' : 'text-orange-200/60'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilter('completed')} 
                className={`px-2.5 py-1 rounded-lg transition-colors ${filter === 'completed' ? 'bg-orange-600 text-white' : 'text-orange-200/60'}`}
              >
                Done
              </button>
            </div>
          </div>

          {/* Quick Add Custom Memory Activity */}
          <form onSubmit={handleAddManualActivity} className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Log custom memory creation..." 
              value={newActivityTitle}
              onChange={e => setNewActivityTitle(e.target.value)}
              className="flex-1 bg-[#1a1614] border border-[#3f332c] text-xs px-3 py-2 rounded-xl text-[#fef3c7] focus:outline-none focus:border-orange-500"
            />
            <button 
              type="submit" 
              className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus size={16} />
            </button>
          </form>

          {/* Agenda Items List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[420px]">
            {selectedDateTasks.length === 0 && selectedDateActivities.length === 0 ? (
              <div className="text-center py-12 text-orange-200/40 text-xs space-y-2">
                <Brain size={32} className="mx-auto text-orange-200/20" />
                <p>No revisions or activities logged for this date.</p>
                <p className="text-[11px] text-orange-200/30">Creating flashcards, mnemonics, or stories will populate this schedule!</p>
              </div>
            ) : (
              <>
                {/* Revision Tasks */}
                {selectedDateTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      task.completed 
                        ? 'bg-[#1a1614]/40 border-emerald-500/30 opacity-75' 
                        : 'bg-[#1a1614] border-orange-500/30 hover:border-orange-500/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button 
                        onClick={() => toggleScheduledRevision(task.id)}
                        className="flex items-start space-x-3 text-left group"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <Circle size={18} className="text-orange-400/60 group-hover:text-orange-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className={`text-xs font-bold ${task.completed ? 'line-through text-orange-200/50' : 'text-[#fef3c7]'}`}>
                            {task.itemTitle}
                          </p>
                          <span className="text-[10px] text-orange-300/60 uppercase font-bold tracking-wider">
                            {task.intervalDays}-Day Interval Spaced Recall
                          </span>
                        </div>
                      </button>

                      <button 
                        onClick={() => deleteScheduledRevision(task.id)}
                        className="text-orange-200/40 hover:text-rose-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#3f332c]/30">
                      <div className="flex items-center space-x-1 text-[11px] text-orange-200/60">
                        <Clock size={12} />
                        <span>{task.durationMinutes || 20} mins focus</span>
                      </div>

                      <button
                        onClick={() => startStudyNow(task.itemTitle, task.durationMinutes || 25, 'Spaced Recall')}
                        className="flex items-center space-x-1.5 py-1 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[11px] font-bold shadow-md transition-all active:scale-95"
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Study Now</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Logged Activities */}
                {selectedDateActivities.map(act => (
                  <div key={act.id} className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-300 flex items-center space-x-1.5">
                        <Layers size={14} />
                        <span>Activity Created</span>
                      </span>
                      <span className="text-[10px] text-sky-200/60">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#fef3c7] font-medium">{act.title}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
