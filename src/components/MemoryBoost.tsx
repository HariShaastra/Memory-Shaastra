import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Zap, 
  Trophy,
  Timer,
  RefreshCw,
  HelpCircle,
  Brain
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

type GameState = 'idle' | 'playing' | 'result';

export const MemoryBoost: React.FC = () => {
  const { goBack, updateStreak } = useAppContext();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Number Recall Game
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [userInput, setUserInput] = useState('');
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startNumberGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    nextNumber();
  };

  const nextNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setTargetNumber(num);
    setShowNumber(true);
    setUserInput('');
    setTimeout(() => setShowNumber(false), 1500);
  };

  const checkNumber = () => {
    if (parseInt(userInput) === targetNumber) {
      setScore(prev => prev + 10);
      nextNumber();
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setGameState('result');
    if (updateStreak) updateStreak();
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <header className="flex items-center gap-6">
        <button onClick={goBack} className="p-4 bg-[#2a221f] rounded-[1.5rem] shadow-sm border border-[#3f332c] hover:text-orange-500 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic text-orange-100 uppercase drop-shadow-sm">Inner Blaze</h1>
          <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">30-Second Cognitive Surge</p>
        </div>
      </header>

      {/* Layman Explanation of this Facility */}
      <div className="w-full bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 space-y-2 text-left">
        <div className="flex items-center gap-2 text-orange-400">
          <HelpCircle size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">How to Use Inner Blaze Game</span>
        </div>
        <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
          <strong>What it is & does:</strong> A 30-second reflex recall training game that flashes sequence numbers to rev up your working memory focus before a big study slot.
        </p>
        <p className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
          <strong>Steps to use:</strong> 1. Click "Unleash Surge". 2. Pay close attention to the flashed number before it disappears. 3. Quick-type the exact matching number digits and repeat to level up!
        </p>
      </div>

      <div className="bg-[#2a221f] p-10 rounded-[4rem] shadow-2xl border border-[#3f332c] min-h-[550px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-orange-500 rounded-tl-3xl" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-orange-500 rounded-br-3xl" />
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10 flex flex-col items-center relative z-10"
            >
              <div className="p-6 bg-orange-600/20 rounded-full border border-orange-500/30 text-orange-400">
                <Brain size={64} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-orange-100 italic uppercase tracking-tight leading-tight">Ignite your Focus?</h2>
                <p className="text-orange-200/40 mt-3 max-w-xs mx-auto text-xs font-bold uppercase tracking-widest leading-relaxed italic">Capture the vanishing runes. Your brain is a furnace; let it burn bright.</p>
              </div>
              <button 
                onClick={startNumberGame}
                className="w-full max-w-xs px-10 py-5 bg-orange-600 text-white rounded-[2.5rem] font-black uppercase italic tracking-widest text-[11px] hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-4 shadow-2xl shadow-orange-600/30"
              >
                <Zap size={24} className="fill-white animate-pulse" />
                <span>Unleash Surge</span>
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-16 relative z-10"
            >
              <div className="flex justify-between items-center w-full max-w-sm mx-auto p-6 bg-[#1a1614] rounded-[2.5rem] border border-[#3f332c] shadow-inner">
                <div className="flex items-center gap-4 font-black text-orange-200/30">
                  <div className="w-12 h-12 bg-[#2a221f] rounded-2xl flex items-center justify-center border border-[#3f332c] shadow-sm">
                    <Timer size={24} className="text-orange-500" />
                  </div>
                  <span className="text-2xl tabular-nums italic font-black text-orange-100">{timeLeft}s</span>
                </div>
                <div className="flex items-center gap-4 font-black text-orange-500">
                  <span className="text-2xl tabular-nums italic font-black">{score}</span>
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                    <Trophy size={24} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center min-h-[250px]">
                {showNumber ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="text-8xl font-black tracking-[0.3em] text-orange-100 drop-shadow-[0_0_20px_rgba(234,88,12,0.5)] italic"
                  >
                    {targetNumber}
                  </motion.div>
                ) : (
                  <div className="space-y-10 w-full max-w-[280px]">
                    <div className="relative">
                      <input 
                        type="number"
                        autoFocus
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && checkNumber()}
                        className="text-6xl font-black text-center w-full bg-transparent border-b-4 border-orange-600 outline-none pb-6 tracking-[0.2em] text-orange-100 italic drop-shadow-xl"
                        placeholder="----"
                      />
                    </div>
                    <button 
                      onClick={checkNumber}
                      className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black uppercase italic tracking-widest text-[11px] shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition-all active:scale-95"
                    >
                      Manifest Truth
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10 flex flex-col items-center relative z-10"
            >
              <div className="p-6 bg-orange-600/20 rounded-full border border-orange-500/30 text-amber-400">
                <Trophy size={64} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-orange-100 italic uppercase tracking-tighter drop-shadow-sm">Radiant Mind!</h2>
                <p className="text-orange-200/40 mt-2 font-bold uppercase tracking-[0.2em] text-[10px] italic">Your mental sanctum is illuminated.</p>
                <div className="flex gap-6 justify-center mt-8">
                  <div className="bg-[#1a1614] px-8 py-3 rounded-2xl border border-[#3f332c] flex flex-col items-center shadow-inner">
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-200/50 italic">Recall Score</span>
                    <span className="text-3xl font-black text-orange-500 italic">{score}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full max-w-[280px] gap-4">
                <button 
                  onClick={() => setGameState('idle')}
                  className="w-full px-8 py-4 bg-[#1a1614] rounded-[2rem] font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-4 border border-[#3f332c] text-orange-200/40 hover:text-orange-500 transition-all"
                >
                  <RefreshCw size={18} />
                  Rekindle
                </button>
                <button 
                  onClick={() => goBack()}
                  className="w-full px-8 py-5 bg-orange-600 text-white rounded-[2.5rem] font-black uppercase italic tracking-widest text-[11px] shadow-2xl shadow-orange-600/30 hover:bg-orange-700 transition-all active:scale-95"
                >
                  Temple Entrance
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
