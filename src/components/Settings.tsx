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
  AlertTriangle
} from 'lucide-react';
import { t } from '../utils/translations';
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
    memoryLinks, setMemoryLinks
  } = useApp();

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
    <div className="max-w-4xl mx-auto p-12 space-y-12">
      <header className="flex justify-between items-end border-b border-[#3f332c]/20 pb-8">
        <div>
          <h2 className="text-5xl font-black text-orange-100 italic uppercase tracking-tighter drop-shadow-sm">{t.settings}</h2>
          <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Customize your active recall system</p>
        </div>
        {user && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border border-amber-500/20 shadow-lg active:scale-95"
          >
            <Edit2 size={16} /> {t.edit}
          </button>
        )}
      </header>

      {/* Floating Status Notification bar */}
      {statusMessage && (
        <div className={`p-5 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-all ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-[#2a221f] border border-[#3f332c] rounded-[3.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <UserIcon size={120} className="text-orange-500" />
        </div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-[2rem] bg-[#1a1614] border border-[#3f332c] text-orange-500 flex items-center justify-center shadow-inner">
              <UserIcon size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-orange-100 italic tracking-tight">{user?.name || 'Learner'}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200/20">{user?.email || 'Offline Local Account'}</p>
            </div>
          </div>
          {!user && (
            <button 
              onClick={() => setView('auth')}
              className="bg-orange-600 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
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
      <section className="bg-[#2a221f] border border-[#3f332c] rounded-[3.5rem] p-10 shadow-lg space-y-6">
        <div>
          <h3 className="text-lg font-black text-orange-100 italic uppercase">Theme Customization</h3>
          <p className="text-orange-200/30 text-[9px] uppercase tracking-wider font-bold">Select visual aesthetic parameters</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1a1614] p-6 rounded-[2.5rem] border border-[#3f332c]/60">
          <span className="text-xs font-black text-orange-200/60 uppercase tracking-widest flex-1">Workspace Brightness</span>
          
          <div className="flex bg-[#2a221f] p-1.5 rounded-2xl border border-[#3f332c] gap-1">
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                theme === 'dark' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-orange-200/40 hover:text-orange-300'
              }`}
            >
              <Moon size={14} />
              <span>Cosmic Dark</span>
            </button>
            
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                theme === 'light' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-orange-200/40 hover:text-orange-300'
              }`}
            >
              <Sun size={14} />
              <span>Warm Light</span>
            </button>
          </div>
        </div>
      </section>

      {/* Data Safety, Export & Import Backups */}
      <section className="bg-[#2a221f] border border-[#3f332c] rounded-[3.5rem] p-10 shadow-lg space-y-8">
        <div>
          <h3 className="text-lg font-black text-orange-100 italic uppercase">Local Data Safety Control</h3>
          <p className="text-orange-200/30 text-[9px] uppercase tracking-wider font-bold">Export, import, and restore memory modules completely offline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Complete System JSON Backup */}
          <div className="bg-[#1a1614] border border-[#3f332c] rounded-[2.5rem] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">Full System Backup (JSON)</span>
              <p className="text-[10px] text-orange-200/40 font-bold leading-relaxed uppercase">
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

              <label className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2a221f] hover:bg-[#342a27] border border-[#3f332c] hover:border-orange-500/20 text-orange-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95">
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
          <div className="bg-[#1a1614] border border-[#3f332c] rounded-[2.5rem] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Flashcard CSV Exchange</span>
              <p className="text-[10px] text-orange-200/40 font-bold leading-relaxed uppercase">
                Import or export flashcard decks specifically as standard CSV tables, compatible with Excel, Google Sheets, or any external study setups.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                <FileSpreadsheet size={14} />
                <span>Export Flashcards to CSV</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2a221f] hover:bg-[#342a27] border border-[#3f332c] hover:border-orange-500/20 text-orange-300 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95">
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
      <section className="bg-rose-950/10 border border-rose-500/15 rounded-[3.5rem] p-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-rose-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <h3 className="text-[10px] font-black text-rose-500 mb-8 uppercase tracking-[0.4em] italic relative z-10">System Safety Overrides</h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <p className="text-sm font-black text-orange-100 uppercase italic tracking-tighter">Purge Local Database Storage</p>
            <p className="text-[10px] text-orange-200/20 font-black uppercase tracking-[0.1em] mt-1">This will erase all levels, study logs, mnemonics, cards, and documents forever.</p>
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
