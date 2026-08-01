import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Target, Coffee, Sparkles, Plus, FileText, Video, Music, File, Trash2, Save, X, HelpCircle, Search, LayoutGrid, LayoutList, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { StudyMaterial } from '../types';

const STUDY_QUOTES = [
  "Study hard! You can do it.",
  "Your brain is getting stronger.",
  "One step at a time.",
  "Focus on your work.",
  "Maanas is helping you!",
  "Great job! Keep learning."
];

export default function MonkModeTimer() {
  const { updateStreak, studyMaterials, setStudyMaterials, handleFileUpload } = useAppContext();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedMins, setEditedMins] = useState('25');
  
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialContent, setNewMaterialContent] = useState('');
  const [newMaterialFiles, setNewMaterialFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search and view mode for Study Materials in Study Now section
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'line'>('grid');

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  useEffect(() => {
    if (isActive) {
      const qInterval = setInterval(() => {
        setQuoteIdx(prev => (prev + 1) % STUDY_QUOTES.length);
      }, 10000);
      return () => clearInterval(qInterval);
    }
  }, [isActive]);

  const handleComplete = () => {
    setIsActive(false);
    setSessionCompleted(true);
    if (updateStreak) updateStreak();
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'study' ? 25 : 5);
    setSeconds(0);
    setSessionCompleted(false);
  };

  const updateTime = () => {
    const mins = parseInt(editedMins);
    if (isNaN(mins) || mins < 5) {
      setEditedMins('5');
      setMinutes(5);
    } else {
      setMinutes(mins);
    }
    setSeconds(0);
    setIsEditingTime(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const uploadedFile = await handleFileUpload(files[i]);
      setNewMaterialFiles(prev => [...prev, uploadedFile]);
    }
  };

  const addMaterial = () => {
    if (!newMaterialTitle.trim()) return;
    const material: StudyMaterial = {
      id: Date.now().toString(),
      title: newMaterialTitle,
      content: newMaterialContent,
      attachments: newMaterialFiles,
      createdAt: new Date().toISOString()
    };
    setStudyMaterials(prev => [material, ...prev]);
    setIsAddingMaterial(false);
    setNewMaterialTitle('');
    setNewMaterialContent('');
    setNewMaterialFiles([]);
  };

  const deleteMaterial = (id: string) => {
    setStudyMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleOpenDocumentInBrowser = (att?: { url?: string; name?: string; type?: string }) => {
    if (!att || !att.url) return;

    try {
      if (att.url.startsWith('data:')) {
        const parts = att.url.split(',');
        const header = parts[0];
        const base64Data = parts[1] ? parts[1].trim() : '';

        let mime = 'application/pdf';
        const mimeMatch = header.match(/:(.*?);/);
        if (mimeMatch && mimeMatch[1] && mimeMatch[1] !== 'application/octet-stream') {
          mime = mimeMatch[1];
        } else if (att.name?.toLowerCase().endsWith('.png')) {
          mime = 'image/png';
        } else if (att.name?.toLowerCase().endsWith('.jpg') || att.name?.toLowerCase().endsWith('.jpeg')) {
          mime = 'image/jpeg';
        } else if (att.name?.toLowerCase().endsWith('.txt')) {
          mime = 'text/plain';
        }

        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        const win = window.open(blobUrl, '_blank');
        if (!win) {
          window.location.href = blobUrl;
        }
      } else {
        window.open(att.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening document in browser:', err);
      window.open(att.url, '_blank');
    }
  };

  // Filter study materials by search query
  const filteredMaterials = studyMaterials.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.content && m.content.toLowerCase().includes(q)) ||
      m.attachments.some(att => att.name.toLowerCase().includes(q))
    );
  });

  if (sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10 flex flex-col items-center">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-orange-100 drop-shadow-sm">Session Done!</h2>
            <p className="text-orange-200/60 mt-4 font-bold uppercase tracking-[0.2em] text-xs max-w-sm italic">Great focus! Memory retention enhanced.</p>
          </div>
          <div className="bg-[#1a1614] px-10 py-5 rounded-[2.5rem] border border-[#3f332c] shadow-inner">
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-200/50 block mb-2 italic">Focus Completed</span>
            <div className="flex items-center gap-3 text-orange-500 font-black text-2xl italic">
              <Clock size={28} />
              <span>{minutes} Minute Session</span>
            </div>
          </div>
          <button 
            onClick={resetTimer}
            className="w-full max-w-xs bg-orange-600 text-white px-12 py-5 rounded-[2.5rem] font-black uppercase italic tracking-widest text-[11px] shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition-all active:scale-95"
          >
            Start Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12 gap-6 sm:gap-8 w-full">
      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-orange-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Study Timer</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A distraction-free study clock that runs silent focus intervals to help you work deeply without fatigue and guides your mental rest breaks.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Pick "Study" or "Break" mode.</span>
          <span className="block mt-1">2. Tap the duration numbers to customize your target timer value.</span>
          <span className="block mt-1">3. Tap the Play triangular button to begin studying silently until the final bell rings.</span>
        </div>
      </div>

      {/* Timer Section */}
      <div className="w-full bg-[#2a221f] rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-10 md:p-16 shadow-2xl border border-[#3f332c] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Clock size={150} className="text-orange-500" />
        </div>

        <div className="flex justify-center gap-2 sm:gap-6 mb-8 sm:mb-16 p-2 bg-[#1a1614] rounded-[2.5rem] w-full max-w-xs sm:max-w-md mx-auto border border-[#3f332c] relative z-10 shadow-inner">
          <button 
            onClick={() => { setMode('study'); if (!isActive) { setMinutes(25); setSeconds(0); } }}
            className={`flex-1 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-[2rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 sm:gap-3 ${mode === 'study' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-orange-200/40 hover:text-orange-500'}`}
          >
            <Target size={16} />
            <span>Study</span>
          </button>
          <button 
            onClick={() => { setMode('break'); if (!isActive) { setMinutes(5); setSeconds(0); } }}
            className={`flex-1 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-[2rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 sm:gap-3 ${mode === 'break' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/20 shadow-xl' : 'text-orange-200/40 hover:text-amber-500'}`}
          >
            <Coffee size={16} />
            <span>Break</span>
          </button>
        </div>

        <div className="relative mb-8 sm:mb-16 flex flex-col items-center z-10 w-full overflow-hidden">
          {isEditingTime ? (
            <div className="mt-6 sm:mt-10 mb-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <input 
                type="number"
                value={editedMins}
                onChange={(e) => setEditedMins(e.target.value)}
                min="5"
                autoFocus
                className="w-32 sm:w-48 bg-[#1a1614] border-2 border-orange-500/30 rounded-[2.5rem] text-center text-4xl sm:text-7xl font-black text-orange-100 py-3 outline-none focus:border-orange-500"
              />
              <button 
                onClick={updateTime}
                className="w-14 h-14 sm:w-20 sm:h-20 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-600/20 active:scale-95 transition-transform"
              >
                <Save size={24} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { if (!isActive) { setIsEditingTime(true); setEditedMins(minutes.toString()); } }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-black tracking-tighter leading-none text-orange-100 my-4 sm:my-8 italic drop-shadow-2xl cursor-pointer hover:text-orange-500 transition-colors max-w-full truncate"
            >
              {String(minutes).padStart(2, '0')}<span className="text-orange-600">:</span>{String(seconds).padStart(2, '0')}
            </button>
          )}

          {!isActive && !isEditingTime && (
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.15em] mb-4 italic">Click numbers to change time (min 5m)</p>
          )}

          <AnimatePresence mode="wait">
            {isActive && (
              <motion.p 
                key={quoteIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-orange-500/90 font-black italic uppercase tracking-widest text-[10px] sm:text-xs tabular-nums bg-orange-950/30 px-4 sm:px-6 py-2 rounded-full border border-orange-500/20 max-w-full truncate"
              >
                "{STUDY_QUOTES[quoteIdx]}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center gap-6 sm:gap-12 relative z-10">
          <button 
            onClick={resetTimer}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[2rem] bg-[#1a1614] border border-[#3f332c] flex items-center justify-center text-orange-200/40 hover:text-orange-500 hover:border-orange-500/30 transition-all shadow-sm active:scale-95"
            title="Reset Timer"
          >
            <RotateCcw size={22} className="sm:w-7 sm:h-7" />
          </button>
          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] sm:rounded-[4rem] flex items-center justify-center transition-all transform active:scale-90 shadow-2xl relative group ${
              isActive ? 'bg-[#1a1614] text-orange-500 border-2 border-orange-500/20' : 'bg-orange-600 text-white shadow-orange-600/30'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] sm:rounded-[4rem]" />
            {isActive ? <Pause size={42} fill="currentColor" className="relative z-10 sm:w-14 sm:h-14" /> : <Play size={42} fill="currentColor" className="ml-1 relative z-10 sm:w-14 sm:h-14" />}
          </button>
          <div className="w-12 h-12 sm:w-16 sm:h-16" />
        </div>
      </div>

      {/* Study Materials Section in Study Now */}
      <div className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-orange-100 italic uppercase tracking-tighter">{t.studyMaterials}</h3>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-widest mt-1">Files and notes for your active study session</p>
          </div>
          <button 
            onClick={() => setIsAddingMaterial(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 self-start md:self-auto"
          >
            <Plus size={18} /> {t.add} Material
          </button>
        </div>

        {/* Search Bar & Grid/Line View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#2a221f] p-4 rounded-3xl border border-[#3f332c]">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400/60" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search study materials & attached files..."
              className="w-full bg-[#1a1614] border border-[#3f332c] text-xs py-2.5 pl-12 pr-10 rounded-2xl text-[#fef3c7] focus:outline-none focus:border-orange-500 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-200/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

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

        <AnimatePresence>
          {isAddingMaterial && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#2a221f] rounded-[3rem] p-8 border border-[#3f332c] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black text-orange-100 italic uppercase tracking-tight">New Note</h4>
                <button onClick={() => setIsAddingMaterial(false)} className="text-orange-200/40 hover:text-white"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-4">Title</label>
                  <input 
                    type="text"
                    value={newMaterialTitle}
                    onChange={e => setNewMaterialTitle(e.target.value)}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic text-xs"
                    placeholder="e.g. Physics Chapter 1 Notes"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-4">{t.notes}</label>
                  <textarea 
                    value={newMaterialContent}
                    onChange={e => setNewMaterialContent(e.target.value)}
                    rows={6}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic resize-none text-xs"
                    placeholder={t.enterLargeText}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-4">{t.attachments}</label>
                <div className="flex flex-wrap gap-4">
                  {newMaterialFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#1a1614] px-4 py-2 rounded-xl border border-[#3f332c]">
                      <File size={16} className="text-orange-500" />
                      <span className="text-[10px] font-black uppercase text-orange-100 truncate max-w-[150px]">{file.name}</span>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-xl bg-[#1a1614] border border-dashed border-orange-500/20 flex items-center justify-center text-orange-500 hover:bg-orange-500/10 transition-colors"
                  >
                    <Plus size={24} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              <button 
                type="button"
                onClick={addMaterial}
                className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
              >
                {t.save} Note
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MATERIALS LIST IN GRID OR LINE VIEW */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMaterials.map(material => (
              <motion.div 
                key={material.id}
                layout
                className="bg-[#2a221f] rounded-[3rem] p-8 border border-[#3f332c] shadow-lg group hover:bg-[#2e2623] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-black text-orange-100 italic uppercase tracking-tight">{material.title}</h4>
                      <p className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest">{new Date(material.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteMaterial(material.id)} className="p-2 text-orange-200/20 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {material.content && (
                    <p className="text-sm text-orange-100/60 leading-relaxed italic line-clamp-3 mb-6">
                      {material.content}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#3f332c]/50">
                  {material.attachments.map(file => {
                    const id = file.id;
                    const Icon = file.type === 'video' ? Video : file.type === 'audio' ? Music : FileText;
                    return (
                      <button 
                        key={id}
                        type="button"
                        onClick={() => handleOpenDocumentInBrowser(file)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1614] rounded-xl border border-[#3f332c] hover:border-orange-500/50 transition-all group/file cursor-pointer active:scale-95"
                        title="Open document in browser without downloading"
                      >
                        <Icon size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-200/60 group-hover/file:text-orange-100 truncate max-w-[160px]">{file.name}</span>
                        <ExternalLink size={12} className="text-orange-400 shrink-0 ml-1" />
                      </button>
                    );
                  })}
                  {material.attachments.length === 0 && (
                    <span className="text-[10px] text-orange-200/30 italic font-bold">No attached files</span>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredMaterials.length === 0 && !isAddingMaterial && (
              <div className="md:col-span-2 text-center py-16 bg-[#2a221f]/30 rounded-[3rem] border-2 border-dashed border-[#3f332c]">
                <p className="text-orange-200/30 font-black uppercase tracking-widest text-xs">No materials match your search.</p>
              </div>
            )}
          </div>
        ) : (
          /* LINE VIEW */
          <div className="space-y-3">
            {filteredMaterials.map(material => (
              <motion.div 
                key={material.id}
                layout
                className="bg-[#2a221f] rounded-2xl p-5 border border-[#3f332c] shadow-lg group hover:bg-[#2e2623] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-black text-orange-100 italic uppercase tracking-tight truncate">{material.title}</h4>
                    <span className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest shrink-0">({new Date(material.createdAt).toLocaleDateString()})</span>
                  </div>
                  {material.content && (
                    <p className="text-xs text-orange-100/60 leading-relaxed italic truncate">
                      {material.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {material.attachments.map(file => (
                      <button 
                        key={file.id}
                        type="button"
                        onClick={() => handleOpenDocumentInBrowser(file)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1614] rounded-xl border border-[#3f332c] hover:border-orange-500/50 text-xs font-bold text-orange-200 hover:text-white transition-all cursor-pointer active:scale-95"
                        title="Open document in browser without downloading"
                      >
                        <FileText size={13} className="text-orange-500" />
                        <span className="truncate max-w-[120px] text-[10px]">{file.name}</span>
                        <ExternalLink size={12} className="text-orange-400 shrink-0" />
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => deleteMaterial(material.id)} 
                    className="p-2 text-orange-200/20 hover:text-rose-500 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
            {filteredMaterials.length === 0 && !isAddingMaterial && (
              <div className="text-center py-12 bg-[#2a221f]/30 rounded-2xl border-2 border-dashed border-[#3f332c]">
                <p className="text-orange-200/30 font-black uppercase tracking-widest text-xs">No materials match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

