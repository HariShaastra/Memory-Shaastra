import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Zap, 
  Brain, 
  RefreshCw, 
  Trophy,
  Timer
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';

type GameState = 'idle' | 'playing' | 'result';

export const Icebreaker: React.FC = () => {
  const { goBack } = useAppContext();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameType, setGameType] = useState<'numbers' | 'patterns' | 'grid'>('numbers');
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
    } else if (timeLeft === 0) {
      setGameState('result');
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
    setTimeout(() => setShowNumber(false), 2000);
  };

  const checkNumber = () => {
    if (parseInt(userInput) === targetNumber) {
      setScore(prev => prev + 10);
      nextNumber();
    } else {
      setGameState('result');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{t.icebreakerWarmup}</h1>
      </header>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px] flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto">
                <Brain size={40} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ready to wake up your brain?</h2>
                <p className="text-slate-500 mt-2">Short 30-second memory exercises to prepare for studying.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={startNumberGame}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap size={20} />
                  Start Number Recall
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-8"
            >
              <div className="flex justify-between items-center w-full max-w-xs mx-auto">
                <div className="flex items-center gap-2 font-bold text-slate-500">
                  <Timer size={18} />
                  <span>{timeLeft}s</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-indigo-600">
                  <Trophy size={18} />
                  <span>{score}</span>
                </div>
              </div>

              <div className="py-12">
                {showNumber ? (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-black tracking-widest text-indigo-600"
                  >
                    {targetNumber}
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <input 
                      type="number"
                      autoFocus
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkNumber()}
                      className="text-4xl font-bold text-center w-full bg-transparent border-b-4 border-indigo-500 outline-none pb-2"
                      placeholder="Enter number..."
                    />
                    <button 
                      onClick={checkNumber}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                      Check
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto">
                <Trophy size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Great Job!</h2>
                <p className="text-slate-500 mt-2">Your brain is now active and ready to study.</p>
                <div className="text-4xl font-black text-indigo-600 mt-4">Score: {score}</div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setGameState('idle')}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
                <button 
                  onClick={() => goBack()}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Start Studying
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
