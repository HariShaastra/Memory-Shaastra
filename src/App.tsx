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
import AiTester from './components/AiTester';
import ConceptSimplifier from './components/ConceptSimplifier';
import MemoryDna from './components/MemoryDna';
import StudyWellbeingCoach from './components/StudyWellbeingCoach';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Menu, Sparkles, LogOut, User as UserIcon, Play } from 'lucide-react';
import { t } from './utils/translations';
import { CalendarView } from './components/CalendarView';

function AppContent() {
  const { currentView, goBack, setView, theme, user, signOutUser, startStudyNow } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

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
      case 'ai-tester': return <AiTester />;
      case 'simplifier': return <ConceptSimplifier />;
      case 'memory-dna': return <MemoryDna />;
      case 'wellbeing': return <StudyWellbeingCoach />;
      default: return <HomeScreen />;
    }
  };

  const showBackButton = currentView !== 'dashboard';

  return (
    <div className={`flex h-screen overflow-hidden font-sans relative transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#1a1614] text-[#fef3c7]' : 'bg-[#fffaf5] text-stone-900'
    }`}>
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
      
      <main ref={mainRef} className={`flex-1 overflow-y-auto relative border-l w-full transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#1a1614] border-[#3f332c] text-[#fef3c7]' : 'bg-[#fffaf5] border-orange-200 text-stone-900'
      }`}>
        {/* TOP RIBBON */}
        <div className={`sticky top-0 z-30 px-3 sm:px-6 py-2 sm:py-2.5 border-b shadow-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 max-w-full w-full transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#2a221f] text-orange-100 border-[#3f332c]' : 'bg-[#fffaf5] text-slate-900 border-orange-200'
        }`}>
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-wrap sm:flex-nowrap gap-y-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`lg:hidden p-1.5 rounded-xl border active:scale-95 transition-all shrink-0 ${
                theme === 'dark' ? 'text-orange-100 hover:bg-[#3f332c] border-[#3f332c]' : 'text-slate-800 hover:bg-orange-100 border-orange-300'
              }`}
              aria-label="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Title Button in Top Ribbon leading to Home */}
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border transition-all active:scale-95 group shadow-sm shrink-0 ${
                theme === 'dark' ? 'bg-[#1a1614] hover:bg-[#3f332c] border-[#3f332c] text-orange-100' : 'bg-orange-100/80 hover:bg-orange-200/80 border-orange-300 text-slate-900'
              }`}
            >
              <Logo size={18} className="group-hover:scale-110 transition-transform shrink-0" />
              <span className={`font-black text-xs sm:text-sm tracking-tight transition-colors whitespace-nowrap ${
                theme === 'dark' ? 'text-orange-100 group-hover:text-orange-400' : 'text-slate-900 group-hover:text-orange-700'
              }`}>
                Memory Shaastra
              </span>
            </button>

            {showBackButton && (
              <button 
                onClick={goBack}
                className={`flex items-center space-x-1 transition-colors font-bold uppercase tracking-wider text-[10px] py-1 sm:py-1.5 px-2.5 rounded-xl border shadow-sm active:scale-95 shrink-0 ${
                  theme === 'dark' ? 'text-orange-200 hover:text-white bg-[#1a1614] hover:bg-[#3f332c] border-[#3f332c]' : 'text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border-orange-200'
                }`}
              >
                <ArrowLeft size={14} />
                <span>{t.back}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0 relative ml-auto sm:ml-0">
            {/* Study Now Focus Sprint Button */}
            <button
              onClick={() => startStudyNow('Active Focus Study', 25)}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap shrink-0"
              title="Start Study Now Focus Sprint"
            >
              <Play size={12} className="fill-current shrink-0" />
              <span className="text-[11px] sm:text-xs font-black">Study Now</span>
            </button>

            {/* Normal Sign In / Account Button WITHOUT profile picture */}
            {user && (user.email || user.name) ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsProfileMenuOpen(prev => !prev)}
                  className={`px-2.5 py-1 sm:py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm shrink-0 ${
                    theme === 'dark' ? 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-100 border-[#3f332c]' : 'bg-white hover:bg-orange-50 text-slate-800 border-orange-300'
                  }`}
                  title="Account Profile & Sign Out"
                >
                  <UserIcon size={16} className="text-orange-500 shrink-0" />
                  <span className="font-bold text-[11px] max-w-[110px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#2a221f] border border-[#3f332c] rounded-2xl shadow-2xl p-3 z-50 text-left space-y-2">
                    <div className="px-2 py-1.5 border-b border-[#3f332c]">
                      <p className="text-xs font-black text-orange-100 truncate">{user.name || 'Learner'}</p>
                      <p className="text-[10px] text-orange-200/50 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setView('settings');
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs font-bold text-orange-200/80 hover:text-white hover:bg-[#3f332c] rounded-xl transition-colors flex items-center space-x-2"
                    >
                      <UserIcon size={14} />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        await signOutUser();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center space-x-2"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setView('auth')}
                className={`px-2.5 py-1 sm:py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm shrink-0 ${
                  theme === 'dark' ? 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-100 border-[#3f332c]' : 'bg-white hover:bg-orange-50 text-slate-800 border-orange-300'
                }`}
                title="Sign In"
              >
                <UserIcon size={16} className="text-orange-500 shrink-0" />
                <span className="font-black text-[11px]">Sign In</span>
              </button>
            )}
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
