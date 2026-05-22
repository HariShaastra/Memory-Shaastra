import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Target, Coffee, Sparkles, Plus, FileText, Video, Music, File, Trash2, Save, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { MaanasMascot } from './MaanasMascot';
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
  const { addXP, updateStreak, studyMaterials, setStudyMaterials, handleFileUpload } = useAppContext();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedMins, setEditedMins] = useState('25');
  
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialContent, setNewMaterialContent] = useState('');
  const [newMaterialFiles, setNewMaterialFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const xp = mode === 'study' ? minutes * 10 || 250 : 50;
    setEarnedXP(xp);
    addXP(xp);
    updateStreak();
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

  if (sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10 flex flex-col items-center">
          <MaanasMascot size={220} expression="proud" />
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-orange-100 drop-shadow-sm">Session Done!</h2>
            <p className="text-orange-200/40 mt-4 font-bold uppercase tracking-[0.2em] text-[10px] max-w-sm italic">Great work! You studied for {earnedXP / 10} minutes.</p>
          </div>
          <div className="bg-[#1a1614] px-10 py-5 rounded-[2.5rem] border border-[#3f332c] shadow-inner">
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-200/20 block mb-2 italic">Points Earned</span>
            <div className="flex items-center gap-3 text-orange-500 font-black text-3xl italic">
              <Sparkles size={28} />
              <span>+{earnedXP} XP</span>
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
    <div className="flex flex-col items-center max-w-5xl mx-auto px-6 py-12 gap-8">
      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
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
      <div className="w-full bg-[#2a221f] rounded-[5rem] p-16 shadow-2xl border border-[#3f332c] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Clock size={150} className="text-orange-500" />
        </div>

        <div className="flex justify-center gap-6 mb-16 p-2.5 bg-[#1a1614] rounded-[3rem] w-fit mx-auto border border-[#3f332c] relative z-10 shadow-inner">
          <button 
            onClick={() => { setMode('study'); if (!isActive) { setMinutes(25); setSeconds(0); } }}
            className={`px-10 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${mode === 'study' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-orange-200/20 hover:text-orange-500'}`}
          >
            <Target size={18} />
            <span>Study</span>
          </button>
          <button 
            onClick={() => { setMode('break'); if (!isActive) { setMinutes(5); setSeconds(0); } }}
            className={`px-10 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${mode === 'break' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/20 shadow-xl' : 'text-orange-200/20 hover:text-amber-500'}`}
          >
            <Coffee size={18} />
            <span>Break</span>
          </button>
        </div>

        <div className="relative mb-16 flex flex-col items-center z-10">
          <MaanasMascot size={180} expression={isActive ? 'focused' : 'encouraging'} />
          
          {isEditingTime ? (
            <div className="mt-10 mb-6 flex items-center justify-center gap-4">
              <input 
                type="number"
                value={editedMins}
                onChange={(e) => setEditedMins(e.target.value)}
                min="5"
                autoFocus
                className="w-48 bg-[#1a1614] border-2 border-orange-500/30 rounded-[3rem] text-center text-7xl font-black text-orange-100 py-4 outline-none focus:border-orange-500"
              />
              <button 
                onClick={updateTime}
                className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-600/20"
              >
                <Save size={32} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { if (!isActive) { setIsEditingTime(true); setEditedMins(minutes.toString()); } }}
              className="text-[130px] font-black tracking-tighter leading-none text-orange-100 mt-10 mb-6 italic drop-shadow-2xl cursor-pointer hover:text-orange-500 transition-colors"
            >
              {String(minutes).padStart(2, '0')}<span className="text-orange-600">:</span>{String(seconds).padStart(2, '0')}
            </button>
          )}

          {!isActive && !isEditingTime && (
            <p className="text-orange-200/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4 italic">Click numbers to change time (min 5m)</p>
          )}

          <AnimatePresence mode="wait">
            {isActive && (
              <motion.p 
                key={quoteIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-orange-500/60 font-black italic uppercase tracking-widest text-[10px] tabular-nums bg-orange-950/20 px-6 py-2 rounded-full border border-orange-500/10"
              >
                "{STUDY_QUOTES[quoteIdx]}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center gap-12 relative z-10">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-[2rem] bg-[#1a1614] border border-[#3f332c] flex items-center justify-center text-orange-200/20 hover:text-orange-500 hover:border-orange-500/30 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={28} />
          </button>
          <button 
            onClick={toggleTimer}
            className={`w-32 h-32 rounded-[4rem] flex items-center justify-center transition-all transform active:scale-90 shadow-2xl relative group ${
              isActive ? 'bg-[#1a1614] text-orange-500 border-2 border-orange-500/20' : 'bg-orange-600 text-white shadow-orange-600/30'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full rounded-[4rem]" />
            {isActive ? <Pause size={56} fill="currentColor" className="relative z-10" /> : <Play size={56} fill="currentColor" className="ml-2 relative z-10" />}
          </button>
          <div className="w-16 h-16" />
        </div>
      </div>

      {/* Study Materials Section */}
      <div className="w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-orange-100 italic uppercase tracking-tighter">{t.studyMaterials}</h3>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-widest mt-1">Files and notes for your study session</p>
          </div>
          <button 
            onClick={() => setIsAddingMaterial(true)}
            className="flex items-center gap-2 bg-white/5 text-orange-100 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all border border-[#3f332c]"
          >
            <Plus size={18} /> {t.add}
          </button>
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
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic"
                    placeholder="e.g. Physics Chapter 1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 font-black ml-4">{t.notes}</label>
                  <textarea 
                    value={newMaterialContent}
                    onChange={e => setNewMaterialContent(e.target.value)}
                    rows={6}
                    className="w-full bg-[#1a1614] border border-[#3f332c] rounded-2xl py-4 px-6 font-bold text-orange-100 outline-none focus:ring-2 focus:ring-orange-500 italic resize-none"
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
                onClick={addMaterial}
                className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
              >
                {t.save} Note
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyMaterials.map(material => (
            <motion.div 
              key={material.id}
              layout
              className="bg-[#2a221f] rounded-[3rem] p-8 border border-[#3f332c] shadow-lg group hover:bg-[#2e2623] transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-black text-orange-100 italic uppercase tracking-tight">{material.title}</h4>
                  <p className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest">{new Date(material.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteMaterial(material.id)} className="p-2 text-orange-200/20 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {material.content && (
                  <p className="text-sm text-orange-100/60 leading-relaxed italic line-clamp-3">
                    {material.content}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {material.attachments.map(file => {
                    const id = file.id;
                    const Icon = file.type === 'video' ? Video : file.type === 'audio' ? Music : FileText;
                    return (
                      <a 
                        key={id}
                        href={file.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1614] rounded-xl border border-[#3f332c] hover:border-orange-500/30 transition-all group/file"
                      >
                        <Icon size={14} className="text-orange-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-200/40 transition-colors group-hover/file:text-orange-100">{file.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
          {studyMaterials.length === 0 && !isAddingMaterial && (
            <div className="md:col-span-2 text-center py-20 bg-[#2a221f]/30 rounded-[3rem] border-2 border-dashed border-[#3f332c]">
              <p className="text-orange-200/20 font-black uppercase tracking-widest text-xs">No materials here yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
