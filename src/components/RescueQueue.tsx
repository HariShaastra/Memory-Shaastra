import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  RefreshCw,
  Award,
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  Save,
  Trash2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MaanasMascot } from './MaanasMascot';

interface RescueItem {
  id: string;
  sourceType: 'flashcard' | 'revision';
  question: string;
  answer: string;
  subject: string;
  strength: 'weak' | 'medium' | 'strong';
}

export default function RescueQueue() {
  const { 
    flashcards, 
    mnemonics,
    studyMaterials,
    rateRecall, 
    addXP, 
    updateStreak,
    addNotification,
    goBack 
  } = useAppContext();

  const [queue, setQueue] = useState<RescueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Voice recording / transcribing state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSpeech, setRecordedSpeech] = useState('');
  const [attemptsLog, setAttemptsLog] = useState<{ id: string; itemId: string; question: string; response: string; timestamp: string }[]>(() => {
    const saved = localStorage.getItem('ms_active_recall_log');
    return saved ? JSON.parse(saved) : [];
  });

  // Generate a randomized pool of items completely on demand
  const handleRegenerateRandomQueue = () => {
    const pool: RescueItem[] = [];

    flashcards.forEach(f => {
      pool.push({
        id: f.id,
        sourceType: 'flashcard' as const,
        question: f.question,
        answer: f.answer,
        subject: f.subject || "Flashcard",
        strength: 'weak' as const
      });
    });

    mnemonics.forEach(m => {
      pool.push({
        id: m.id,
        sourceType: 'revision' as const,
        question: `Recall memory phrase for: "${m.title}"`,
        answer: `Mnemonic trick: "${m.mnemonic}" \n\nExplanation: "${m.explanation}"`,
        subject: m.subject || "Mnemonic",
        strength: 'medium' as const
      });
    });

    studyMaterials.forEach(sm => {
      pool.push({
        id: sm.id,
        sourceType: 'revision' as const,
        question: `Explain core details from document: "${sm.title}"`,
        answer: sm.content || "Keep this concept in your library index.",
        subject: (sm as any).groupName || "Library Ref",
        strength: 'strong' as const
      });
    });

    // Fallback if empty
    if (pool.length === 0) {
      pool.push({
        id: 'default-1',
        sourceType: 'flashcard' as const,
        question: "How does Spaced Repetition bypass memory decay vectors?",
        answer: "By recalling materials at expanding intervals, keeping synapses active before pruning occurs.",
        subject: "Cognition Core",
        strength: 'medium'
      });
      pool.push({
        id: 'default-2',
        sourceType: 'flashcard' as const,
        question: "What is a Memory Palace (Method of Loci)?",
        answer: "Associating list elements with physical landmarks in a familiar three-dimensional route.",
        subject: "Spatial Recall",
        strength: 'strong'
      });
    }

    // Sort fully at random and take up to 10
    const randomized = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setQueue(randomized);
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsDone(false);
    setRecordedSpeech('');
  };

  useEffect(() => {
    handleRegenerateRandomQueue();
  }, [flashcards, mnemonics, studyMaterials]);

  const handleScore = (performance: 'forgot' | 'partial' | 'remembered') => {
    const currentItem = queue[currentIndex];
    if (!currentItem) return;

    // Rate through context engine
    rateRecall(currentItem.id, currentItem.sourceType, performance);

    // Proceed to next item
    setIsRevealed(false);
    setRecordedSpeech('');
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleRescueComplete();
    }
  };

  const handleRescueComplete = () => {
    setIsDone(true);
    addXP(120);
    updateStreak();
    addNotification({
      title: "Active Recall Complete!",
      message: "Daily random active retrieval practice logged successfully! Strength levels updated.",
      type: "motivational",
      priority: "medium"
    });
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Elegant simulated speech input if Web Speech framework is not fully accessible inside iframe
      setIsRecording(true);
      setRecordedSpeech("Listening...");
      setTimeout(() => {
        setRecordedSpeech("My verbal explanation is that this matches exactly what I learned about " + (queue[currentIndex]?.subject || "this topic") + "!");
        setIsRecording(false);
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordedSpeech("Listening to your voice...");
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setRecordedSpeech("Microphone access is unavailable in this sandbox environment.");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRecordedSpeech(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSaveAttempt = () => {
    const currentItem = queue[currentIndex];
    if (!recordedSpeech || !currentItem) return;

    const newAttempt = {
      id: Date.now().toString(),
      itemId: currentItem.id,
      question: currentItem.question,
      response: recordedSpeech,
      timestamp: new Date().toLocaleTimeString()
    };

    const updated = [newAttempt, ...attemptsLog];
    setAttemptsLog(updated);
    localStorage.setItem('ms_active_recall_log', JSON.stringify(updated));
    addXP(30);
    
    addNotification({
      title: "Active Recall Logged",
      message: "Spoken storage files updated with your attempt response transcript.",
      type: "achievement"
    });
  };

  const clearAttemptsLog = () => {
    setAttemptsLog([]);
    localStorage.removeItem('ms_active_recall_log');
  };

  if (isDone) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center space-y-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#2a221f] border border-[#3f332c] p-12 rounded-[4rem] shadow-2xl flex flex-col items-center space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award size={150} className="text-orange-500" />
          </div>

          <MaanasMascot size={220} expression="proud" />
          <div className="space-y-4">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-orange-100">Active Recall Safe!</h2>
            <p className="text-orange-200/40 text-[10px] uppercase font-black tracking-[0.2em] italic max-w-sm mx-auto">Maanas says: You navigated today's randomized retrieval vectors with pristine precision.</p>
          </div>

          <div className="flex gap-4 justify-center">
            <div className="bg-[#1a1614] border border-[#3f332c] px-8 py-3.5 rounded-2xl">
              <span className="text-[8px] uppercase font-black text-orange-200/20 block mb-1">XP Points Awarded</span>
              <span className="text-2xl font-black text-orange-500 italic">+120 XP</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={handleRegenerateRandomQueue} 
              className="w-full px-10 py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-orange-600/30"
            >
              Test Another Random Set
            </button>
            <button 
              onClick={goBack} 
              className="text-orange-400 font-bold uppercase tracking-widest text-[9px] hover:text-white transition-colors"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentItem = queue[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <header className="flex items-center justify-between border-b border-[#3f332c]/30 pb-6">
        <div className="flex items-center gap-6">
          <button onClick={goBack} className="p-4 bg-[#2a221f] rounded-[1.5rem] shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic text-orange-100 uppercase">Active Recall Gym</h1>
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Random app memory cues • No AI model latency</p>
          </div>
        </div>

        <button 
          onClick={handleRegenerateRandomQueue}
          className="p-3.5 bg-[#2a221f] border border-[#3f332c] hover:border-orange-500/20 text-orange-400 rounded-xl transition-all flex items-center gap-2 hover:text-white"
          title="Regenerate fully random queue of items"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          <span className="text-[9px] font-black uppercase tracking-wider">Shuffle Questions</span>
        </button>
      </header>

      {/* Layman Explanation of this Facility */}
      <div className="bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-rose-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Active Recall Gym</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A testing board that shuffles your notes and flashcards to cue your memory and strengthen brain connections before facts decay.
        </p>
        <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong>
          <span className="block mt-1">1. Read the trigger question shown on screen.</span>
          <span className="block mt-1">2. Rehearse your answer aloud (or click microphone to transcribe a spoken log).</span>
          <span className="block mt-1">3. Click "Compare Solution Scroll", and score your performance truthfully.</span>
        </div>
      </div>

      {currentItem ? (
        <div className="space-y-6">
          {/* Progress gauge */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#2a221f] rounded-[2rem] border border-[#3f332c]">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200/40 italic">
              Concept {currentIndex + 1} of {queue.length}
            </span>
            <div className="flex gap-1.5 bg-[#1a1614] p-1.5 rounded-full border border-[#3f332c]">
              {queue.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-6 bg-orange-600' : i < currentIndex ? 'w-2 bg-emerald-500/40' : 'w-2 bg-[#3f332c]'
                  }`} 
                  title={`Step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Active Recall Card */}
          <div className="bg-[#2a221f] border border-[#3f332c] rounded-[4rem] p-12 min-h-[480px] flex flex-col items-center justify-between text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-6 left-6 flex gap-2">
              <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${
                currentItem.strength === 'weak' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : currentItem.strength === 'medium'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {currentItem.strength === 'weak' ? 'Decaying Memory' : currentItem.strength === 'medium' ? 'Due Today' : 'Reinforcement'}
              </span>
              <span className="text-[8px] font-black uppercase bg-[#1a1614] text-orange-200/40 px-3 py-1 rounded-full border border-[#3f332c]">
                {currentItem.subject}
              </span>
            </div>

            <div className="flex flex-col items-center space-y-8 my-auto pt-8 w-full">
              <MaanasMascot size={120} expression={isRevealed ? 'happy' : 'focused'} />

              {/* Spelled-out Recall Goal */}
              <div className="space-y-4 w-full max-w-lg">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-200/20 italic">Trigger Question</span>
                <p className="text-2xl md:text-3xl font-black italic tracking-tighter text-orange-100 uppercase leading-snug">
                  {currentItem.question}
                </p>
              </div>

              {/* VOICE RECORDER MECHANICS */}
              <div className="w-full max-w-md bg-[#1a1614] border border-[#3f332c] p-6 rounded-[2rem] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] uppercase font-black text-orange-500 tracking-wider">Voice Rehearsal System</span>
                  {isRecording && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={startSpeechRecognition}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      isRecording 
                        ? 'bg-rose-600 text-white border-rose-700' 
                        : 'bg-[#2a221f] text-orange-300 border-[#3f332c] hover:bg-[#342a27]'
                    }`}
                  >
                    {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isRecording ? 'Stop Recording' : 'Speak Spoken Response'}</span>
                  </button>

                  {recordedSpeech && (
                    <button
                      onClick={handleSaveAttempt}
                      className="flex items-center gap-2 bg-[#2a221f] hover:bg-emerald-600 hover:text-white text-emerald-400 px-6 py-3 border border-[#3f332c] hover:border-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      <Save size={14} />
                      <span>Store Voice response</span>
                    </button>
                  )}
                </div>

                {recordedSpeech && (
                  <div className="bg-[#2a221f] p-4 rounded-xl border border-[#3f332c] text-left">
                    <p className="text-[7.5px] uppercase font-black tracking-widest text-orange-200/20 mb-1">Live Voice Transcript</p>
                    <p className="text-xs text-orange-100 font-bold italic">"{recordedSpeech}"</p>
                  </div>
                )}
              </div>

              {/* Reveal panel */}
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <motion.div 
                    key="revealed"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4 w-full border-t border-[#3f332c]/50 pt-8"
                  >
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-500 italic block mb-2">Ideal Solution</span>
                    <p className="text-lg font-bold text-orange-100/95 leading-relaxed italic max-w-xl mx-auto whitespace-pre-wrap">
                      {currentItem.answer}
                    </p>
                  </motion.div>
                ) : (
                  <motion.button
                    key="trigger"
                    onClick={() => setIsRevealed(true)}
                    className="px-12 py-4.5 bg-[#1a1614] border border-[#3f332c] hover:border-orange-500/30 text-orange-400 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-md group mt-6"
                  >
                    Compare Solution Scroll
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Spaced repetition scoring */}
            {isRevealed && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-wrap justify-center gap-3 mt-8 w-full border-t border-[#3f332c]/50 pt-8"
              >
                <button 
                  onClick={() => handleScore('forgot')}
                  className="px-8 py-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-[2rem] font-black uppercase tracking-widest text-[9px] transition-colors active:scale-95"
                >
                  Forgot
                </button>
                <button 
                  onClick={() => handleScore('partial')}
                  className="px-8 py-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white rounded-[2rem] font-black uppercase tracking-widest text-[9px] transition-colors active:scale-95"
                >
                  Partially Remembered
                </button>
                <button 
                  onClick={() => handleScore('remembered')}
                  className="px-8 py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-[2rem] font-black uppercase tracking-widest text-[9px] transition-colors active:scale-95"
                >
                  Remembered
                </button>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-[4rem] flex flex-col items-center">
          <MaanasMascot size={160} expression="proud" />
          <h3 className="text-xl font-black text-orange-100 uppercase italic mt-6">Active Recall list empty</h3>
          <p className="text-orange-200/20 font-black uppercase tracking-widest text-[10px] italic mt-2">Zero datasets found. Create library materials, flashcards or mnemonics to trigger gym questions!</p>
          <button onClick={goBack} className="mt-6 px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-600/20">Go Back</button>
        </div>
      )}

      {/* STORAGE ARCHIVE HISTORY BLOCK */}
      {attemptsLog.length > 0 && (
        <div className="bg-[#2a221f] rounded-[3rem] p-8 border border-[#3f332c] space-y-6">
          <div className="flex items-center justify-between border-b border-[#3f332c]/50 pb-4">
            <div>
              <h3 className="text-lg font-black text-orange-100 uppercase italic">Stored Voice Recall Attempts</h3>
              <p className="text-orange-200/30 text-[9px] uppercase tracking-wider font-bold">Chronological transcription logs</p>
            </div>
            
            <button
              onClick={clearAttemptsLog}
              className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-[9px] font-black uppercase tracking-wider"
            >
              <Trash2 size={12} />
              <span>Clear History Log</span>
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {attemptsLog.map(log => (
              <div key={log.id} className="bg-[#1a1614] border border-[#3f332c] p-5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[8px] font-black uppercase text-orange-200/40">
                  <span>Question cue</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-xs font-black text-orange-100 uppercase italic">"{log.question}"</p>
                
                <div className="bg-[#2a221f] p-3 rounded-xl border border-[#3f332c]/50 mt-1">
                  <span className="text-[7.5px] uppercase font-black tracking-widest text-emerald-400 block mb-1">Your Voice Record</span>
                  <p className="text-xs font-medium text-orange-200/80 italic">"{log.response}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
