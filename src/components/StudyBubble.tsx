import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Target, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  Maximize2, 
  Minimize2, 
  Edit3, 
  Shield, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Layers, 
  Laptop, 
  BookMarked, 
  Smartphone, 
  Apple, 
  Monitor, 
  Wifi, 
  WifiOff, 
  CloudCheck, 
  AlertCircle,
  Eye,
  Coffee,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DocumentViewer, DocumentAttachment } from './DocumentViewer';
import { Flashcard, StudyMaterial } from '../types';
import { offlineSyncManager, OfflineStatus } from '../utils/offlineSync';
import { distractionShield } from '../utils/distractionShield';

interface StudyBubbleSettings {
  subject: string;
  topic: string;
  goal: string;
  durationMinutes: number;
  studyMode: 'screen' | 'offline';
}

interface ActiveBubbleState {
  subject: string;
  topic: string;
  goal: string;
  durationMinutes: number;
  studyMode: 'screen' | 'offline';
  remainingSeconds: number;
  elapsedSeconds: number;
  isActive: boolean;
  isPausedOnBreak: boolean;
  scratchpadNotes: string;
  selectedMaterialId: string | null;
  startedAt: string;
}

const STORAGE_LAST_SETTINGS = 'ms_study_bubble_last_settings';
const STORAGE_ACTIVE_SESSION = 'ms_study_bubble_active_session';

export default function StudyBubble() {
  const { 
    goBack, 
    studyMaterials, 
    flashcards, 
    studyTasks, 
    updateStreak, 
    addXp, 
    logActivity, 
    theme,
    allSubjects
  } = useAppContext();

  const isLight = theme === 'light';

  // Offline status tracking
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>(offlineSyncManager.getStatus());
  useEffect(() => {
    return offlineSyncManager.subscribe(setOfflineStatus);
  }, []);

  // Detect broad OS for distraction protection advice
  const [detectedPlatform, setDetectedPlatform] = useState<'android' | 'ios' | 'mac' | 'windows' | 'other'>('windows');
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setDetectedPlatform('android');
    else if (/iphone|ipad|ipod/.test(ua)) setDetectedPlatform('ios');
    else if (/macintosh|mac os x/.test(ua)) setDetectedPlatform('mac');
    else if (/windows/.test(ua)) setDetectedPlatform('windows');
    else setDetectedPlatform('other');
  }, []);

  // Last-used setup settings (defaults if none saved)
  const [setupSettings, setSetupSettings] = useState<StudyBubbleSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LAST_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return {
      subject: allSubjects[0] || 'General Studies',
      topic: 'Core Revision',
      goal: 'Revise key concepts and complete active recall session',
      durationMinutes: 25,
      studyMode: 'screen'
    };
  });

  // Custom minutes input state
  const [customMinutes, setCustomMinutes] = useState<string>('30');
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  // Active Session State
  const [activeSession, setActiveSession] = useState<ActiveBubbleState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SESSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return null;
  });

  // UI Panels state inside active bubble
  const [activeTab, setActiveTab] = useState<'materials' | 'flashcards' | 'scratchpad' | 'protection'>('materials');
  const [isScratchpadExpanded, setIsScratchpadExpanded] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<DocumentAttachment | null>(null);

  // Flashcards mini-practice in bubble
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Intelligent Exit Dialog State
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<{ goal: string; spentMinutes: number; completed: boolean } | null>(null);

  // Soundscape
  const [soundscape, setSoundscape] = useState<'mute' | 'rain' | 'forest'>('mute');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save active session to localStorage whenever state changes
  useEffect(() => {
    if (activeSession) {
      try {
        localStorage.setItem(STORAGE_ACTIVE_SESSION, JSON.stringify(activeSession));
      } catch (e) {
        console.warn(e);
      }
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_SESSION);
    }
  }, [activeSession]);

  // Main countdown timer interval
  useEffect(() => {
    let interval: any = null;
    if (activeSession && activeSession.isActive && !activeSession.isPausedOnBreak) {
      interval = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          if (prev.remainingSeconds <= 1) {
            handleSessionCompleted(prev);
            return null;
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
            elapsedSeconds: prev.elapsedSeconds + 1
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.isActive, activeSession?.isPausedOnBreak]);

  // Format MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start a new session from entry workflow
  const handleStartSession = () => {
    const duration = isCustomDuration ? (parseInt(customMinutes, 10) || 25) : setupSettings.durationMinutes;
    const newSession: ActiveBubbleState = {
      subject: setupSettings.subject,
      topic: setupSettings.topic,
      goal: setupSettings.goal || 'Complete dedicated focus study',
      durationMinutes: duration,
      studyMode: setupSettings.studyMode,
      remainingSeconds: duration * 60,
      elapsedSeconds: 0,
      isActive: true,
      isPausedOnBreak: false,
      scratchpadNotes: '',
      selectedMaterialId: studyMaterials[0]?.id || null,
      startedAt: new Date().toISOString()
    };

    // Save as last settings
    try {
      localStorage.setItem(STORAGE_LAST_SETTINGS, JSON.stringify(setupSettings));
    } catch (e) {
      console.warn(e);
    }

    setActiveSession(newSession);
    distractionShield.toggleShield(); // activate focus shield
  };

  // Session Completed handler
  const handleSessionCompleted = (sess: ActiveBubbleState) => {
    const spentMinutes = Math.round(sess.elapsedSeconds / 60) || sess.durationMinutes;
    if (updateStreak) updateStreak();
    if (addXp) addXp(sess.durationMinutes * 2);
    if (logActivity) logActivity(`Completed Study Bubble session: ${sess.goal}`, 'study-task');

    // Queue offline sync
    offlineSyncManager.enqueue('session_complete', {
      subject: sess.subject,
      goal: sess.goal,
      spentMinutes,
      date: new Date().toISOString()
    });

    setSummaryData({
      goal: sess.goal,
      spentMinutes,
      completed: true
    });
    setShowSummaryModal(true);
    setActiveSession(null);
  };

  // Intelligent Exit Handlers
  const handleRequestExit = () => {
    if (!activeSession) {
      goBack();
      return;
    }
    setShowExitConfirm(true);
  };

  const handleContinueStudying = () => {
    setShowExitConfirm(false);
  };

  const handleTakeBreak = () => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, isPausedOnBreak: true } : null);
    }
    setShowExitConfirm(false);
  };

  const handleResumeFromBreak = () => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, isPausedOnBreak: false, isActive: true } : null);
    }
  };

  const handleEndSessionEarly = () => {
    if (!activeSession) return;
    const spentMinutes = Math.max(1, Math.round(activeSession.elapsedSeconds / 60));
    setSummaryData({
      goal: activeSession.goal,
      spentMinutes,
      completed: false
    });
    setShowExitConfirm(false);
    setShowSummaryModal(true);
    setActiveSession(null);
  };

  // Filter study materials & flashcards matching current session
  const relevantMaterials = studyMaterials.filter(m => 
    !activeSession?.subject || m.groupName === activeSession.subject || m.title.toLowerCase().includes(activeSession.subject.toLowerCase())
  );

  const relevantCards = flashcards.filter(f => 
    !activeSession?.subject || f.subject === activeSession.subject
  );

  return (
    <div className="min-h-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ========================================================================= */}
      {/* 1. ENTRY WORKFLOW (When No Active Session)                                */}
      {/* ========================================================================= */}
      {!activeSession && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button 
              onClick={goBack}
              className={`flex items-center space-x-2 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer ${
                isLight ? 'text-orange-700 hover:text-orange-900' : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              <ChevronLeft size={18} />
              <span>Back to Dashboard</span>
            </button>

            {/* Offline status badge */}
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
              offlineStatus.isOnline 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              {offlineStatus.isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{offlineStatus.isOnline ? 'Online & Synced' : 'Offline Study Ready'}</span>
            </div>
          </div>

          {/* Hero Entry Card */}
          <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden transition-colors ${
            isLight 
              ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100/70 border-orange-300 shadow-orange-500/10 text-stone-900' 
              : 'bg-gradient-to-br from-[#2a221f] via-[#221b18] to-[#1a1614] border-orange-500/40 text-amber-100 shadow-2xl'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Distraction-Minimised Study Bubble
                </span>
                <h1 className={`text-2xl sm:text-3xl font-black italic tracking-tight ${
                  isLight ? 'text-stone-900' : 'text-amber-100'
                }`}>
                  Enter Study Bubble
                </h1>
                <p className={`text-xs max-w-xl leading-relaxed ${
                  isLight ? 'text-stone-700' : 'text-orange-200/80'
                }`}>
                  Bring your essential study materials, flashcards, active recall questions, and a scratchpad into one focused space. Optimise learning outcomes, study deeply, then step away.
                </p>
              </div>

              <div className="p-4 bg-orange-600/20 rounded-3xl border border-orange-500/30 text-orange-500 shrink-0 hidden sm:block">
                <Target size={36} />
              </div>
            </div>
          </div>

          {/* 5-Step Entry Workflow Form */}
          <div className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-xl space-y-6 transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
            {/* Step 1: Subject & Topic */}
            <div className="space-y-3">
              <label className={`text-[11px] font-black uppercase tracking-wider block ${
                isLight ? 'text-stone-800' : 'text-orange-200'
              }`}>
                Step 1: Select Subject & Topic
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 dark:text-orange-200/60 block mb-1">Subject</label>
                  <select
                    value={setupSettings.subject}
                    onChange={e => setSetupSettings(prev => ({ ...prev, subject: e.target.value }))}
                    className={`w-full text-xs py-3 px-3.5 rounded-xl border font-bold focus:outline-none focus:border-orange-500 ${
                      isLight ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                    }`}
                  >
                    {allSubjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="General Studies">General Studies</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 dark:text-orange-200/60 block mb-1">Topic / Chapter</label>
                  <input
                    type="text"
                    value={setupSettings.topic}
                    onChange={e => setSetupSettings(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g. Audit Standards, Chemical Kinetics..."
                    className={`w-full text-xs py-3 px-3.5 rounded-xl border font-bold focus:outline-none focus:border-orange-500 ${
                      isLight ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Specific Study Goal */}
            <div className="space-y-2">
              <label className={`text-[11px] font-black uppercase tracking-wider block ${
                isLight ? 'text-stone-800' : 'text-orange-200'
              }`}>
                Step 2: Enter Specific Session Goal
              </label>
              <input
                type="text"
                value={setupSettings.goal}
                onChange={e => setSetupSettings(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="e.g. Revise 15 audit questions, Learn the provisions of five sections..."
                className={`w-full text-xs py-3.5 px-4 rounded-xl border font-bold focus:outline-none focus:border-orange-500 ${
                  isLight ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                }`}
              />
              {/* Quick Goal Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Revise 15 exam questions',
                  'Memorize 5 key sections',
                  'Active recall flashcard sprint',
                  'Summarize chapter into scratchpad'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSetupSettings(prev => ({ ...prev, goal: preset }))}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                      setupSettings.goal === preset
                        ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                        : isLight
                        ? 'bg-stone-50 border-orange-200 text-stone-700 hover:border-orange-400'
                        : 'bg-[#1a1614] border-[#3f332c] text-orange-200/70 hover:border-orange-500/40'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Session Duration Presets */}
            <div className="space-y-2">
              <label className={`text-[11px] font-black uppercase tracking-wider block ${
                isLight ? 'text-stone-800' : 'text-orange-200'
              }`}>
                Step 3: Session Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[15, 25, 45].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setIsCustomDuration(false);
                      setSetupSettings(prev => ({ ...prev, durationMinutes: mins }));
                    }}
                    className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      !isCustomDuration && setupSettings.durationMinutes === mins
                        ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md'
                        : isLight
                        ? 'bg-orange-50/60 border-orange-200 text-stone-800 hover:border-orange-400'
                        : 'bg-[#1a1614] border-[#3f332c] text-orange-200/70 hover:border-orange-500/40'
                    }`}
                  >
                    <Clock size={14} />
                    <span>{mins} Mins</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsCustomDuration(true)}
                  className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCustomDuration
                      ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md'
                      : isLight
                      ? 'bg-orange-50/60 border-orange-200 text-stone-800 hover:border-orange-400'
                      : 'bg-[#1a1614] border-[#3f332c] text-orange-200/70 hover:border-orange-500/40'
                  }`}
                >
                  <Edit3 size={14} />
                  <span>Custom Mins</span>
                </button>
              </div>

              {isCustomDuration && (
                <div className="pt-2 flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    className={`w-28 text-xs py-2 px-3 rounded-xl border font-bold ${
                      isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                    }`}
                  />
                  <span className="text-xs font-bold text-stone-600 dark:text-orange-200/70">Minutes duration</span>
                </div>
              )}
            </div>

            {/* Step 4: Study Mode (Screen Study vs Offline Study) */}
            <div className="space-y-2">
              <label className={`text-[11px] font-black uppercase tracking-wider block ${
                isLight ? 'text-stone-800' : 'text-orange-200'
              }`}>
                Step 4: Study Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSetupSettings(prev => ({ ...prev, studyMode: 'screen' }))}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    setupSettings.studyMode === 'screen'
                      ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-black'
                      : isLight
                      ? 'bg-orange-50/50 border-orange-200 text-stone-800 hover:border-orange-400'
                      : 'bg-[#1a1614] border-[#3f332c] text-orange-200/80 hover:border-orange-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Laptop size={16} />
                    <span className="text-xs font-black uppercase tracking-wider">Screen Study</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    setupSettings.studyMode === 'screen' ? 'text-slate-950 font-bold' : isLight ? 'text-stone-600' : 'text-orange-200/60'
                  }`}>
                    Access your documents, flashcards, active recall questions and scratchpad directly inside Memory Shaastra.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupSettings(prev => ({ ...prev, studyMode: 'offline' }))}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    setupSettings.studyMode === 'offline'
                      ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-black'
                      : isLight
                      ? 'bg-orange-50/50 border-orange-200 text-stone-800 hover:border-orange-400'
                      : 'bg-[#1a1614] border-[#3f332c] text-orange-200/80 hover:border-orange-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookMarked size={16} />
                    <span className="text-xs font-black uppercase tracking-wider">Offline Study</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    setupSettings.studyMode === 'offline' ? 'text-slate-950 font-bold' : isLight ? 'text-stone-600' : 'text-orange-200/60'
                  }`}>
                    Study from physical textbooks or printed notes. The app acts as a silent focus anchor and timer, saving your progress.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 5: Start Session Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleStartSession}
                className="w-full py-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={18} className="fill-current" />
                <span>Start Study Bubble Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE STUDY BUBBLE WORKSPACE                                          */}
      {/* ========================================================================= */}
      {activeSession && (
        <div className="space-y-6">
          {/* Top Sticky Bubble Bar */}
          <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Target size={11} />
                  <span>{activeSession.subject} • {activeSession.topic}</span>
                </span>
                <span className={`text-[10px] font-bold uppercase ${
                  activeSession.studyMode === 'offline' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {activeSession.studyMode === 'offline' ? '📖 Book / Offline Mode' : '💻 Screen Study Mode'}
                </span>
              </div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight ${
                isLight ? 'text-stone-900' : 'text-amber-100'
              }`}>
                Goal: {activeSession.goal}
              </h2>
            </div>

            {/* Action buttons: Pause/Break, End */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {activeSession.isPausedOnBreak ? (
                <button
                  onClick={handleResumeFromBreak}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={14} className="fill-current" />
                  <span>Resume Session</span>
                </button>
              ) : (
                <button
                  onClick={handleTakeBreak}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLight 
                      ? 'bg-orange-50 hover:bg-orange-100 text-stone-800 border-orange-200' 
                      : 'bg-[#1a1614] hover:bg-[#342722] text-orange-200 border-[#3f332c]'
                  }`}
                  title="Pause and take a short break"
                >
                  <Coffee size={14} className="text-amber-500" />
                  <span>Take Break</span>
                </button>
              )}

              <button
                onClick={handleRequestExit}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Exit Session
              </button>
            </div>
          </div>

          {/* On Break Banner */}
          {activeSession.isPausedOnBreak && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isLight ? 'bg-amber-50 border-amber-300 text-stone-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <Coffee size={18} className="text-amber-500 shrink-0" />
                <span>
                  <strong>On a Break:</strong> Timer paused and current work saved. Stretch your eyes, drink water, and resume when ready.
                </span>
              </div>
              <button
                onClick={handleResumeFromBreak}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Resume
              </button>
            </div>
          )}

          {/* Prominent Central Countdown Clock */}
          <div className={`p-6 sm:p-8 rounded-[3rem] border shadow-2xl flex flex-col items-center justify-center space-y-4 transition-colors ${
            isLight ? 'bg-white border-orange-200 shadow-orange-500/10' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
            <span className={`text-5xl sm:text-7xl font-mono font-black tracking-tight ${
              isLight ? 'text-stone-900' : 'text-amber-100'
            }`}>
              {formatTime(activeSession.remainingSeconds)}
            </span>

            {/* Quick time controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSession(prev => prev ? ({ ...prev, remainingSeconds: prev.remainingSeconds + 300 }) : null)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isLight ? 'bg-orange-50 border-orange-200 text-stone-800' : 'bg-[#1a1614] border-[#3f332c] text-orange-200'
                }`}
              >
                +5 Mins
              </button>

              <button
                onClick={() => setActiveSession(prev => prev ? ({ ...prev, isActive: !prev.isActive }) : null)}
                className={`px-4 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSession.isActive 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                    : 'bg-emerald-600 text-white border-emerald-500'
                }`}
              >
                {activeSession.isActive ? <Pause size={12} /> : <Play size={12} />}
                <span>{activeSession.isActive ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
          </div>

          {/* Integrated Study Workspace Tabs */}
          <div className="space-y-4">
            <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border w-full sm:w-auto transition-colors ${
              isLight ? 'bg-orange-100/70 border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
            }`}>
              {[
                { id: 'materials', label: 'Study Documents', icon: BookOpen },
                { id: 'flashcards', label: 'Flashcard Recall', icon: Layers },
                { id: 'scratchpad', label: 'Notes Scratchpad', icon: Edit3 },
                { id: 'protection', label: 'Distraction Protection', icon: Shield }
              ].map(tab => {
                const Icon = tab.icon;
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSel
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                        : isLight
                        ? 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                        : 'text-orange-200/70 hover:text-orange-100 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: STUDY DOCUMENTS (with in-app DocumentViewer) */}
            {activeTab === 'materials' && (
              <div className={`p-6 rounded-[2.5rem] border shadow-xl space-y-4 transition-colors ${
                isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 border-orange-100 dark:border-[#3f332c]">
                  <h3 className={`text-sm font-black uppercase tracking-wider ${
                    isLight ? 'text-stone-900' : 'text-amber-100'
                  }`}>
                    Materials for {activeSession.subject}
                  </h3>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-orange-200/60">
                    {relevantMaterials.length} Documents Available
                  </span>
                </div>

                {relevantMaterials.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 dark:text-orange-200/60 space-y-2">
                    <p>No documents uploaded specifically under this subject yet.</p>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      You can study from your printed notes or switch to the Scratchpad tab to jot bullet points!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {relevantMaterials.map(mat => (
                      <div 
                        key={mat.id}
                        className={`p-4 rounded-2xl border space-y-2 transition-all ${
                          isLight ? 'bg-orange-50/60 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
                        }`}
                      >
                        <h4 className="font-bold text-xs text-stone-900 dark:text-orange-100">{mat.title}</h4>
                        <p className="text-[11px] text-stone-600 dark:text-orange-200/70 line-clamp-2">{mat.content}</p>
                        {mat.attachments && mat.attachments.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-2">
                            {mat.attachments.map(att => (
                              <button
                                key={att.id}
                                onClick={() => setViewingAttachment(att)}
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Eye size={12} />
                                <span>View {att.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FLASHCARD RECALL PRACTICE */}
            {activeTab === 'flashcards' && (
              <div className={`p-6 rounded-[2.5rem] border shadow-xl space-y-4 transition-colors ${
                isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
              }`}>
                {relevantCards.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 dark:text-orange-200/60">
                    No flashcards created for {activeSession.subject} yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-w-lg mx-auto">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-orange-200/60">
                      <span>Card {activeCardIndex + 1} of {relevantCards.length}</span>
                      <span>Spaced Recall</span>
                    </div>

                    {/* Flippable Card */}
                    <div 
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className={`min-h-[180px] p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center cursor-pointer shadow-md transition-all select-none ${
                        isLight ? 'bg-orange-50/80 border-orange-300 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-amber-100'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">
                        {isCardFlipped ? 'Answer / Recall' : 'Question (Click to Flip)'}
                      </span>
                      <p className="text-sm sm:text-base font-black leading-relaxed">
                        {isCardFlipped ? relevantCards[activeCardIndex].answer : relevantCards[activeCardIndex].question}
                      </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          setIsCardFlipped(false);
                          setActiveCardIndex(prev => Math.max(0, prev - 1));
                        }}
                        disabled={activeCardIndex === 0}
                        className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-40 ${
                          isLight ? 'bg-white border-orange-200 text-stone-800' : 'bg-[#1a1614] border-[#3f332c] text-orange-200'
                        }`}
                      >
                        Previous Card
                      </button>

                      <button
                        onClick={() => {
                          setIsCardFlipped(false);
                          setActiveCardIndex(prev => Math.min(relevantCards.length - 1, prev + 1));
                        }}
                        disabled={activeCardIndex === relevantCards.length - 1}
                        className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-40"
                      >
                        Next Card
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SCRATCHPAD */}
            {activeTab === 'scratchpad' && (
              <div className={`p-6 rounded-[2.5rem] border shadow-xl space-y-3 transition-colors ${
                isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 border-orange-100 dark:border-[#3f332c]">
                  <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                    isLight ? 'text-stone-900' : 'text-amber-100'
                  }`}>
                    <Edit3 size={16} className="text-orange-500" />
                    <span>Session Scratchpad (Auto-Saved)</span>
                  </h3>
                  <button
                    onClick={() => setIsScratchpadExpanded(!isScratchpadExpanded)}
                    className="p-1.5 text-stone-500 hover:text-orange-500"
                    title={isScratchpadExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isScratchpadExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>

                <textarea
                  value={activeSession.scratchpadNotes}
                  onChange={e => setActiveSession(prev => prev ? ({ ...prev, scratchpadNotes: e.target.value }) : null)}
                  placeholder="Jot down bullet points, active recall answers, mnemonics, or formulas here..."
                  rows={isScratchpadExpanded ? 16 : 8}
                  className={`w-full text-xs p-4 rounded-2xl border font-mono font-medium focus:outline-none focus:border-orange-500 transition-all ${
                    isLight 
                      ? 'bg-orange-50/60 border-orange-200 text-stone-900 placeholder:text-stone-400 focus:bg-white' 
                      : 'bg-[#1a1614] border-[#3f332c] text-orange-100 placeholder:text-orange-200/30'
                  }`}
                />
              </div>
            )}

            {/* TAB 4: DISTRACTION PROTECTION SETTINGS */}
            {activeTab === 'protection' && (
              <div className={`p-6 rounded-[2.5rem] border shadow-xl space-y-6 transition-colors ${
                isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
              }`}>
                <div className="border-b pb-3 border-orange-100 dark:border-[#3f332c]">
                  <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                    isLight ? 'text-stone-900' : 'text-amber-100'
                  }`}>
                    <Shield size={16} className="text-orange-500" />
                    <span>Distraction Protection & Digital Wellbeing</span>
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
                    Understand what Memory Shaastra controls inside the app versus operating system restrictions.
                  </p>
                </div>

                {/* 3 Realist Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">1. In-App Focus Controls</span>
                    <h4 className="text-xs font-bold">Memory Shaastra Shield</h4>
                    <p className="text-[11px] text-stone-600 dark:text-orange-200/70">
                      Suppresses distracting in-app toasts and sound alerts, hides competing dashboard recommendations, and prevents accidental navigation.
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Active in Study Bubble
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">2. Device-Level Restrictions</span>
                    <h4 className="text-xs font-bold">OS App Blocking</h4>
                    <p className="text-[11px] text-stone-600 dark:text-orange-200/70">
                      Web browsers cannot physically block other native applications on your phone or computer. Use your device's native Focus Mode below.
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      ℹ Configured via OS Settings
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-orange-50/70 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">3. Screen-Time Tracking</span>
                    <h4 className="text-xs font-bold">OS Digital Wellbeing</h4>
                    <p className="text-[11px] text-stone-600 dark:text-orange-200/70">
                      Memory Shaastra tracks study learning outcomes, not screen time. Check your device's Digital Wellbeing dashboard for total screen hours.
                    </p>
                  </div>
                </div>

                {/* Platform-Specific Setup Guide */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isLight ? 'bg-amber-50/80 border-amber-300' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {detectedPlatform === 'android' && <Smartphone size={16} className="text-orange-500" />}
                    {(detectedPlatform === 'ios' || detectedPlatform === 'mac') && <Apple size={16} className="text-orange-500" />}
                    {detectedPlatform === 'windows' && <Monitor size={16} className="text-orange-500" />}
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-amber-200">
                      Platform Guide: {detectedPlatform.toUpperCase()}
                    </h4>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-orange-100/90 leading-relaxed">
                    {detectedPlatform === 'android' && (
                      <span>Open <strong>Settings → Digital Wellbeing & Parental Controls → Focus Mode</strong>. Select social and video apps to pause them during your study session.</span>
                    )}
                    {(detectedPlatform === 'ios' || detectedPlatform === 'mac') && (
                      <span>Open <strong>Settings → Focus → Study / Do Not Disturb</strong>. Turn on Focus and silence notifications from distracting apps during study hours.</span>
                    )}
                    {detectedPlatform === 'windows' && (
                      <span>Open <strong>Settings → System → Focus</strong> or click the notification bell in the bottom-right corner and select <strong>Focus session</strong> to suppress popups.</span>
                    )}
                    {detectedPlatform === 'other' && (
                      <span>Activate your operating system's Do Not Disturb or Focus Assist mode to block non-essential notifications while studying.</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTELLIGENT EXIT PROMPT MODAL (Neutral, No Guilt or Manipulative Alerts) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 text-center transition-colors ${
                isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-amber-100'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Target size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight">Leaving your study session?</h3>
                <p className="text-xs text-stone-600 dark:text-orange-200/70">
                  You have an active session for <strong>{activeSession?.goal}</strong>. Choose what you would like to do:
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={handleContinueStudying}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Continue Studying
                </button>

                <button
                  onClick={handleTakeBreak}
                  className={`w-full py-3 rounded-xl border text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                    isLight 
                      ? 'bg-orange-50 hover:bg-orange-100 text-stone-800 border-orange-200' 
                      : 'bg-[#1a1614] hover:bg-[#342722] text-orange-200 border-[#3f332c]'
                  }`}
                >
                  Take a Break (Pause Timer & Save)
                </button>

                <button
                  onClick={handleEndSessionEarly}
                  className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. SUMMARY MODAL UPON COMPLETION OR END                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSummaryModal && summaryData && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 text-center transition-colors ${
                isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-amber-100'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={30} />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {summaryData.completed ? 'Goal Complete!' : 'Session Saved'}
                </span>
                <h3 className="text-xl font-black tracking-tight">Study Session Summary</h3>
                <p className="text-xs text-stone-600 dark:text-orange-200/70">
                  {summaryData.goal}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border grid grid-cols-2 gap-4 ${
                isLight ? 'bg-orange-50/70 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
              }`}>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-500 dark:text-orange-200/50">Time Dedicated</p>
                  <p className="text-xl font-black text-orange-600 dark:text-orange-400 mt-0.5">{summaryData.spentMinutes} Mins</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-stone-500 dark:text-orange-200/50">Progress Saved</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">100% Synced</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    setSummaryData(null);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Start Another Session
                </button>

                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    setSummaryData(null);
                    goBack();
                  }}
                  className={`w-full py-3 rounded-xl border text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                    isLight ? 'bg-stone-50 border-orange-200 text-stone-800' : 'bg-[#1a1614] border-[#3f332c] text-orange-200'
                  }`}
                >
                  Close & Continue Offline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Document Viewer Modal inside Study Bubble */}
      {viewingAttachment && (
        <DocumentViewer
          attachment={viewingAttachment}
          isModal={true}
          onClose={() => setViewingAttachment(null)}
        />
      )}
    </div>
  );
}
