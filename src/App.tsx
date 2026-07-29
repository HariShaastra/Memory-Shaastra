import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import { HomeScreen } from './components/HomeScreen';
import { Logo } from './components/Logo';
import MonkModeTimer from './components/MonkModeTimer';
import FlashcardDeck from './components/FlashcardDeck';
import { MemoryBoost } from './components/MemoryBoost';
import Auth from './components/Auth';
import Mnemonics from './components/Mnemonics';
import MemoryPalace from './components/MemoryPalace';
import LinkingMethod from './components/LinkingMethod';
import StoryMethod from './components/StoryMethod';
import FirstLetterMethod from './components/FirstLetterMethod';
import RevisionScheduler from './components/RevisionScheduler';
import { StudyPlanner } from './components/StudyPlanner';
import Settings from './components/Settings';
import { ExamMode } from './components/ExamMode';
import Library from './components/Library';
import RescueQueue from './components/RescueQueue';
import LearnerAdviceView from './components/LearnerAdvice';
import AiTester from './components/AiTester';
import ConceptSimplifier from './components/ConceptSimplifier';
import MemoryDna from './components/MemoryDna';
import StudyWellbeingCoach from './components/StudyWellbeingCoach';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Menu, Sparkles } from 'lucide-react';
import { t } from './utils/translations';
import { CalendarView } from './components/CalendarView';

function AppContent() {
  const { currentView, goBack, setView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (currentView === 'auth') return <Auth />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <HomeScreen />;
      case 'focus': return <MonkModeTimer />;
      case 'flashcards': return <FlashcardDeck />;
      case 'mnemonics': return <Mnemonics />;
      case 'palace': return <MemoryPalace />;
      case 'linking': return <LinkingMethod />;
      case 'story': return <StoryMethod />;
      case 'first-letter': return <FirstLetterMethod />;
      case 'calendar': return <CalendarView />;
      case 'scheduler': return <RevisionScheduler />;
      case 'memory-boost': return <MemoryBoost />;
      case 'planner': return <StudyPlanner />;
      case 'exam-mode': return <ExamMode />;
      case 'settings': return <Settings />;
      case 'library': return <Library />;
      case 'rescue-queue': return <RescueQueue />;
      case 'advice': return <LearnerAdviceView />;
      case 'ai-tester': return <AiTester />;
      case 'simplifier': return <ConceptSimplifier />;
      case 'memory-dna': return <MemoryDna />;
      case 'wellbeing': return <StudyWellbeingCoach />;
      default: return <HomeScreen />;
    }
  };

  const showBackButton = currentView !== 'dashboard';

  return (
    <div className="flex h-screen bg-[#1a1614] text-[#fef3c7] overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar View */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 overflow-y-auto relative bg-[#1a1614] border-l border-[#3f332c] w-full">
        {/* TOP RIBBON */}
        <div className="sticky top-0 z-20 px-3 sm:px-6 py-3 bg-[#fffaf5] text-slate-900 border-b border-orange-200 shadow-md flex items-center justify-between gap-2 max-w-full min-w-0 overflow-hidden">
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:bg-orange-100 rounded-xl border border-orange-300 active:scale-95 transition-all shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Title Button in Top Ribbon leading to Home */}
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center space-x-1.5 bg-orange-100/80 hover:bg-orange-200/80 px-2.5 sm:px-3.5 py-1.5 rounded-2xl border border-orange-300 text-slate-900 transition-all active:scale-95 group shadow-sm shrink min-w-0"
            >
              <Logo size={20} className="group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-black text-xs sm:text-base tracking-tight text-slate-900 group-hover:text-orange-700 transition-colors truncate">
                Memory Shaastra
              </span>
            </button>

            {showBackButton && (
              <button 
                onClick={goBack}
                className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 transition-colors font-bold uppercase tracking-wider text-[10px] bg-white/80 hover:bg-white py-1.5 px-2.5 rounded-xl border border-orange-200 shadow-sm active:scale-95 shrink-0"
              >
                <ArrowLeft size={14} />
                <span className="hidden md:inline">{t.back}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={() => setView('auth')}
              className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-orange-50 text-slate-800 border border-orange-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
              title="Google / Email Account Sign In"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden sm:inline font-black text-[11px]">Sign In / Sync</span>
            </button>

            <button
              onClick={() => setView('focus')}
              className="px-2.5 sm:px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>Focus Session</span>
            </button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[calc(100vh-68px)] w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
