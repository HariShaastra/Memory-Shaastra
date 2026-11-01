import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Sparkles,
  Coffee,
  Shield,
  Sliders,
  Check,
  Keyboard,
  Search,
  ExternalLink
} from 'lucide-react';
import { t } from '../utils/translations';
import { ShortcutsTable } from './ShortcutsTable';
import { 
  exportToJSON, 
  validateAndParseBackup, 
  exportFlashcardsToCSV, 
  parseFlashcardsFromCSV,
  BackupData
} from '../utils/storage';

export default function Settings() {
  const { 
    user, setUser, setView, theme, setTheme,
    studyTasks, setStudyTasks,
    mnemonics, setMnemonics,
    memoryPalaces, setMemoryPalaces,
    linkChains, setLinkChains,
    storyChains, setStoryChains,
    firstLetterEntries, setFirstLetterEntries,
    flashcards, setFlashcards,
    revisions, setRevisions,
    examPlans, setExamPlans,
    studyMaterials, setStudyMaterials,
    memoryLinks, setMemoryLinks,
    adaptiveStudyConfig,
    updateAdaptiveStudyConfig,
    pauseAdaptiveStudyTracking,
    resumeAdaptiveStudyTracking,
    triggerManualInterventionTest,
    resetAdaptiveStudyTimer
  } = useApp();

  const isLight = theme === 'light';

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Status logs for user feedback
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const saveProfile = () => {
    if (user) {
      setUser({
        ...user,
        name: editName,
        email: editEmail
      });
    }
    setIsEditing(false);
    showStatus('Profile updated successfully!', 'success');
  };

  // Trigger Complete JSON Backup Export
  const handleExportJSON = () => {
    try {
      const backup: BackupData = {
        version: '1.2.0',
        timestamp: new Date().toISOString(),
        studyTasks,
        mnemonics,
        memoryPalaces,
        linkChains,
        storyChains,
        firstLetterEntries,
        flashcards,
        revisions,
        examPlans,
        studyMaterials,
        memoryLinks
      };
      exportToJSON(backup);
      showStatus('System backup JSON generated and downloaded!', 'success');
    } catch (err: any) {
      showStatus('Failed to generate backup: ' + err.message, 'error');
    }
  };

  // Trigger JSON Backup Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const backup = validateAndParseBackup(text);

        if (backup.studyTasks) setStudyTasks(backup.studyTasks);
        if (backup.mnemonics) setMnemonics(backup.mnemonics);
        if (backup.memoryPalaces) setMemoryPalaces(backup.memoryPalaces);
        if (backup.linkChains) setLinkChains(backup.linkChains);
        if (backup.storyChains) setStoryChains(backup.storyChains);
        if (backup.firstLetterEntries) setFirstLetterEntries(backup.firstLetterEntries);
        if (backup.flashcards) setFlashcards(backup.flashcards);
        if (backup.revisions) setRevisions(backup.revisions);
        if (backup.examPlans) setExamPlans(backup.examPlans);
        if (backup.studyMaterials) setStudyMaterials(backup.studyMaterials);
        if (backup.memoryLinks) setMemoryLinks(backup.memoryLinks);

        showStatus('Full memory sets restored successfully!', 'success');
      } catch (err: any) {
        showStatus('Failed to parse backup: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Trigger CSV Flashcards Export
  const handleExportCSV = () => {
    if (flashcards.length === 0) {
      showStatus('No flashcards found to export.', 'info');
      return;
    }
    try {
      exportFlashcardsToCSV(flashcards);
      showStatus(`Exported ${flashcards.length} flashcards to CSV!`, 'success');
    } catch (err: any) {
      showStatus('CSV export failed: ' + err.message, 'error');
    }
  };

  // Trigger CSV Flashcards Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseFlashcardsFromCSV(text);
        if (parsed.length === 0) {
          showStatus('No valid flashcards found in the CSV file.', 'error');
          return;
        }

        // Merge imported cards into existing cards array
        const importedFull = parsed.map(p => ({
          id: p.id || Math.random().toString(36).substring(2, 11),
          question: p.question || 'Empty Question',
          answer: p.answer || 'Empty Answer',
          subject: p.subject || 'Imported',
          chapter: p.chapter || '',
          difficulty: p.difficulty || 'medium',
          easeFactor: p.easeFactor || 2.5,
          interval: p.interval || 0,
          nextReview: p.nextReview || new Date().toISOString()
        }));

        setFlashcards(prev => [...prev, ...importedFull]);
        showStatus(`Successfully imported and merged ${importedFull.length} flashcards!`, 'success');
      } catch (err: any) {
        showStatus('CSV import failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleClearAllData = () => {
    if (window.confirm('CRITICAL: This will permanently purge all your active recall study progress, mnemonics, flashcard decks, and library content. There is no undo. Are you sure?')) {
      localStorage.clear();
      setStudyTasks([]);
      setMnemonics([]);
      setMemoryPalaces([]);
      setLinkChains([]);
      setStoryChains([]);
      setFirstLetterEntries([]);
      setFlashcards([]);
      setRevisions([]);
      setExamPlans([]);
      setStudyMaterials([]);
      setMemoryLinks([]);
      showStatus('All local databases cleared completely!', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10 w-full max-w-full overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-orange-500/20 pb-6">
        <div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-sm ${
            isLight ? 'text-stone-900' : 'text-orange-100'
          }`}>
            {t.settings}
          </h2>
          <p className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mt-1 italic ${
            isLight ? 'text-stone-600' : 'text-orange-200/60'
          }`}>
            Customize active recall, study balance & keyboard shortcuts
          </p>
        </div>
        {user && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border border-amber-500/20 shadow-sm active:scale-95 cursor-pointer w-fit"
          >
            <Edit2 size={15} /> {t.edit}
          </button>
        )}
      </header>

      {/* Floating Status Notification bar */}
      {statusMessage && (
        <div className={`p-4 sm:p-5 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-all ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : statusMessage.type === 'error'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Profile Section (Clean, Non-Clipping on Mobile) */}
      <section className={`border rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-xl relative overflow-hidden transition-colors ${
        isLight ? 'bg-white border-orange-200 text-stone-900 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c] text-orange-100'
      }`}>
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <UserIcon size={100} className="text-orange-500" />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-500 flex items-center justify-center shadow-inner shrink-0">
              <UserIcon size={30} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-xl sm:text-2xl font-black italic tracking-tight truncate ${
                isLight ? 'text-stone-900' : 'text-orange-100'
              }`}>
                {user?.name || 'Learner'}
              </h3>
              <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] truncate ${
                isLight ? 'text-stone-500' : 'text-orange-200/50'
              }`}>
                {user?.email || 'Offline Local Account'}
              </p>
            </div>
          </div>
          {!user && (
            <button 
              onClick={() => setView('auth')}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-orange-700 hover:to-amber-700 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
            >
              {t.signIn}
            </button>
          )}
        </div>

        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">{t.title}</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#1a1614] border border-orange-500/30 rounded-2xl py-4 px-6 text-sm text-orange-100 font-bold italic outline-none focus:border-orange-500 shadow-inner"
                />
              ) : (
                <div className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-sm text-orange-100 font-bold italic shadow-inner">
                  {user?.name || ''}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-orange-200/20 uppercase tracking-[0.3em] ml-6 italic">Email</label>
              {isEditing ? (
                <input 
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#1a1614] border border-orange-500/30 rounded-2xl py-4 px-6 text-sm text-orange-100 font-bold italic outline-none focus:border-orange-500 shadow-inner"
                />
              ) : (
                <div className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 text-sm text-orange-100 font-bold italic shadow-inner">
                  {user?.email || ''}
                </div>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-4 mt-8 relative z-10">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 px-5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-200/80 dark:bg-stone-800/80 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-2xl transition-all border border-stone-300 dark:border-stone-700"
            >
              {t.cancel}
            </button>
            <button 
              onClick={saveProfile}
              className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 active:scale-95"
            >
              {t.save}
            </button>
          </div>
        )}
      </section>

      {/* Visual Workspace Customization */}
      <section className={`rounded-[3.5rem] p-8 sm:p-10 shadow-lg space-y-6 border transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <div>
          <h3 className={`text-lg font-black italic uppercase ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>
            Theme Customization
          </h3>
          <p className={`text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-stone-500' : 'text-orange-200/50'}`}>
            Select visual aesthetic parameters for maximum readability
          </p>
        </div>

        <div className={`flex flex-col sm:flex-row items-center gap-4 p-6 rounded-[2.5rem] border ${
          isLight ? 'bg-orange-50/70 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]/60'
        }`}>
          <span className={`text-xs font-black uppercase tracking-widest flex-1 ${
            isLight ? 'text-stone-800' : 'text-orange-200/70'
          }`}>
            Workspace Brightness
          </span>
          
          <div className={`flex p-1.5 rounded-2xl border gap-1 ${
            isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
          }`}>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : isLight ? 'text-stone-600 hover:text-stone-900' : 'text-orange-200/40 hover:text-orange-300'
              }`}
            >
              <Moon size={14} />
              <span>Cosmic Dark</span>
            </button>
            
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                theme === 'light' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : isLight ? 'text-stone-600 hover:text-stone-900' : 'text-orange-200/40 hover:text-orange-300'
              }`}
            >
              <Sun size={14} />
              <span>Warm Light</span>
            </button>
          </div>
        </div>
      </section>

      {/* Screen Balance & Adaptive Study Mode Section */}
      <section className={`rounded-[3.5rem] p-8 sm:p-10 shadow-lg space-y-6 border transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                <Coffee size={18} />
              </span>
              <h3 className={`text-lg font-black italic uppercase ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>
                Screen Balance & Adaptive Study Mode
              </h3>
            </div>
            <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${isLight ? 'text-stone-500' : 'text-orange-200/50'}`}>
              Gently encourages students to take mindful breaks after prolonged continuous study
            </p>
          </div>

          {/* Enable / Disable Toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold ${isLight ? 'text-stone-700' : 'text-orange-200/80'}`}>
              {adaptiveStudyConfig.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => updateAdaptiveStudyConfig({ isEnabled: !adaptiveStudyConfig.isEnabled })}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer relative ${
                adaptiveStudyConfig.isEnabled ? 'bg-orange-500' : isLight ? 'bg-stone-300' : 'bg-stone-700'
              }`}
              aria-label="Toggle Adaptive Study Mode"
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                adaptiveStudyConfig.isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Threshold Selector */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isLight ? 'bg-orange-50/60 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Intervention Threshold
              </span>
              <span className="text-xs font-bold text-amber-500">
                Triggers after {adaptiveStudyConfig.thresholdHours} hours
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              Select how many hours of continuous active study (flashcards, recall, reading) should trigger the gentle 5-minute break intervention:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[2, 3].map(hours => (
                <button
                  key={hours}
                  onClick={() => updateAdaptiveStudyConfig({ thresholdHours: hours })}
                  className={`py-3 px-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    adaptiveStudyConfig.thresholdHours === hours
                      ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md font-black'
                      : isLight 
                        ? 'bg-white hover:bg-orange-100/60 text-stone-700 border-orange-200' 
                        : 'bg-[#241c19] hover:bg-[#322722] text-orange-200 border-[#3f332c]'
                  }`}
                >
                  <Clock size={14} />
                  <span>{hours} Hours {hours === 3 ? '(Default)' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Active Study Session Tracking & Manual Controls */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isLight ? 'bg-orange-50/60 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Continuous Active Study
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                adaptiveStudyConfig.isTrackingPaused
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {adaptiveStudyConfig.isTrackingPaused ? 'Paused' : 'Tracking Active'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-black">
                {Math.floor(adaptiveStudyConfig.continuousStudySeconds / 3600)}h{' '}
                {Math.floor((adaptiveStudyConfig.continuousStudySeconds % 3600) / 60)}m{' '}
                {adaptiveStudyConfig.continuousStudySeconds % 60}s
              </span>
              <span className="text-xs opacity-70">
                / {adaptiveStudyConfig.thresholdHours}h target
              </span>
            </div>

            <p className="text-[11px] leading-relaxed opacity-80">
              Automatically pauses after 5 minutes of inactivity. Use manual pause when studying from physical books or paper scratchpads:
            </p>

            <div className="flex items-center gap-2 pt-1">
              {adaptiveStudyConfig.isTrackingPaused ? (
                <button
                  onClick={resumeAdaptiveStudyTracking}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Play size={14} /> Resume Tracking
                </button>
              ) : (
                <button
                  onClick={pauseAdaptiveStudyTracking}
                  className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Pause size={14} /> Pause Tracking
                </button>
              )}
              <button
                onClick={resetAdaptiveStudyTimer}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200' : 'bg-[#241c19] hover:bg-[#322722] text-orange-200 border-[#3f332c]'
                }`}
                title="Reset continuous study timer"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Test & Preview Experience */}
        <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
          isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-[#181311] border-[#362923]'
        }`}>
          <div className="space-y-1 max-w-xl">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
              <Eye size={15} /> Preview 5-Minute Grayscale Break Mode
            </h4>
            <p className="text-xs leading-relaxed opacity-85">
              Experience how Memory Shaastra gently dims and shifts to grayscale without locking you out, blocking text, or resetting your study progress.
            </p>
          </div>

          <button
            onClick={triggerManualInterventionTest}
            className="py-3 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={15} /> Test Break Mode Now
          </button>
        </div>

        {/* 4. Technical Scope & Device Boundaries Disclosure */}
        <div className={`p-5 rounded-2xl border text-xs leading-relaxed space-y-2 ${
          isLight ? 'bg-stone-50 border-stone-200 text-stone-600' : 'bg-[#14100e] border-[#2c221e] text-orange-200/70'
        }`}>
          <div className="flex items-center gap-2 font-black text-stone-800 dark:text-orange-200">
            <Shield size={14} className="text-orange-500" />
            <span>Technical Scope & Device Limits Disclosure</span>
          </div>
          <p>
            Adaptive Study Mode operates within the <strong>Memory Shaastra web application interface</strong>. Standard web security sandboxes do not permit web apps to alter operating-system-level device settings or forcibly close external apps.
          </p>
          <p>
            Within Memory Shaastra, the feature applies CSS grayscale and modest dimming with a dismissible popup to give your eyes a gentle rest. It never locks your screen, never interrupts phone calls, and never discards your learning progress.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* KEYBOARD SHORTCUTS REFERENCE & SEARCHABLE TABLE                           */}
      {/* ========================================================================= */}
      <ShortcutsTable title="Facility Keyboard Shortcuts" />

      {/* Data Safety, Export & Import Backups */}
      <section className={`rounded-[3.5rem] p-8 sm:p-10 shadow-lg space-y-8 border transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <div>
          <h3 className={`text-lg font-black italic uppercase ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>
            Local Data Safety Control
          </h3>
          <p className={`text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-stone-500' : 'text-orange-200/50'}`}>
            Export, import, and restore memory modules completely offline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Complete System JSON Backup */}
          <div className={`border rounded-[2.5rem] p-6 flex flex-col justify-between space-y-6 ${
            isLight ? 'bg-amber-50/50 border-orange-200 shadow-sm' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Full System Backup (JSON)</span>
              <p className={`text-[10px] font-bold leading-relaxed uppercase ${
                isLight ? 'text-stone-600' : 'text-orange-200/40'
              }`}>
                Encodes all study decks, memory palaces, mnemonics, study documents, revisions, and status logs into a single compact file.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                <Download size={14} />
                <span>Export System Backup</span>
              </button>

              <label className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 border rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 ${
                isLight 
                  ? 'bg-white hover:bg-orange-50 border-orange-200 text-orange-700' 
                  : 'bg-[#2a221f] hover:bg-[#342a27] border-[#3f332c] hover:border-orange-500/20 text-orange-400 hover:text-white'
              }`}>
                <Upload size={14} />
                <span>Restore System Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  ref={jsonInputRef}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Flashcard Spreadsheet Exchange */}
          <div className={`border rounded-[2.5rem] p-6 flex flex-col justify-between space-y-6 ${
            isLight ? 'bg-amber-50/50 border-orange-200 shadow-sm' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Flashcard CSV Exchange</span>
              <p className={`text-[10px] font-bold leading-relaxed uppercase ${
                isLight ? 'text-stone-600' : 'text-orange-200/40'
              }`}>
                Import or export flashcard decks specifically as standard CSV tables, compatible with Excel, Google Sheets, or any external study setups.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                <FileSpreadsheet size={14} />
                <span>Export Flashcards to CSV</span>
              </button>

              <label className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 border rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 ${
                isLight 
                  ? 'bg-white hover:bg-amber-50 border-orange-200 text-stone-700' 
                  : 'bg-[#2a221f] hover:bg-[#342a27] border-[#3f332c] hover:border-orange-500/20 text-orange-300 hover:text-white'
              }`}>
                <Upload size={14} />
                <span>Import Flashcards from CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  ref={csvInputRef}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className={`border rounded-[3.5rem] p-10 relative overflow-hidden group ${
        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/10 border-rose-500/15'
      }`}>
        <div className="absolute inset-0 bg-rose-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <h3 className="text-[10px] font-black text-rose-500 mb-8 uppercase tracking-[0.4em] italic relative z-10">System Safety Overrides</h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className={`text-sm font-black uppercase italic tracking-tighter ${isLight ? 'text-rose-900' : 'text-orange-100'}`}>Purge Local Database Storage</p>
            <p className={`text-[10px] font-black uppercase tracking-[0.1em] mt-1 ${isLight ? 'text-rose-700/60' : 'text-orange-200/20'}`}>This will erase all levels, study logs, mnemonics, cards, and documents forever.</p>
          </div>
          <button 
            onClick={handleClearAllData}
            className="flex items-center justify-center space-x-3 bg-rose-500 hover:bg-rose-600 px-10 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-xl shadow-rose-500/30"
          >
            <Trash2 size={20} />
            <span>Format Device Storage</span>
          </button>
        </div>
      </section>
    </div>
  );
}
