import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  Play, 
  Trash2, 
  CheckCircle2, 
  Filter, 
  Flame,
  FileText
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function StudySessionLogs() {
  const { goBack, studySessionLogs, clearStudySessionLogs, setView, theme } = useAppContext();
  const isLight = theme === 'light';

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
  const [copied, setCopied] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const filteredLogs = useMemo(() => {
    if (dateFilter === 'today') {
      return studySessionLogs.filter(l => l.date === todayStr);
    }
    if (dateFilter === 'yesterday') {
      return studySessionLogs.filter(l => l.date === yesterdayStr);
    }
    return studySessionLogs;
  }, [studySessionLogs, dateFilter, todayStr, yesterdayStr]);

  // Aggregate stats
  const totalMinutesToday = useMemo(() => {
    return studySessionLogs
      .filter(l => l.date === todayStr)
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  }, [studySessionLogs, todayStr]);

  const totalMinutesYesterday = useMemo(() => {
    return studySessionLogs
      .filter(l => l.date === yesterdayStr)
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  }, [studySessionLogs, yesterdayStr]);

  const formatMins = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins} mins`;
    return `${hrs}h ${mins}m`;
  };

  // Copy Formatted Study Log
  const handleCopyLogs = (filterMode: 'filtered' | 'all') => {
    const logsToExport = filterMode === 'filtered' ? filteredLogs : studySessionLogs;
    if (logsToExport.length === 0) return;

    let text = `========================================\nMEMORY SHAASTRA — STUDY LOGS EXPORT\nGenerated: ${new Date().toLocaleString()}\n========================================\n\n`;

    logsToExport.forEach((l, idx) => {
      text += `[${idx + 1}] Date: ${l.date} | Mode: ${l.mode.toUpperCase()}\n`;
      text += `Subject: ${l.subject} - Topic: ${l.topic}\n`;
      text += `Active Duration: ${l.durationMinutes} mins (${l.durationSeconds}s)\n`;
      text += `Goal: ${l.goal}\n`;
      if (l.activitiesDone && l.activitiesDone.length > 0) {
        text += `Activities: ${l.activitiesDone.join('; ')}\n`;
      }
      if (l.notes) {
        text += `Notes: ${l.notes}\n`;
      }
      text += `Status: ${l.completed ? 'Goal Completed' : 'Session Ended'}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download Study Log (.txt)
  const handleDownloadTxt = () => {
    if (filteredLogs.length === 0) return;

    let text = `========================================\nMEMORY SHAASTRA — STUDY LOGS EXPORT\nGenerated: ${new Date().toLocaleString()}\n========================================\n\n`;

    filteredLogs.forEach((l, idx) => {
      text += `Session #${idx + 1}\n`;
      text += `Date: ${l.date} (${new Date(l.startTime).toLocaleTimeString()})\n`;
      text += `Subject: ${l.subject} | Topic: ${l.topic}\n`;
      text += `Duration: ${l.durationMinutes} minutes\n`;
      text += `Goal: ${l.goal}\n`;
      if (l.activitiesDone && l.activitiesDone.length > 0) {
        text += `Activities Done: ${l.activitiesDone.join(', ')}\n`;
      }
      if (l.notes) {
        text += `Notes: ${l.notes}\n`;
      }
      text += `----------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MemoryShaastra_StudyLogs_${dateFilter}_${todayStr}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={goBack}
          className={`flex items-center space-x-2 font-bold text-xs uppercase tracking-wider cursor-pointer ${
            isLight ? 'text-orange-700 hover:text-orange-900' : 'text-orange-400 hover:text-orange-300'
          }`}
        >
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
          <Clock size={12} />
          <span>Active Study Logs</span>
        </span>
      </div>

      {/* Main Banner */}
      <div className={`p-6 sm:p-8 rounded-[2.5rem] border space-y-3 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c] shadow-2xl'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              Daily Study Session Logs
            </h1>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isLight ? 'text-stone-600' : 'text-orange-200/70'
            }`}>
              Your active study hours and exact task accomplishments are recorded automatically. Easily review yesterday's or today's study progress, copy it to your study journal, or export it to keep yourself accountable.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border shadow-sm space-y-1 ${
          isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider block ${
            isLight ? 'text-stone-700' : 'text-orange-200/50'
          }`}>
            Active Time Today
          </span>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
            {formatMins(totalMinutesToday)}
          </p>
          <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-orange-200/60'}`}>
            Tracked focus sprints
          </p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm space-y-1 ${
          isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider block ${
            isLight ? 'text-stone-700' : 'text-orange-200/50'
          }`}>
            Active Time Yesterday
          </span>
          <p className="text-2xl font-black text-amber-500">
            {formatMins(totalMinutesYesterday)}
          </p>
          <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-orange-200/60'}`}>
            Ready to review & copy
          </p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-sm space-y-1 ${
          isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider block ${
            isLight ? 'text-stone-700' : 'text-orange-200/50'
          }`}>
            Total Sessions Logged
          </span>
          <p className="text-2xl font-black text-emerald-500">
            {studySessionLogs.length} Sessions
          </p>
          <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-orange-200/60'}`}>
            Persistent history
          </p>
        </div>
      </div>

      {/* Filter & Export Toolbar */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-3 shadow-sm ${
        isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-orange-500" />
          <span className={`text-xs font-bold ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>
            Filter:
          </span>
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'All History' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === f.id
                    ? 'bg-orange-600 text-white shadow'
                    : isLight 
                      ? 'bg-orange-50 text-stone-700 hover:bg-orange-100' 
                      : 'bg-[#1a1614] text-orange-200/60 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopyLogs('filtered')}
            disabled={filteredLogs.length === 0}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow active:scale-95 disabled:opacity-40"
            title="Copy logs to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Logs'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            disabled={filteredLogs.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow active:scale-95 disabled:opacity-40 ${
              isLight ? 'bg-white hover:bg-orange-50 text-stone-800 border-orange-200' : 'bg-[#1a1614] hover:bg-[#342a27] text-orange-200 border-[#3f332c]'
            }`}
            title="Download formatted text file"
          >
            <Download size={14} />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center space-y-4 ${
            isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-orange-100'
          }`}>
            <Clock size={40} className="mx-auto text-orange-400 opacity-60" />
            <div className="space-y-1">
              <h3 className="font-black text-base">No Study Sessions Found for {dateFilter}</h3>
              <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-stone-600' : 'text-orange-200/60'}`}>
                Launch a 3-second Study Bubble sprint or start the stopwatch to record your active learning time automatically.
              </p>
            </div>
            <button
              onClick={() => setView('study-bubble')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Play size={14} className="fill-current" />
              <span>Start Study Session Now</span>
            </button>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-5 rounded-2xl border shadow-sm space-y-3 transition-colors ${
                isLight ? 'bg-white border-orange-200' : 'bg-[#241c19] border-[#3f332c]'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#3f332c]/20 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-orange-500/30">
                    {log.subject}
                  </span>
                  <span className={`text-xs font-black ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>
                    {log.topic}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    log.mode === 'stopwatch' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    • {log.mode === 'stopwatch' ? '⏱️ Stopwatch Sprint' : '⏳ Timer Sprint'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className={`font-bold ${isLight ? 'text-stone-700' : 'text-orange-200/60'}`}>
                    {log.date}
                  </span>
                  <span className="font-black text-orange-600 dark:text-orange-400">
                    {log.durationMinutes}m ({log.durationSeconds}s)
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className={`text-xs ${isLight ? 'text-stone-800' : 'text-orange-100/90'}`}>
                  <strong>Goal:</strong> {log.goal}
                </p>
                {log.activitiesDone && log.activitiesDone.length > 0 && (
                  <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
                    <strong>Activities:</strong> {log.activitiesDone.join(' • ')}
                  </p>
                )}
                {log.notes && (
                  <p className={`text-[11px] italic pt-1 ${isLight ? 'text-stone-600' : 'text-orange-200/50'}`}>
                    "{log.notes}"
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
