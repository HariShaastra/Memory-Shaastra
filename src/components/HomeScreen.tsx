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
  Type,
  HelpCircle
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
      
      {/* App Branding Heading */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl md:text-3xl font-black text-orange-500 tracking-tighter uppercase italic">
          Memory <span className="text-orange-100">Shaastra</span>
        </h1>
        <div className="h-1 w-12 bg-orange-500 mx-auto mt-2 rounded-full opacity-50" />
      </motion.div>

      {/* Intro Header (Learn Fast) - ELONGATED TO MAX-W-4XL AT TOP */}
      <div className="w-full max-w-4xl text-center space-y-4 bg-[#1a1614] p-8 rounded-[2.5rem] border border-[#3f332c] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Brain size={60} className="text-orange-500" />
        </div>
        <div className="space-y-3 relative z-10">
          <h2 className="text-3xl font-black tracking-tighter italic text-orange-100 uppercase">
            LEARN <span className="text-orange-500">FAST.</span>
          </h2>
          <div className="space-y-4">
            <p className="text-orange-200/70 font-bold text-sm italic">
              "{dailyQuote}"
            </p>
            <div className="pt-2 border-t border-orange-500/10">
              <p className="text-[#e2b89d] text-xs font-semibold leading-relaxed max-w-2xl mx-auto">
                Memory Shaastra is a smart study tool built for students. It helps you remember everything you learn using easy memory tricks. Whether it's for exams or daily learning, we make it fast and unforgettable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Buttons - TOP POSITION RIGHT BELOW LEARN FAST */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('focus')}
            className="w-full group bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-[2px] rounded-[2.5rem] shadow-2xl shadow-orange-500/40"
          >
            <div className="bg-[#1a1614] text-white px-8 py-8 rounded-[2.4rem] flex items-center justify-between border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                  <Timer size={40} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-black tracking-[0.4em] text-orange-400 mb-1">Focus Mode</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter leading-none">Study Now</span>
                </div>
              </div>
              <ChevronRight size={32} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-4 transition-all relative z-10" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setView('memory-boost')}
            className="w-full group bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-[2px] rounded-[2.5rem] shadow-2xl shadow-indigo-500/40"
          >
            <div className="bg-[#1a1614] text-white px-8 py-8 rounded-[2.4rem] flex items-center justify-between border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                  <Zap size={40} className="text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-black tracking-[0.4em] text-indigo-400 mb-1">{t.todaysTarget}: {todayTarget} left</span>
                  <span className="text-2xl font-black italic uppercase tracking-tighter leading-none">Daily Boost</span>
                </div>
              </div>
              <ChevronRight size={32} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-4 transition-all relative z-10" />
            </div>
          </motion.button>
      </div>

      {/* Your Schedule / Next Task Section */}
      <div className="w-full max-w-4xl bg-[#2a221f]/50 p-6 rounded-[2.5rem] border border-[#3f332c]/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
            <Target size={24} className="text-amber-500" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-orange-200/40 uppercase font-black tracking-widest leading-none mb-1">Your Schedule & Focus Task</p>
            <p className="text-base font-black text-orange-100 uppercase italic">
              {studyTasks.find(t => !t.completed) 
                ? `Active Task: ${studyTasks.find(t => !t.completed)?.topic} (${studyTasks.find(t => !t.completed)?.subject}) planned for ${studyTasks.find(t => !t.completed)?.plannedDate}`
                : activePlan ? `${activePlan.title}` : "All tasks completed! Keep learning."
              }
            </p>
          </div>
        </div>
        <div className="flex gap-4 items-center shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setView('rescue-queue')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3.5 rounded-2xl text-[9px] uppercase tracking-wider transition-all"
          >
            Active Recall
          </motion.button>
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => setView('planner')}
            className="text-orange-200/40 hover:text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <span>Planner</span> <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* User Hello & Profile */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 bg-[#2a221f]/50 p-8 rounded-[3rem] border border-[#3f332c]/50">
        <div className="flex items-center gap-6">
          <div className="text-left space-y-2">
            <h2 className="text-2xl font-black text-orange-100 tracking-tighter">
              {user?.name ? "Welcome back," : "Hello,"} <span className="text-orange-500">{user?.name || "Wandering Soul"}</span>!
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

      {/* Secondary Actions */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('exam-mode')}
          className="flex items-center justify-center gap-3 p-5 bg-[#2a221f] rounded-[2rem] border border-[#3f332c] shadow-lg hover:bg-[#342a27] transition-all text-orange-100 font-black italic uppercase tracking-tighter"
        >
          <Target size={20} className="text-amber-500" />
          <span>{t.examMode}</span>
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

      {/* COMPREHENSIVE LAYMAN'S FACILITY GUIDE */}
      <div className="w-full max-w-4xl bg-[#2a221f]/50 p-8 rounded-[3rem] border border-[#3f332c]/50 space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-[#3f332c]/50 pb-4">
          <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center text-orange-400 border border-orange-500/25">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase text-orange-100 italic tracking-tight">Active Learning Facility Directory</h3>
            <p className="text-orange-200/40 text-[9px] uppercase font-black tracking-widest mt-0.5">Simple layman guide & step-by-step instructions (No AI interference)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FACILITY 1 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-orange-400 tracking-wider">⏱️ Study Timer (Focus Mode)</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> A distraction-free study clock that runs silent focus intervals to help you work deeply without fatigue.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. Pick a subject topic name.</span>
              <span className="block mt-1">2. Choose your focus time length.</span>
              <span className="block mt-1">3. Tap "Start Session" and study until the notification bells ring.</span>
            </div>
          </div>

          {/* FACILITY 2 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-rose-400 tracking-wider">❤️ Active Recall Gym</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> A test cue card board that loads random questions, flashcards, or documents from your library to prove you still remember them.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. View the random question.</span>
              <span className="block mt-1">2. Answer aloud (optional: click microphone to log voice).</span>
              <span className="block mt-1">3. Reveal solution and click Forgot or Remembered.</span>
            </div>
          </div>

          {/* FACILITY 3 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-amber-500 tracking-wider">📚 Your Personal Library</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> A digital organizer divided into books, volumes, and custom subject maps for cataloging study files and spoken logs.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. Create grouping topics.</span>
              <span className="block mt-1">2. Tap "Catalog Document" to write study notes.</span>
              <span className="block mt-1">3. Tap any item to read, edit group paths, or delete.</span>
            </div>
          </div>

          {/* FACILITY 4 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-indigo-400 tracking-wider">🗂️ Study Planner</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> A daily calendar log that maps out exact topics and future dates for your regular topic reviews.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. Enter subject details and pick a study date.</span>
              <span className="block mt-1">2. Tap "Schedule Task".</span>
              <span className="block mt-1">3. Complete each scheduled item to gain valuable level XP.</span>
            </div>
          </div>

          {/* FACILITY 5 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-emerald-400 tracking-wider">🎯 Exam Planner Mode</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> A spacing scheduler that spaces out revision blocks dynamically so you finish preparing perfectly before exam day.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. Enter your exam name, subject, and exam date.</span>
              <span className="block mt-1">2. Tap "Create Exam Plan".</span>
              <span className="block mt-1">3. Follow the automatically calculated revision milestones.</span>
            </div>
          </div>

          {/* FACILITY 6 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-amber-600 tracking-wider">🔮 Memory Boost Hub</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> A collection of classical association tricks (Memory Palace, Story, Linking, Initials) for memorizing checklists.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. Select your preferred method at the bottom of the home screen.</span>
              <span className="block mt-1">2. Add sequence items.</span>
              <span className="block mt-1">3. Read the visual maps to link items.</span>
            </div>
          </div>

          {/* FACILITY 7 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-sky-400 tracking-wider">⚡ Flashcard Decks</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> Virtual double-sided flashcards that hide the explanation until clicked, reinforcing instantaneous recall.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. Click "Add New Card" to save a query.</span>
              <span className="block mt-1">2. Input front text and back explanation.</span>
              <span className="block mt-1">3. Click cards to instantly flip and verify.</span>
            </div>
          </div>

          {/* FACILITY 8 */}
          <div className="bg-[#1a1614] p-5 rounded-2xl border border-[#3f332c]/65 space-y-2.5">
            <p className="text-xs font-black uppercase text-violet-400 tracking-wider">🧠 Memory Tricks (Mnemonics)</p>
            <p className="text-xs text-orange-100/90 font-medium leading-relaxed">
              <strong>What it is & does:</strong> A creator for storing silly phrase association codes to hook complex list sequences permanently in head space.
            </p>
            <div className="text-[10px] text-orange-200/40 leading-relaxed font-bold">
              <strong>Steps to use:</strong>
              <span className="block mt-1">1. Enter your subject and a silly formula phrase.</span>
              <span className="block mt-1">2. Click Save.</span>
              <span className="block mt-1">3. Tap "Practice" to hide and type the formula until perfect.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Tools Horizontal */}
      <div className="w-full pt-12 border-t border-[#3f332c]">
        <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-400/40 text-center mb-8">{t.memoryTools}</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: 'mnemonics', icon: Brain, label: t.mnemonics, view: 'mnemonics', color: 'text-orange-500' },
            { id: 'palace', icon: Timer, label: t.palace, view: 'palace', color: 'text-amber-500' },
            { id: 'linking', icon: Zap, label: t.linking, view: 'linking', color: 'text-orange-400' },
            { id: 'story', icon: Book, label: t.story, view: 'story', color: 'text-orange-600' },
            { id: 'first-letter', icon: Type, label: t.firstLetter, view: 'first-letter', color: 'text-amber-600' },
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
