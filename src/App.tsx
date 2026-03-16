/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import { HomeScreen } from './components/HomeScreen';
import FocusTimer from './components/FocusTimer';
import FlashcardDeck from './components/FlashcardDeck';
import { Icebreaker } from './components/Icebreaker';
import Auth from './components/Auth';
import Mnemonics from './components/Mnemonics';
import MemoryPalace from './components/MemoryPalace';
import LinkingMethod from './components/LinkingMethod';
import FirstLetterMethod from './components/FirstLetterMethod';
import RevisionScheduler from './components/RevisionScheduler';
import { StudyPlanner } from './components/StudyPlanner';
import Settings from './components/Settings';
import { ExamMode } from './components/ExamMode';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Menu } from 'lucide-react';
import { t } from './utils/translations';

function AppContent() {
  const { currentView, goBack, setIsSidebarOpen } = useApp();

  if (currentView === 'auth') return <Auth />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <HomeScreen />;
      case 'focus': return <FocusTimer />;
      case 'flashcards': return <FlashcardDeck />;
      case 'mnemonics': return <Mnemonics />;
      case 'palace': return <MemoryPalace />;
      case 'linking': return <LinkingMethod />;
      case 'first-letter': return <FirstLetterMethod />;
      case 'scheduler': return <RevisionScheduler />;
      case 'icebreaker': return <Icebreaker />;
      case 'planner': return <StudyPlanner />;
      case 'exam-mode': return <ExamMode />;
      case 'settings': return <Settings />;
      default: return <HomeScreen />;
    }
  };

  const showBackButton = currentView !== 'dashboard';

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white overflow-hidden font-sans transition-colors duration-500">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative">
        <div className="sticky top-0 z-20 p-4 bg-zinc-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl"
            >
              <Menu size={20} />
            </button>
            {showBackButton && (
              <button 
                onClick={goBack}
                className="flex items-center space-x-2 text-zinc-500 hover:text-emerald-500 transition-colors font-bold uppercase tracking-widest text-[10px]"
              >
                <ArrowLeft size={16} />
                <span>{t.back}</span>
              </button>
            )}
          </div>
          
          <div className="lg:hidden">
            <h1 className="text-sm font-black tracking-tighter italic serif bg-gradient-to-br from-emerald-500 to-teal-700 bg-clip-text text-transparent">
              MEMORY SHAASTRA
            </h1>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
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
