import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Play, 
  Settings2, 
  Plus, 
  Clock, 
  Layers, 
  Brain, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ListFilter,
  X,
  Tag,
  BookOpen
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
    logActivity,
    allSubjects
  } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'schedule'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Custom events stored in state / localStorage
  const [customEvents, setCustomEvents] = useState<Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    duration: number;
    type: 'custom' | 'exam' | 'study';
    subject?: string;
    description?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('ms_custom_calendar_events');
      return saved ? JSON.parse(saved) : [
        {
          id: 'ce_1',
          title: 'Chemistry Midterm Exam',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          duration: 90,
          type: 'exam',
          subject: 'Chemistry',
          description: 'Focus on Organic Chemistry mechanisms and functional groups.'
        }
      ];
    } catch {
      return [];
    }
  });

  const saveCustomEvents = (events: typeof customEvents) => {
    setCustomEvents(events);
    localStorage.setItem('ms_custom_calendar_events', JSON.stringify(events));
  };

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDate);
  const [eventTime, setEventTime] = useState('09:00');
  const [eventDuration, setEventDuration] = useState(30);
  const [eventType, setEventType] = useState<'custom' | 'exam' | 'study'>('study');
  const [eventSubject, setEventSubject] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const [showIntervalSettings, setShowIntervalSettings] = useState(false);
  const [customIntervalsInput, setCustomIntervalsInput] = useState(revisionIntervals.join(', '));
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation helpers
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const prevRange = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() - 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() - 1);
      setCurrentDate(next);
      setSelectedDate(next.toISOString().split('T')[0]);
    }
  };

  const nextRange = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
      setSelectedDate(next.toISOString().split('T')[0]);
    }
  };

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

  const handleCreateCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv = {
      id: 'ce_' + Date.now(),
      title: eventTitle.trim(),
      date: eventDate || selectedDate,
      time: eventTime,
      duration: Number(eventDuration) || 30,
      type: eventType,
      subject: eventSubject || undefined,
      description: eventDesc || undefined
    };

    saveCustomEvents([newEv, ...customEvents]);
    logActivity(`Scheduled event: ${eventTitle}`, 'flashcard');

    setEventTitle('');
    setEventDesc('');
    setShowAddEventModal(false);
  };

  const deleteCustomEvent = (id: string) => {
    saveCustomEvents(customEvents.filter(e => e.id !== id));
  };

  // Date utilities
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to calculate start of current week (Sunday)
  const getWeekDays = (baseDate: Date) => {
    const start = new Date(baseDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  // Time slots for Day/Week view (7:00 AM to 9:00 PM)
  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 7); // 7 to 21

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Google Calendar Top Toolbar Header */}
      <div className="bg-[#2a221f] p-4 sm:p-6 rounded-3xl border border-[#3f332c] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-md">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#fef3c7] tracking-tight">Calendar Workspace</h1>
              <p className="text-xs text-orange-200/60 font-medium">Automatic SM-2 Spaced Revisions & Event Planner</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEventDate(selectedDate);
              setShowAddEventModal(true);
            }}
            className="md:hidden p-2.5 bg-orange-600 text-white rounded-xl font-bold flex items-center space-x-1"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Calendar Nav & View Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-1 bg-[#1a1614] p-1 rounded-2xl border border-[#3f332c]">
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-xs font-bold text-orange-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Today
            </button>
            <button
              onClick={prevRange}
              className="p-1.5 text-orange-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextRange}
              className="p-1.5 text-orange-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className="text-xs sm:text-sm font-black text-amber-300 min-w-[130px] text-center">
            {viewMode === 'month' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            {viewMode === 'week' && `Week of ${weekDays[0].toLocaleDateString('default', { month: 'short', day: 'numeric' })}`}
            {viewMode === 'day' && new Date(selectedDate).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
            {viewMode === 'schedule' && 'Full Schedule'}
          </span>

          {/* View Mode Switcher */}
          <div className="flex bg-[#1a1614] p-1 rounded-2xl border border-[#3f332c] text-xs font-bold">
            {(['month', 'week', 'day', 'schedule'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  viewMode === mode 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'text-orange-200/60 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => {
                setEventDate(selectedDate);
                setShowAddEventModal(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus size={16} />
              <span>Event</span>
            </button>

            <button
              onClick={() => setShowIntervalSettings(!showIntervalSettings)}
              className="p-2 bg-white/5 hover:bg-white/10 text-orange-200 rounded-xl border border-white/10 text-xs font-bold"
              title="Interval Settings"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Interval Settings Modal */}
      {showIntervalSettings && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2a221f] p-5 rounded-3xl border border-orange-500/30 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-orange-300 text-xs flex items-center space-x-2">
              <Clock size={16} />
              <span>Customize Revision Spaced Intervals (in days)</span>
            </h3>
            <button onClick={() => setShowIntervalSettings(false)} className="text-xs text-orange-200/60 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <input 
              type="text" 
              value={customIntervalsInput}
              onChange={e => setCustomIntervalsInput(e.target.value)}
              placeholder="e.g. 1, 3, 7, 14, 30"
              className="flex-1 bg-[#1a1614] border border-[#3f332c] px-3.5 py-2 rounded-xl text-xs text-[#fef3c7]"
            />
            <button 
              onClick={handleSaveIntervals}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl"
            >
              Save
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Custom Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <motion.form 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleCreateCustomEvent}
            className="bg-[#2a221f] border border-[#3f332c] p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#3f332c] pb-3">
              <h3 className="font-bold text-base text-[#fef3c7] flex items-center space-x-2">
                <CalendarIcon size={18} className="text-orange-400" />
                <span>Create Calendar Event</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddEventModal(false)}
                className="text-orange-200/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-orange-300 block mb-1">Event Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Organic Chem Mock Test"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full bg-[#1a1614] border border-[#3f332c] px-3.5 py-2 rounded-xl text-xs font-bold text-[#fef3c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-orange-300 block mb-1">Event Type</label>
                  <select 
                    value={eventType}
                    onChange={e => setEventType(e.target.value as any)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] px-3 py-2 rounded-xl text-xs font-bold text-[#fef3c7]"
                  >
                    <option value="study">Study Session</option>
                    <option value="exam">Exam / Test</option>
                    <option value="custom">Reminder / Task</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-orange-300 block mb-1">Subject</label>
                  <input 
                    type="text"
                    list="cal-subjects-list"
                    placeholder="Subject..."
                    value={eventSubject}
                    onChange={e => setEventSubject(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] px-3 py-2 rounded-xl text-xs font-bold text-[#fef3c7]"
                  />
                  <datalist id="cal-subjects-list">
                    {allSubjects.map(sub => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-orange-300 block mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] px-2.5 py-2 rounded-xl text-xs font-bold text-[#fef3c7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-orange-300 block mb-1">Time</label>
                  <input 
                    type="time"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] px-2 py-2 rounded-xl text-xs font-bold text-[#fef3c7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-orange-300 block mb-1">Duration (min)</label>
                  <input 
                    type="number"
                    min={5}
                    max={360}
                    value={eventDuration}
                    onChange={e => setEventDuration(Number(e.target.value))}
                    className="w-full bg-[#1a1614] border border-[#3f332c] px-2 py-2 rounded-xl text-xs font-bold text-[#fef3c7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-orange-300 block mb-1">Description / Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Optional notes for this event..."
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                  className="w-full bg-[#1a1614] border border-[#3f332c] p-3 rounded-xl text-xs font-medium text-[#fef3c7] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddEventModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-xl transition-all border border-stone-300 dark:border-stone-700"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save Event
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#2a221f] p-4 sm:p-6 rounded-3xl border border-[#3f332c] space-y-4">
            <div className="grid grid-cols-7 text-center text-xs font-bold text-orange-300/70 pb-2 border-b border-[#3f332c]">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-20 bg-[#1a1614]/20 rounded-2xl border border-transparent" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                const dayTasks = scheduledRevisions.filter(t => t.dueDate === dateStr);
                const dayCustom = customEvents.filter(e => e.date === dateStr);
                const dayActs = activityEvents.filter(a => a.createdAt.split('T')[0] === dateStr);

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-20 p-1.5 rounded-2xl border flex flex-col justify-between items-start transition-all text-left overflow-hidden ${
                      isSelected 
                        ? 'bg-orange-600/30 border-orange-500 shadow-md ring-2 ring-orange-500/50' 
                        : isToday 
                          ? 'bg-amber-500/10 border-amber-500/50 text-[#fef3c7]' 
                          : 'bg-[#1a1614] border-[#3f332c] hover:border-orange-500/40'
                    }`}
                  >
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-amber-500 text-black font-black' : 'text-orange-100/90'
                    }`}>
                      {dayNum}
                    </span>

                    {/* Chips for events */}
                    <div className="w-full space-y-0.5 overflow-hidden">
                      {dayTasks.slice(0, 1).map(t => (
                        <div key={t.id} className="text-[9px] truncate font-bold px-1 py-0.2 rounded bg-orange-600/30 text-orange-200 border border-orange-500/20">
                          {t.itemTitle}
                        </div>
                      ))}
                      {dayCustom.slice(0, 1).map(c => (
                        <div key={c.id} className="text-[9px] truncate font-bold px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 border border-amber-500/20">
                          {c.title}
                        </div>
                      ))}
                      {(dayTasks.length + dayCustom.length > 2) && (
                        <div className="text-[8px] font-black text-orange-400 pl-1">
                          +{dayTasks.length + dayCustom.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-orange-200/60 pt-2 border-t border-[#3f332c]/50">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Revision Tasks</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Custom Events / Exams</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>Creation Activity</span>
              </div>
            </div>
          </div>

          {/* Agenda Sidebar */}
          <div className="lg:col-span-4 bg-[#2a221f] p-5 rounded-3xl border border-[#3f332c] space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#3f332c] pb-3">
              <div>
                <h3 className="text-sm font-black text-[#fef3c7]">Agenda for {selectedDate}</h3>
                <p className="text-[11px] text-orange-200/60">Selected day's events & tasks</p>
              </div>
              <button 
                onClick={() => {
                  setEventDate(selectedDate);
                  setShowAddEventModal(true);
                }}
                className="p-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold"
                title="Add event for selected day"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 max-h-[420px]">
              {/* Custom Events for selected date */}
              {customEvents.filter(e => e.date === selectedDate).map(ev => (
                <div key={ev.id} className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30">
                        {ev.type === 'exam' ? 'Exam / Test' : ev.type === 'study' ? 'Study Session' : 'Reminder'}
                      </span>
                      <h4 className="text-xs font-black text-[#fef3c7] mt-1">{ev.title}</h4>
                      <p className="text-[10px] text-orange-200/60 flex items-center space-x-1 mt-0.5">
                        <Clock size={11} />
                        <span>{ev.time || '10:00'} ({ev.duration} mins)</span>
                        {ev.subject && <span className="text-amber-300 ml-2">• {ev.subject}</span>}
                      </p>
                    </div>
                    <button onClick={() => deleteCustomEvent(ev.id)} className="text-orange-200/40 hover:text-rose-400 p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {ev.description && <p className="text-[11px] text-orange-100/80 italic bg-[#1a1614]/50 p-2 rounded-xl">{ev.description}</p>}
                  <button 
                    onClick={() => startStudyNow(ev.title, ev.duration, ev.subject)}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Study Now</span>
                  </button>
                </div>
              ))}

              {/* Revision Tasks for selected date */}
              {scheduledRevisions.filter(t => t.dueDate === selectedDate).map(task => (
                <div key={task.id} className={`p-3.5 rounded-2xl border space-y-2 ${task.completed ? 'bg-[#1a1614]/40 border-emerald-500/30' : 'bg-[#1a1614] border-orange-500/30'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <button onClick={() => toggleScheduledRevision(task.id)} className="mt-0.5">
                        {task.completed ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-orange-400/60" />}
                      </button>
                      <div>
                        <p className={`text-xs font-bold ${task.completed ? 'line-through text-orange-200/50' : 'text-[#fef3c7]'}`}>
                          {task.itemTitle}
                        </p>
                        <span className="text-[9px] text-orange-300/60 uppercase font-bold">
                          {task.intervalDays}-Day Spaced Recall
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteScheduledRevision(task.id)} className="text-orange-200/40 hover:text-rose-400 p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#3f332c]/30">
                    <span className="text-[10px] text-orange-200/60 flex items-center space-x-1">
                      <Clock size={11} /><span>{task.durationMinutes || 20} mins</span>
                    </span>
                    <button
                      onClick={() => startStudyNow(task.itemTitle, task.durationMinutes || 25, 'Spaced Recall')}
                      className="py-1 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-bold flex items-center space-x-1"
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Study Now</span>
                    </button>
                  </div>
                </div>
              ))}

              {customEvents.filter(e => e.date === selectedDate).length === 0 && scheduledRevisions.filter(t => t.dueDate === selectedDate).length === 0 && (
                <div className="text-center py-10 text-orange-200/40 text-xs space-y-2">
                  <Brain size={28} className="mx-auto text-orange-200/20" />
                  <p>No events or tasks scheduled for this day.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-[#2a221f] p-4 sm:p-6 rounded-3xl border border-[#3f332c] overflow-x-auto space-y-4">
          <div className="grid grid-cols-8 min-w-[700px] border-b border-[#3f332c] pb-2 text-center text-xs font-bold">
            <div className="text-orange-200/40 text-[10px]">TIME</div>
            {weekDays.map(d => {
              const dStr = d.toISOString().split('T')[0];
              const isToday = new Date().toISOString().split('T')[0] === dStr;
              return (
                <div 
                  key={dStr} 
                  onClick={() => setSelectedDate(dStr)} 
                  className={`cursor-pointer p-1 rounded-xl transition-all ${isToday ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-orange-200/80 hover:bg-white/5'}`}
                >
                  <p className="text-[10px] uppercase">{d.toLocaleDateString('default', { weekday: 'short' })}</p>
                  <p className="text-sm font-black">{d.getDate()}</p>
                </div>
              );
            })}
          </div>

          <div className="min-w-[700px] space-y-1 max-h-[500px] overflow-y-auto">
            {timeSlots.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-1 border-b border-[#3f332c]/30 min-h-[44px] items-center text-xs">
                <div className="text-[10px] font-bold text-orange-200/40 text-center">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
                {weekDays.map(d => {
                  const dStr = d.toISOString().split('T')[0];
                  const hourCustom = customEvents.filter(e => e.date === dStr && (parseInt(e.time?.split(':')[0] || '10') === hour));
                  const hourTasks = scheduledRevisions.filter(t => t.dueDate === dStr && hour === 10); // Default placing

                  return (
                    <div key={dStr} className="p-1 min-h-[40px] bg-[#1a1614]/40 rounded-xl space-y-1">
                      {hourCustom.map(c => (
                        <div key={c.id} className="p-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-[10px] font-bold text-amber-200 truncate">
                          {c.title}
                        </div>
                      ))}
                      {hourTasks.map(t => (
                        <div key={t.id} className="p-1 bg-orange-600/30 border border-orange-500/30 rounded-lg text-[10px] font-bold text-orange-200 truncate">
                          {t.itemTitle}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-[#2a221f] p-4 sm:p-6 rounded-3xl border border-[#3f332c] space-y-4">
          <div className="flex items-center justify-between border-b border-[#3f332c] pb-3">
            <div>
              <h3 className="text-base font-black text-[#fef3c7]">{new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              <p className="text-xs text-orange-200/60">Full day time breakdown</p>
            </div>
            <button
              onClick={() => { setEventDate(selectedDate); setShowAddEventModal(true); }}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus size={14} /><span>Add Event</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {timeSlots.map(hour => {
              const hourCustom = customEvents.filter(e => e.date === selectedDate && (parseInt(e.time?.split(':')[0] || '10') === hour));
              const hourTasks = scheduledRevisions.filter(t => t.dueDate === selectedDate && hour === 10);

              return (
                <div key={hour} className="flex space-x-3 p-2 bg-[#1a1614]/60 rounded-2xl border border-[#3f332c]/50 min-h-[50px]">
                  <span className="w-16 text-[10px] font-bold text-orange-300/60 shrink-0 pt-1">
                    {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`}
                  </span>
                  <div className="flex-1 space-y-2">
                    {hourCustom.map(c => (
                      <div key={c.id} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase text-amber-400">{c.type}</span>
                          <h4 className="text-xs font-bold text-[#fef3c7]">{c.title}</h4>
                          <p className="text-[10px] text-orange-200/60">{c.duration} mins • {c.subject || 'General'}</p>
                        </div>
                        <button onClick={() => startStudyNow(c.title, c.duration, c.subject)} className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1">
                          <Play size={10} fill="currentColor" /><span>Study</span>
                        </button>
                      </div>
                    ))}
                    {hourTasks.map(t => (
                      <div key={t.id} className="p-3 bg-orange-600/10 border border-orange-500/30 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase text-orange-400">SM-2 Spaced Recall</span>
                          <h4 className="text-xs font-bold text-[#fef3c7]">{t.itemTitle}</h4>
                        </div>
                        <button onClick={() => startStudyNow(t.itemTitle, t.durationMinutes || 25, 'Spaced Recall')} className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1">
                          <Play size={10} fill="currentColor" /><span>Study</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULE VIEW */}
      {viewMode === 'schedule' && (
        <div className="bg-[#2a221f] p-4 sm:p-6 rounded-3xl border border-[#3f332c] space-y-4">
          <h3 className="text-base font-black text-[#fef3c7]">Upcoming Master Schedule</h3>
          <div className="space-y-3 max-h-[550px] overflow-y-auto">
            {scheduledRevisions.concat(customEvents as any).map((item, i) => (
              <div key={item.id || i} className="p-4 bg-[#1a1614] rounded-2xl border border-[#3f332c] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-600/20 px-2 py-0.5 rounded-md">
                    {(item as any).dueDate || (item as any).date || 'Today'}
                  </span>
                  <h4 className="text-sm font-bold text-[#fef3c7] mt-1">{(item as any).itemTitle || (item as any).title}</h4>
                </div>
                <button 
                  onClick={() => startStudyNow((item as any).itemTitle || (item as any).title, 25)}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Study Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
