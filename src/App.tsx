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
import SelfTestFacility from './components/SelfTestFacility';
import PromptFormatterFacility from './components/PromptFormatterFacility';
import StudySessionLogs from './components/StudySessionLogs';
import MemoryDna from './components/MemoryDna';
import StudyWellbeingCoach from './components/StudyWellbeingCoach';
import StudyBubble from './components/StudyBubble';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Menu, Sparkles, LogOut, LogIn, User as UserIcon, Play, Shield, Brain, Info, CheckCircle2, X, BellOff, Lock, Home, Calendar as CalendarIcon, BookOpen, Book, Target, LayoutGrid, Coffee, Eye } from 'lucide-react';
import { t } from './utils/translations';
import { CalendarView } from './components/CalendarView';
import { distractionShield } from './utils/distractionShield';
import { BookmarksBar } from './components/BookmarksBar';
import { FACILITY_SHORTCUTS } from './utils/shortcuts';

function AppContent() {
  const { 
    currentView, 
    goBack, 
    setView, 
    theme, 
    user, 
    signOutUser, 
    startStudyNow,
    adaptiveStudyConfig,
    dismissAdaptiveIntervention
  } = useApp();
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

  const [shortcutToast, setShortcutToast] = React.useState<{ label: string; key: string } | null>(null);

  // Global Keyboard Shortcuts for All 21 Facilities
  React.useEffect(() => {
    // Keep window focused on interactions so shortcuts always receive keydown events
    const ensureFocus = () => {
      const activeEl = document.activeElement;
      if (!activeEl || activeEl === document.body) {
        window.focus();
      }
    };
    window.addEventListener('click', ensureFocus);
    window.addEventListener('pointerdown', ensureFocus);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if student is currently typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement || 
        target instanceof HTMLTextAreaElement || 
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      // Check for Alt combinations (supports Alt + Key, Alt + Shift + Key, and Ctrl + Alt + Key)
      if ((e.altKey || (e.ctrlKey && e.altKey)) && !e.metaKey) {
        const pressedKey = (e.key || '').toUpperCase();
        const pressedCode = e.code || '';

        const match = FACILITY_SHORTCUTS.find(s => {
          const letter = s.code.replace('Key', '').toUpperCase();
          return (
            s.code === pressedCode ||
            (pressedKey && pressedKey === letter) ||
            (pressedCode && s.code.toLowerCase() === pressedCode.toLowerCase())
          );
        });

        if (match) {
          e.preventDefault();
          e.stopPropagation();
          setView(match.id);
          setShortcutToast({ label: match.label, key: match.keyDisplay });
          setTimeout(() => setShortcutToast(null), 2500);
        }
      }
    };

    // Attach to both window and document with capture: true to guarantee intercept
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      window.removeEventListener('click', ensureFocus);
      window.removeEventListener('pointerdown', ensureFocus);
    };
  }, [setView]);

  // Render view router
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <HomeScreen />;
      case 'focus': return <StudyBubble />;
      case 'study-bubble': return <StudyBubble />;
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
      case 'self-test': return <SelfTestFacility />;
      case 'simplifier': return <PromptFormatterFacility />;
      case 'prompt-formatter': return <PromptFormatterFacility />;
      case 'memory-dna': return <MemoryDna />;
      case 'wellbeing': return <StudyWellbeingCoach />;
      case 'study-logs': return <StudySessionLogs />;
      case 'social-focus': return <Settings />;
      case 'adaptive-study': return <Settings />;
      default: return <HomeScreen />;
    }
  };

  const showBackButton = currentView !== 'dashboard';

  return (
    <div 
      style={{
        filter: adaptiveStudyConfig.isInterventionActive 
          ? 'grayscale(85%) contrast(90%) brightness(92%)' 
          : 'none',
        transition: 'filter 0.8s ease-in-out'
      }}
      className={`flex h-screen overflow-hidden font-sans relative transition-colors duration-300 w-full max-w-full ${
        theme === 'dark' ? 'bg-[#1a1614] text-[#fef3c7]' : 'bg-[#fffaf5] text-stone-900'
      }`}
    >
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
        {/* TOP RIBBON - SLEEK, COMPACT & NON-INTRUSIVE ACROSS ALL DEVICES */}
        <header className={`sticky top-0 z-30 px-2.5 sm:px-5 lg:px-6 py-1.5 sm:py-2 border-b shadow-sm max-w-full w-full transition-colors duration-200 select-none ${
          theme === 'dark' ? 'bg-[#2a221f]/95 backdrop-blur-md text-orange-100 border-[#3f332c]' : 'bg-[#fffaf5]/95 backdrop-blur-md text-slate-900 border-orange-200'
        }`}>
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 w-full">
            {/* Left Group: Menu + Back + Brand */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 sm:flex-initial">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-xl border flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer ${
                  theme === 'dark' ? 'bg-[#1a1614] text-orange-100 hover:bg-[#3f332c] border-[#3f332c]' : 'bg-white text-slate-800 hover:bg-orange-100 border-orange-300'
                }`}
                aria-label="Toggle Sidebar"
                title="Open Navigation Menu"
              >
                <Menu size={16} />
              </button>

              {showBackButton && (
                <button 
                  onClick={goBack}
                  className={`h-8 px-2 sm:h-9 sm:px-2.5 flex items-center justify-center gap-1 transition-colors font-bold uppercase tracking-wider text-[10px] sm:text-xs rounded-xl border shadow-sm active:scale-95 shrink-0 cursor-pointer ${
                    theme === 'dark' ? 'text-orange-200 hover:text-white bg-[#1a1614] hover:bg-[#3f332c] border-[#3f332c]' : 'text-slate-800 hover:text-slate-950 bg-white hover:bg-orange-50 border-orange-300'
                  }`}
                  title="Go Back"
                >
                  <ArrowLeft size={13} className="shrink-0" />
                  <span className="hidden sm:inline">{t.back}</span>
                </button>
              )}

              {/* Title Button in Top Ribbon leading to Home */}
              <button
                onClick={() => setView('dashboard')}
                className={`h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-start gap-1.5 rounded-xl border transition-all active:scale-95 group shadow-sm cursor-pointer min-w-0 ${
                  theme === 'dark' ? 'bg-[#1a1614] hover:bg-[#3f332c] border-[#3f332c] text-orange-100' : 'bg-orange-100/90 hover:bg-orange-200/80 border-orange-300 text-slate-900'
                }`}
              >
                <Logo size={16} className="group-hover:scale-110 transition-transform shrink-0" />
                <span className={`font-black text-xs sm:text-sm tracking-tight transition-colors truncate ${
                  theme === 'dark' ? 'text-orange-100 group-hover:text-orange-400' : 'text-slate-900 group-hover:text-orange-700'
                }`}>
                  Memory Shaastra
                </span>
              </button>
            </div>

            {/* Right Group: Shield + Study Now + Account */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative">
              {/* Distraction Shield Toggle */}
              <button
                onClick={toggleFocusShield}
                className={`h-8 sm:h-9 px-2 sm:px-2.5 lg:px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0 border cursor-pointer relative ${
                  isFocusShieldActive
                    ? theme === 'dark'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                    : theme === 'dark'
                      ? 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-200 border-[#3f332c]'
                      : 'bg-white hover:bg-orange-50 text-slate-800 border-orange-300'
                }`}
                title="Distraction-Free Immersion Shield: Outside notifications are suppressed while using the app."
              >
                <BellOff size={13} className={isFocusShieldActive ? 'text-emerald-500 shrink-0' : 'text-orange-500 shrink-0'} />
                {isFocusShieldActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 sm:hidden" />
                )}
                <span className="text-xs font-black whitespace-nowrap hidden sm:inline md:hidden">
                  {isFocusShieldActive ? 'Shield' : 'Shield Off'}
                </span>
                <span className="text-xs font-black whitespace-nowrap hidden md:inline">
                  {isFocusShieldActive ? 'Shield: Active' : 'Shield: Off'}
                </span>
              </button>

              {/* Study Now 1-Tap Button */}
              <button
                onClick={() => {
                  distractionShield.enterFullscreenImmersion();
                  startStudyNow('Active Focus Study', 25);
                }}
                className="h-8 sm:h-9 px-2 sm:px-3 lg:px-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title="Start Study Now Focus Sprint"
              >
                <Play size={12} className="fill-current shrink-0" />
                <span className="text-xs font-black whitespace-nowrap hidden sm:inline">Study Now</span>
                <span className="text-[11px] font-black whitespace-nowrap sm:hidden">Study</span>
              </button>

              {/* Sign In / Account Button */}
              {user && user.id !== 'guest' && user.email !== 'guest@maanas.com' ? (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                    className={`h-8 sm:h-9 px-2 sm:px-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer ${
                      theme === 'dark' ? 'bg-[#1a1614] hover:bg-[#3f332c] text-orange-100 border-[#3f332c]' : 'bg-white hover:bg-orange-50 text-slate-800 border-orange-300'
                    }`}
                    title="Account Profile & Settings"
                  >
                    <UserIcon size={14} className="text-orange-500 shrink-0" />
                    <span className="font-bold text-[11px] sm:text-xs max-w-[70px] sm:max-w-[110px] truncate hidden xs:inline">
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
                  className="h-8 sm:h-9 px-2 sm:px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 active:scale-95 shrink-0 cursor-pointer"
                  title="Sign In / Log In"
                >
                  <UserIcon size={13} className="shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black whitespace-nowrap">
                    <span className="hidden sm:inline">Sign In</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Global Shortcut Trigger Toast Confirmation */}
        <AnimatePresence>
          {shortcutToast && (
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.95 }}
              className="fixed top-3 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-black text-xs shadow-2xl flex items-center gap-2 pointer-events-none border border-white/30 backdrop-blur-md"
            >
              <span className="text-sm">⚡</span>
              <span>Opened <strong>{shortcutToast.label}</strong></span>
              <span className="bg-black/30 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border border-white/20">
                {shortcutToast.key}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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
            className="min-h-[calc(100vh-68px)] w-full max-w-full overflow-x-hidden flex flex-col justify-between"
          >
            {/* Top Bookmarks Bar (Available Across Every Facility) */}
            <BookmarksBar position="top" />

            {/* Facility View Content */}
            <div className="flex-1 w-full max-w-full">
              {renderView()}
            </div>

            {/* Bottom Bookmarks Bar (Available Across Every Facility) */}
            <BookmarksBar position="bottom" />
          </motion.div>
        </AnimatePresence>

        {/* AUTH POPUP WINDOW OVERLAY */}
        <AnimatePresence>
          {currentView === 'auth' && <Auth />}
        </AnimatePresence>

        {/* ADAPTIVE STUDY MODE - GENTLE 5-MINUTE BREAK INTERVENTION POPUP */}
        <AnimatePresence>
          {adaptiveStudyConfig.isInterventionActive && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
                  theme === 'dark' ? 'bg-[#241c19] border-[#4a3a32] text-[#fef3c7]' : 'bg-white border-orange-200 text-stone-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Coffee size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                        Adaptive Study Mode • Screen Balance
                      </span>
                      <h3 className="text-lg font-black tracking-tight">Time for a Mindful Break</h3>
                    </div>
                  </div>
                  <button
                    onClick={dismissAdaptiveIntervention}
                    className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 dark:text-stone-400 cursor-pointer"
                    title="Dismiss Break"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <p className="leading-relaxed opacity-90">
                    You have been studying continuously for <strong>{adaptiveStudyConfig.thresholdHours} hours</strong>. Research shows memory consolidation peaks when study sessions are followed by short rest intervals.
                  </p>

                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    theme === 'dark' ? 'bg-[#181311] border-[#362923]' : 'bg-amber-50/70 border-amber-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="flex items-center gap-1.5 text-amber-500">
                        <Eye size={14} /> 5-Minute Interface Calming Mode
                      </span>
                      <span className="font-mono text-sm">
                        {Math.floor(adaptiveStudyConfig.interventionSecondsRemaining / 60)}:
                        {(adaptiveStudyConfig.interventionSecondsRemaining % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      Memory Shaastra has temporarily switched to calming grayscale and modest dimming to rest your visual cortex. The interface will restore automatically in 5 minutes without disrupting your study timer.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/15 flex items-center gap-2">
                      <Eye size={14} className="shrink-0" />
                      <span>20-20-20 eye gaze rest</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 flex items-center gap-2">
                      <Coffee size={14} className="shrink-0" />
                      <span>Hydrate & stretch posture</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-500 dark:text-orange-200/50 italic leading-snug">
                    * Note: This intervention operates within Memory Shaastra to promote balanced screen habits. A web app cannot modify your device's system-level display settings.
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2.5">
                  <button
                    onClick={dismissAdaptiveIntervention}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Restore Normal Appearance
                  </button>
                  <button
                    onClick={() => {
                      dismissAdaptiveIntervention();
                      setView('settings');
                    }}
                    className="py-3 px-4 rounded-2xl border text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Settings
                  </button>
                </div>
              </motion.div>
            </div>
          )}
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

