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
import { ArrowLeft, Menu, Sparkles, LogOut, LogIn, User as UserIcon, Play, Shield, Brain, Info, CheckCircle2, X, BellOff, Lock, Home, Calendar as CalendarIcon, BookOpen, Book, Target, LayoutGrid } from 'lucide-react';
import { t } from './utils/translations';
import { CalendarView } from './components/CalendarView';
import { distractionShield } from './utils/distractionShield';

function AppContent() {
  const { currentView, goBack, setView, theme, user, signOutUser, startStudyNow } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [isFocusShieldActive, setIsFocusShieldActive] = React.useState(true);
  const [heldNotificationCount, setHeldNotificationCount] = React.useState(0);
  const [showShieldModal, setShowShieldModal] = React.useState(false);
  const mainRef = React.useRef<HTMLElement>(null);

  // Subscribe to distraction shield status
  React.useEffect(() => {
    const unsubscribe = distractionShield.subscribe((active, count) => {
      setIsFocusShieldActive(active);
      setHeldNotificationCount(count);
    });
    return unsubscribe;
  }, []);

  // Toggle Focus Shield & Fullscreen Immersion
  const toggleFocusShield = async () => {
    const newState = await distractionShield.toggleShield();
    setIsFocusShieldActive(newState);
  };

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

  // Render view router
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
    <div className={`flex h-screen overflow-hidden font-sans relative transition-colors duration-300 w-full max-w-full ${
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
      
      <main ref={mainRef} className={`flex-1 overflow-y-auto overflow-x-hidden relative border-l w-full max-w-full transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#1a1614] border-[#3f332c] text-[#fef3c7]' : 'bg-[#fffaf5] border-orange-200 text-stone-900'
      }`}>
        {/* TOP RIBBON - SYMMETRIC & RESPONSIVE ACROSS MOBILE, TABLET & DESKTOP */}
        <header className={`sticky top-0 z-30 px-3 sm:px-5 lg:px-6 py-2.5 border-b shadow-md max-w-full w-full transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#2a221f]/95 backdrop-blur-md text-orange-100 border-[#3f332c]' : 'bg-[#fffaf5]/95 backdrop-blur-md text-slate-900 border-orange-200'
        }`}>
          {/* Primary Header Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
            {/* Left Group: Menu + Brand + Back */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`lg:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer ${
                  theme === 'dark' ? 'bg-[#1a1614] text-orange-100 hover:bg-[#3f332c] border-[#3f332c]' : 'bg-white text-slate-800 hover:bg-orange-100 border-orange-300'
                }`}
                aria-label="Toggle Sidebar"
                title="Open Navigation Menu"
              >
                <Menu size={18} />
              </button>

              {/* Title Button in Top Ribbon leading to Home */}
              <button
                onClick={() => setView('dashboard')}
                className={`h-9 sm:h-10 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 rounded-xl border transition-all active:scale-95 group shadow-sm shrink-0 cursor-pointer ${
                  theme === 'dark' ? 'bg-[#1a1614] hover:bg-[#3f332c] border-[#3f332c] text-orange-100' : 'bg-orange-100/90 hover:bg-orange-200/80 border-orange-300 text-slate-900'
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
                  className={`h-9 sm:h-10 flex items-center gap-1 transition-colors font-bold uppercase tracking-wider text-[10px] sm:text-xs px-2.5 sm:px-3 rounded-xl border shadow-sm active:scale-95 shrink-0 cursor-pointer ${
                    theme === 'dark' ? 'text-orange-200 hover:text-white bg-[#1a1614] hover:bg-[#3f332c] border-[#3f332c]' : 'text-slate-800 hover:text-slate-950 bg-white hover:bg-orange-50 border-orange-300'
                  }`}
                  title="Go Back"
                >
                  <ArrowLeft size={14} className="shrink-0" />
                  <span className="hidden xs:inline sm:inline">{t.back}</span>
                </button>
              )}
            </div>

            {/* Right Group: Focus Shield & Study Now (on sm+) + Account Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
              {/* Distraction-Free Focus Shield Toggle (Tablet & Desktop single row) */}
              <button
                onClick={toggleFocusShield}
                className={`hidden sm:flex h-9 sm:h-10 px-3 rounded-xl text-xs font-black transition-all items-center gap-1.5 active:scale-95 shrink-0 border cursor-pointer ${
                  isFocusShieldActive
                    ? theme === 'dark'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                    : theme === 'dark'
                      ? 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-200 border-[#3f332c]'
                      : 'bg-white hover:bg-orange-50 text-slate-800 border-orange-300'
                }`}
                title="Distraction-Free Immersion Shield: Outside notifications are suppressed while using the app and shown only after you exit."
              >
                <BellOff size={14} className={isFocusShieldActive ? 'text-emerald-500 shrink-0' : 'text-orange-500 shrink-0'} />
                <span className="text-xs font-black whitespace-nowrap xl:hidden">
                  {isFocusShieldActive ? 'Shield: On' : 'Shield: Off'}
                </span>
                <span className="text-xs font-black whitespace-nowrap hidden xl:inline">
                  {isFocusShieldActive ? 'Outside Notifications Suppressed' : 'Focus Shield: Off'}
                </span>
              </button>

              {/* Study Now Focus Sprint Button (Tablet & Desktop single row) */}
              <button
                onClick={() => {
                  distractionShield.enterFullscreenImmersion();
                  startStudyNow('Active Focus Study', 25);
                }}
                className="hidden sm:flex h-9 sm:h-10 px-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-md transition-all items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title="Start Study Now Focus Sprint"
              >
                <Play size={13} className="fill-current shrink-0" />
                <span className="text-xs font-black whitespace-nowrap">Study Now</span>
              </button>

              {/* Sign In / Account Button in Top Ribbon */}
              {user && user.id !== 'guest' && user.email !== 'guest@maanas.com' ? (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                    className={`h-9 sm:h-10 px-2.5 sm:px-3.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer ${
                      theme === 'dark' ? 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-100 border-[#3f332c]' : 'bg-white hover:bg-orange-50 text-slate-800 border-orange-300'
                    }`}
                    title="Account Profile & Settings"
                  >
                    <UserIcon size={15} className="text-orange-500 shrink-0" />
                    <span className="font-bold text-[11px] sm:text-xs max-w-[85px] sm:max-w-[120px] truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-56 border rounded-2xl shadow-2xl p-3 z-50 text-left space-y-2 ${
                      theme === 'dark' ? 'bg-[#2a221f] border-[#3f332c] text-[#fef3c7]' : 'bg-white border-orange-200 text-stone-900'
                    }`}>
                      <div className={`px-2 py-1.5 border-b ${theme === 'dark' ? 'border-[#3f332c]' : 'border-orange-100'}`}>
                        <p className="text-xs font-black text-orange-100 truncate">{user.name || 'Learner'}</p>
                        <p className="text-[10px] text-orange-200/50 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setView('settings');
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-bold text-orange-200/80 hover:text-white hover:bg-[#3f332c] rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <UserIcon size={14} />
                        <span>Account Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setView('auth');
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-bold text-orange-400 hover:text-orange-300 hover:bg-[#3f332c] rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <LogIn size={14} />
                        <span>Switch Account / Sign In</span>
                      </button>
                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await signOutUser();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
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
                  className="h-9 sm:h-10 px-2.5 sm:px-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                  title="Sign In / Log In"
                >
                  <UserIcon size={14} className="shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black whitespace-nowrap">
                    <span className="sm:hidden">Sign In</span>
                    <span className="hidden sm:inline">Sign In / Log In</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Symmetric 2-Column Action Bar (< 640px) */}
          <div className="grid grid-cols-2 gap-2 pt-2 sm:hidden">
            <button
              onClick={toggleFocusShield}
              className={`h-9 w-full px-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 border cursor-pointer ${
                isFocusShieldActive
                  ? theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                  : theme === 'dark'
                    ? 'bg-[#1a1614] text-orange-200 border-[#3f332c]'
                    : 'bg-white text-slate-800 border-orange-300'
              }`}
            >
              <BellOff size={13} className={isFocusShieldActive ? 'text-emerald-500 shrink-0' : 'text-orange-500 shrink-0'} />
              <span className="truncate">{isFocusShieldActive ? 'Shield: Active' : 'Shield: Off'}</span>
            </button>

            <button
              onClick={() => {
                distractionShield.enterFullscreenImmersion();
                startStudyNow('Active Focus Study', 25);
              }}
              className="h-9 w-full px-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-[11px] font-black shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Play size={12} className="fill-current shrink-0" />
              <span className="truncate">Study Now</span>
            </button>
          </div>

          {/* Symmetric Quick-Navigation Strip for Mobile & Tablet View Modes (lg:hidden) */}
          <nav
            aria-label="Quick Mobile and Tablet Navigation"
            className={`grid grid-cols-6 gap-1 sm:gap-2 pt-2 mt-2 border-t lg:hidden ${
              theme === 'dark' ? 'border-[#3f332c]' : 'border-orange-200/80'
            }`}
          >
            {[
              { id: 'dashboard', label: 'Home', icon: Home },
              { id: 'planner', label: 'Schedule', icon: CalendarIcon },
              { id: 'flashcards', label: 'Cards', icon: BookOpen },
              { id: 'library', label: 'Library', icon: Book },
              { id: 'exam-mode', label: 'Exams', icon: Target },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`h-8 sm:h-9 px-1 sm:px-2.5 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border ${
                    isActive
                      ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                      : theme === 'dark'
                        ? 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-200 border-[#3f332c]'
                        : 'bg-white hover:bg-orange-50 text-stone-800 border-orange-200'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-white shrink-0' : 'text-orange-500 shrink-0'} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`h-8 sm:h-9 px-1 sm:px-2.5 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border ${
                theme === 'dark'
                  ? 'bg-[#1a1614] hover:bg-[#3f332c] text-amber-300 border-[#3f332c]'
                  : 'bg-orange-50 hover:bg-orange-100 text-stone-900 border-orange-300'
              }`}
            >
              <LayoutGrid size={13} className="text-orange-500 shrink-0" />
              <span className="truncate">All Tools</span>
            </button>
          </nav>
        </header>

        {/* DISTRACTION-FREE SHIELD MODAL */}
        <AnimatePresence>
          {showShieldModal && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
              onClick={() => setShowShieldModal(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#2a221f] border border-[#3f332c] rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-[#3f332c] pb-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Shield size={20} />
                    <h3 className="font-black text-lg text-orange-100 uppercase tracking-tight">
                      Distraction-Free Immersion Shield
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowShieldModal(false)}
                    className="p-1.5 bg-[#1a1614] rounded-xl text-orange-200/60 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <p className="text-xs text-orange-100/90 leading-relaxed font-medium">
                  When you are using Memory Shaastra, the <strong>Distraction-Free Immersion Shield</strong> suppresses all interruptions so you can focus deeply:
                </p>

                <div className="space-y-2.5 text-xs text-orange-200/80">
                  <div className="flex items-start gap-2.5 bg-[#1a1614] p-3 rounded-2xl border border-[#3f332c]">
                    <BellOff size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Outside Notifications Blocked While Using:</strong> Notifications and heads-up banners from other apps and websites are suppressed while you are inside the app. They are delivered only after you exit the app.</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-[#1a1614] p-3 rounded-2xl border border-[#3f332c]">
                    <Lock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Fullscreen Immersion:</strong> Hides device taskbars, browser chrome, and status bars so no distracting icons or popups catch your eye.</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-[#1a1614] p-3 rounded-2xl border border-[#3f332c]">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Screen Wake Lock:</strong> Prevents your device display from going to sleep or triggering lock-screen notifications while reading cards or solving boost puzzles.</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleFocusShield();
                    setShowShieldModal(false);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield size={16} />
                  <span>{isFocusShieldActive ? 'Re-engage Immersion & Fullscreen' : 'Engage Distraction-Free Immersion'}</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === 'auth' ? 'dashboard' : currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[calc(100vh-68px)] w-full max-w-full overflow-x-hidden"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>

        {/* AUTH POPUP WINDOW OVERLAY */}
        <AnimatePresence>
          {currentView === 'auth' && <Auth />}
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

