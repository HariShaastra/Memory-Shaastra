import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  Flame,
  Clock,
  ChevronRight,
  TrendingUp,
  Brain,
  Timer,
  Book,
  Type
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { t } from '../utils/translations';
import { MaanasMascot } from './MaanasMascot';

export const HomeScreen: React.FC = () => {
  const { setView, user, examPlans, gamification, level, studyTasks } = useAppContext();

  const activePlan = examPlans.find(p => p.isActive) || examPlans[0];
  
  const suggestions = [
    "Ready to learn something new today?",
    "Practice makes your brain strong!",
    "Did you check your review plan?",
    "Remember: Focus is very important.",
    "Let's work on your study map!",
    "Success comes from small steps every day.",
  ];

  const quotes = [
    "To finish, you must start.",
    "Hard things become easy after you do them.",
    "Good work comes from practice.",
    "To begin, stop talking and start doing.",
    "Your brain is your best tool.",
    "Keep going to reach your goal.",
    "Great things are made of small steps."
  ];

  // Deterministic values based on date
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dailyQuote = quotes[dateSeed % quotes.length];
  const [randomSuggestion] = React.useState(() => suggestions[dateSeed % suggestions.length]);
  
  const getDaysToGo = () => {
    if (!activePlan?.examDate) return null;
    const diff = new Date(activePlan.examDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysToGo = getDaysToGo();
  const todayTarget = studyTasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-12">
      
      {/* User Hello & Profile */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 bg-[#2a221f]/50 p-8 rounded-[3rem] border border-[#3f332c]/50">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-500 p-1 shadow-xl shadow-orange-500/20">
              <div className="w-full h-full rounded-[1.8rem] bg-[#1a1614] overflow-hidden flex items-center justify-center border-2 border-[#1a1614]">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Maanas'}`} alt="Avatar" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>
          <div className="text-left space-y-2">
            <h2 className="text-2xl font-black text-orange-100 tracking-tighter">
              Hello, <span className="text-orange-500">{user?.name || 'Friend'}</span>!
            </h2>
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <p className="text-orange-200/40 text-[10px] font-black uppercase tracking-widest">
                  {level}
                </p>
                <p className="text-orange-500 text-[10px] font-black italic uppercase">
                  {gamification.xp % 1000} / 1000 XP
                </p>
              </div>
              <div className="w-48 h-1.5 bg-[#1a1614] rounded-full overflow-hidden border border-[#3f332c]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(gamification.xp % 1000) / 10}%` }}
                  className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>

        {daysToGo !== null && (
          <div className="flex items-center gap-4 bg-[#1a1614] px-8 py-4 rounded-[2rem] border border-[#3f332c]">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
              <Clock size={24} className="text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest leading-none mb-1 text-left">Exam Countdown</p>
              <p className="text-2xl font-black text-rose-400 italic leading-none">{daysToGo} <span className="text-sm">Days Left</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Intro Header */}
      <div className="text-center space-y-6 max-w-2xl bg-[#1a1614] p-10 rounded-[3rem] border border-[#3f332c]">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic text-orange-100 uppercase">
            LEARN <span className="text-orange-500">FAST.</span>
          </h1>
          <p className="text-orange-200/70 font-bold text-lg leading-relaxed italic">
            "{dailyQuote}"
          </p>
        </div>
        <p className="text-orange-200/40 font-medium leading-relaxed max-w-lg mx-auto text-sm">
          Memory Shaastra helps you learn fast and never forget. Use our easy tools to remember anything.
        </p>
      </div>

      {/* Center Piece: Maanas Mascot */}
      <div className="relative flex flex-col items-center">
        <MaanasMascot size={320} expression="happy" className="z-10" />
        
        {/* Intro bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-[#2a221f] p-8 rounded-[4rem] rounded-tl-none shadow-2xl shadow-orange-900/20 border border-[#3f332c] max-w-sm text-center relative"
        >
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-orange-500 block text-left">Help:</span>
            <p className="text-orange-100/90 leading-relaxed font-bold text-xl italic drop-shadow-sm">
              "{user?.name ? `${user.name}, ${randomSuggestion.charAt(0).toLowerCase() + randomSuggestion.slice(1)}` : randomSuggestion}"
            </p>
          </div>
          <div className="absolute -top-3 left-0 w-8 h-8 bg-[#2a221f] rotate-45 border-l border-t border-[#3f332c]" />
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center justify-center p-6 bg-[#2a221f] rounded-[2.5rem] shadow-xl border border-[#3f332c]"
        >
          <Flame size={24} className="text-orange-500 fill-orange-500 mb-2" />
          <span className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest mb-1">{t.streakDays}</span>
          <span className="text-2xl font-black text-orange-100 italic">{gamification.streak}</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center p-6 bg-[#2a221f] rounded-[2.5rem] shadow-xl border border-[#3f332c]"
        >
          <TrendingUp size={24} className="text-amber-500 mb-2" />
          <span className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest mb-1">{level}</span>
          <span className="text-2xl font-black text-amber-500 italic">{gamification.xp}</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center p-6 bg-[#2a221f] rounded-[2.5rem] shadow-xl border border-[#3f332c]"
        >
          <Brain size={24} className="text-indigo-400 mb-2" />
          <span className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest mb-1">Badges</span>
          <span className="text-2xl font-black text-indigo-400 italic">{gamification.badges.length}</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center p-6 bg-[#2a221f] rounded-[2.5rem] shadow-xl border border-[#3f332c]"
        >
          <Zap size={24} className="text-orange-400 mb-2" />
          <span className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest mb-1">Boosts</span>
          <span className="text-2xl font-black text-orange-400 italic">2</span>
        </motion.div>
      </div>

      {/* Main Actions */}
      <div className="w-full max-w-4xl flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setView('memory-boost')}
          className="w-full group bg-gradient-to-r from-orange-600 to-amber-600 p-1 rounded-3xl shadow-2xl shadow-orange-500/20"
        >
          <div className="bg-transparent text-white px-8 py-6 rounded-[22px] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <Zap size={32} className="text-white fill-white" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase font-black tracking-[0.2em] text-orange-100 opacity-70 mb-1">{t.todaysTarget}: {todayTarget} left</span>
                <span className="text-2xl font-black italic uppercase tracking-tight">Start Review</span>
              </div>
            </div>
            <ChevronRight size={32} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-transform" />
          </div>
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('exam-mode')}
            className="flex items-center justify-center gap-3 p-5 bg-[#2a221f] rounded-[2rem] border border-[#3f332c] shadow-lg hover:bg-[#342a27] transition-all text-orange-100 font-black italic uppercase tracking-tighter"
          >
            <Timer size={20} className="text-amber-500" />
            <span>{t.enterStudyMode}</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('planner')}
            className="flex items-center justify-center gap-3 p-5 bg-[#2a221f] rounded-[2rem] border border-[#3f332c] shadow-lg hover:bg-[#342a27] transition-all text-orange-100 font-black italic uppercase tracking-tighter"
          >
            <Target size={20} className="text-emerald-500" />
            <span>{t.viewProgress}</span>
          </motion.button>
        </div>
      </div>

      {/* Secondary Tools Horizontal */}
      <div className="w-full pt-12 border-t border-[#3f332c]">
        <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-400/40 text-center mb-8">{t.memoryTools}</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: 'mnemonics', icon: Brain, label: 'Memory Words', view: 'mnemonics', color: 'text-orange-500' },
            { id: 'palace', icon: Timer, label: 'Room Trick', view: 'palace', color: 'text-amber-500' },
            { id: 'linking', icon: Zap, label: 'Link Trick', view: 'linking', color: 'text-orange-400' },
            { id: 'story', icon: Book, label: 'Story Method', view: 'story', color: 'text-orange-600' },
            { id: 'first-letter', icon: Type, label: 'Letter Trick', view: 'first-letter', color: 'text-amber-600' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setView(tool.view as any)}
              className="flex items-center gap-2 px-6 py-3 bg-[#2a221f] hover:bg-[#342a27] rounded-2xl border border-[#3f332c] transition-all group"
            >
              <tool.icon size={16} className={`${tool.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-black uppercase tracking-widest text-orange-200/60 transition-colors group-hover:text-orange-100">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <footer className="w-full pt-8 pb-4 text-center border-t border-[#3f332c]">
        <p className="text-[10px] text-orange-200/20 font-black tracking-widest uppercase italic">
          Disclaimer: This app helps you remember things. You still need to study your books to learn everything.
        </p>
      </footer>
    </div>
  );
};
