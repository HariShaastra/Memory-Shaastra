/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Menu } from 'lucide-react';
import { t } from './utils/translations';

function AppContent() {
  const { currentView, goBack } = useApp();
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
      case 'scheduler': return <RevisionScheduler />;
      case 'memory-boost': return <MemoryBoost />;
      case 'planner': return <StudyPlanner />;
      case 'exam-mode': return <ExamMode />;
      case 'settings': return <Settings />;
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
        <div className="sticky top-0 z-20 p-4 bg-[#1a1614]/80 backdrop-blur-md flex items-center justify-between border-b border-[#3f332c]/30">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-orange-400 hover:bg-white/5 rounded-full border border-white/5"
            >
              <Menu size={20} />
            </button>
            {showBackButton && (
              <button 
                onClick={goBack}
                className="flex items-center space-x-2 text-orange-400/70 hover:text-orange-300 transition-colors font-bold uppercase tracking-widest text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/5"
              >
                <ArrowLeft size={16} />
                <span>{t.back}</span>
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
            className="min-h-[calc(100vh-64px)] w-full"
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
