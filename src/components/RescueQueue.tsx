import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle,
  ChevronLeft,
  RefreshCw,
  Award,
  Send
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
    updateStreak,
    addNotification,
    goBack 
  } = useAppContext();

  const [queue, setQueue] = useState<RescueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  // Generate a randomized pool of items on demand
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
        answer: `Mnemonic trick: "${m.phrase || m.title}"`,
        subject: "Mnemonic",
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
    setUserAnswer('');
  };

  useEffect(() => {
    handleRegenerateRandomQueue();
  }, [flashcards, mnemonics, studyMaterials]);

  const handleScore = (performance: 1 | 2 | 3 | 4) => {
    const currentItem = queue[currentIndex];
    if (!currentItem) return;

    // Rate through context engine
    rateRecall(currentItem.id, currentItem.sourceType, performance);

    // Proceed to next item
    setIsRevealed(false);
    setUserAnswer('');
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleRescueComplete();
    }
  };

  const handleRescueComplete = () => {
    setIsDone(true);
    if (updateStreak) updateStreak();
    addNotification({
      title: "Active Recall Complete!",
      message: "Daily random active retrieval practice logged successfully! Strength levels updated.",
      type: "motivational",
      priority: "medium"
    });
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
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-orange-100">Active Recall Complete!</h2>
            <p className="text-orange-200/60 text-xs font-bold max-w-sm mx-auto">
              You navigated today's randomized retrieval vectors with pristine precision.
            </p>
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
            <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Written Retrieval • Spaced Repetition Testing</p>
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

      {/* Guidance Banner */}
      <div className="bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-rose-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Active Recall Instructions</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          Active recall forces your brain to retrieve knowledge without hints, solidifying memory pathways.
        </p>
        <div className="text-[10px] text-orange-200/60 leading-relaxed font-bold space-y-1 pt-1">
          <div>1. Read the trigger question shown on screen.</div>
          <div>2. Write down your recalled answer in the input box below.</div>
          <div>3. Click <strong>Submit Answer</strong> to reveal the actual solution.</div>
          <div>4. Compare your response with the solution and rate your recall: <strong>Again</strong>, <strong>Hard</strong>, <strong>Good</strong>, or <strong>Easy</strong>.</div>
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
          <div className="bg-[#2a221f] border border-[#3f332c] rounded-[3.5rem] p-8 md:p-10 min-h-[440px] flex flex-col items-center justify-between text-center shadow-xl relative overflow-hidden">
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

            <div className="flex flex-col items-center space-y-6 my-auto pt-6 w-full">
              <MaanasMascot size={110} expression={isRevealed ? 'happy' : 'focused'} />

              {/* Trigger Question */}
              <div className="space-y-2 w-full max-w-xl">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-200/40 italic">Trigger Question</span>
                <p className="text-xl md:text-2xl font-black italic tracking-tighter text-orange-100 uppercase leading-snug">
                  {currentItem.question}
                </p>
              </div>

              {/* Answer Input Box */}
              {!isRevealed ? (
                <div className="w-full max-w-xl space-y-4 pt-2">
                  <div className="text-left space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-300">
                      Write Your Answer:
                    </label>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your recalled answer here..."
                      rows={4}
                      className="w-full bg-[#1a1614] border border-[#3f332c] focus:border-orange-500 rounded-2xl p-4 text-sm text-orange-100 placeholder:text-orange-200/30 focus:outline-none transition-all font-medium"
                    />
                  </div>

                  <button
                    onClick={() => setIsRevealed(true)}
                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    <span>Submit Answer & Reveal Solution</span>
                  </button>
                </div>
              ) : (
                /* Revealed state comparing answers */
                <AnimatePresence mode="wait">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-xl space-y-5 border-t border-[#3f332c]/50 pt-6 text-left"
                  >
                    {/* User's Submitted Answer */}
                    <div className="bg-[#1a1614] border border-[#3f332c] p-4 rounded-2xl space-y-1">
                      <span className="text-[9px] uppercase font-black tracking-widest text-orange-200/50 block">
                        Your Submitted Answer:
                      </span>
                      <p className="text-xs font-semibold text-orange-100 whitespace-pre-wrap italic">
                        {userAnswer.trim() ? userAnswer : "(No written answer provided)"}
                      </p>
                    </div>

                    {/* Actual Solution */}
                    <div className="bg-[#1a1614] border border-orange-500/40 p-4 rounded-2xl space-y-1">
                      <span className="text-[9px] uppercase font-black tracking-widest text-orange-400 block">
                        Actual Solution:
                      </span>
                      <p className="text-sm font-bold text-orange-100 leading-relaxed whitespace-pre-wrap">
                        {currentItem.answer}
                      </p>
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-[11px] font-black uppercase tracking-wider text-orange-200/90">
                        Compare your answer with the actual solution and rate your recall:
                      </p>
                    </div>

                    {/* Rating buttons */}
                    <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                      <button 
                        onClick={() => handleScore(1)}
                        className="flex-1 min-w-[110px] py-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="font-mono text-[9px] bg-rose-500/20 px-1.5 py-0.5 rounded">1</span>
                        <span>Again</span>
                      </button>
                      <button 
                        onClick={() => handleScore(2)}
                        className="flex-1 min-w-[110px] py-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="font-mono text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded">2</span>
                        <span>Hard</span>
                      </button>
                      <button 
                        onClick={() => handleScore(3)}
                        className="flex-1 min-w-[110px] py-3.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="font-mono text-[9px] bg-sky-500/20 px-1.5 py-0.5 rounded">3</span>
                        <span>Good</span>
                      </button>
                      <button 
                        onClick={() => handleScore(4)}
                        className="flex-1 min-w-[110px] py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="font-mono text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded">4</span>
                        <span>Easy</span>
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-[#2a221f]/30 border-2 border-dashed border-[#3f332c] rounded-[4rem] flex flex-col items-center">
          <MaanasMascot size={160} expression="proud" />
          <h3 className="text-xl font-black text-orange-100 uppercase italic mt-6">Active Recall list empty</h3>
          <p className="text-orange-200/40 font-black uppercase tracking-widest text-[10px] italic mt-2">Zero datasets found. Create library materials, flashcards or mnemonics to trigger gym questions!</p>
          <button onClick={goBack} className="mt-6 px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-600/20">Go Back</button>
        </div>
      )}
    </div>
  );
}
