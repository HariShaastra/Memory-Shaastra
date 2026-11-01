import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';
import { t } from '../utils/translations';
import { 
  Timer, 
  BookOpen, 
  Calendar, 
  Settings,
  Type,
  LogOut,
  LogIn,
  Quote,
  Home,
  Link as LinkIcon,
  Target,
  Book,
  X,
  Heart,
  Brain,
  Shield,
  Activity,
  Sparkles,
  Clock
} from 'lucide-react';
import { Logo } from './Logo';
import { auth, signOut } from '../firebase';

interface NavItemProps {
  key?: string | number;
  item: any;
  id: string;
  currentView: AppView;
  setView: (view: AppView) => void;
  onClose?: () => void;
  isLight: boolean;
}

const NavItem = ({ item, id, currentView, setView, onClose, isLight }: NavItemProps) => {
  const Icon = item.icon;
  const isActive = currentView === id;
  return (
    <button
      onClick={() => {
        setView(id as AppView);
        if (onClose) onClose();
      }}
      className={`w-full flex items-center space-x-3 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden cursor-pointer ${
        isActive 
          ? isLight
            ? 'bg-orange-500/15 text-orange-800 border border-orange-300 shadow-sm font-black'
            : 'bg-orange-600/20 text-orange-400 border border-orange-500/30 shadow-[0_0_20px_rgba(234,88,12,0.15)] font-black'
          : isLight
            ? 'text-stone-700 hover:text-stone-950 hover:bg-orange-100/60'
            : 'text-orange-100/80 hover:text-white hover:bg-[#2a221f]'
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-1 w-1 h-5 bg-orange-600 rounded-full"
        />
      )}
      <Icon 
        size={17} 
        className={`transition-transform duration-300 shrink-0 ${
          isActive 
            ? 'scale-110 text-orange-600 dark:text-orange-400 drop-shadow-[0_0_6px_rgba(234,88,12,0.4)]' 
            : isLight ? 'text-stone-500 group-hover:text-stone-800' : 'text-orange-300/70 group-hover:scale-110'
        }`} 
      />
      <span className={`text-[11px] font-black uppercase tracking-[0.12em] italic truncate ${
        isActive 
          ? isLight ? 'text-orange-950 font-black' : 'text-orange-300 font-black' 
          : isLight ? 'text-stone-800' : 'text-orange-100/80'
      }`}>
        {item.label}
      </span>
      
      {isActive && (
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.8)] shrink-0" />
      )}
    </button>
  );
};

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { currentView, setView, setUser, user, theme } = useApp();
  const isLight = theme === 'light';

  const studyCategoryIds = ['dashboard', 'study-bubble', 'focus', 'rescue-queue', 'calendar', 'exam-mode', 'library', 'planner', 'memory-boost'];
  const techniqueCategoryIds = ['flashcards', 'mnemonics', 'palace', 'linking', 'story', 'first-letter'];
  const masteryCategoryIds = ['self-test', 'simplifier', 'study-logs', 'adaptive-study', 'memory-dna', 'wellbeing'];

  // Determine initial active category tab based on currentView
  const getCategoryForView = (view: string): 'study' | 'techniques' | 'mastery' => {
    if (techniqueCategoryIds.includes(view)) return 'techniques';
    if (masteryCategoryIds.includes(view)) return 'mastery';
    return 'study';
  };

  const [activeTab, setActiveTab] = React.useState<'study' | 'techniques' | 'mastery'>(() => getCategoryForView(currentView));

  // Sync activeTab if currentView changes externally
  React.useEffect(() => {
    setActiveTab(getCategoryForView(currentView));
  }, [currentView]);

  const studyItems = [
    { id: 'dashboard', label: t.home, icon: Home },
    { id: 'study-bubble', label: 'Study Bubble', icon: Target },
    { id: 'focus', label: 'Study Timer', icon: Timer },
    { id: 'rescue-queue', label: 'Active Recall', icon: Heart },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'exam-mode', label: 'Exam Planning', icon: Target },
    { id: 'library', label: 'Personal Library', icon: Book },
    { id: 'memory-boost', label: 'Daily Boost', icon: Brain },
  ];

  const techniqueItems = [
    { id: 'flashcards', label: t.flashcards, icon: BookOpen },
    { id: 'palace', label: t.palace, icon: Home },
    { id: 'linking', label: t.linking, icon: LinkIcon },
    { id: 'story', label: t.story, icon: Book },
    { id: 'first-letter', label: t.firstLetter, icon: Type },
    { id: 'mnemonics', label: t.mnemonics, icon: Quote },
  ];

  const masteryItems = [
    { id: 'self-test', label: 'Self-Test Facility', icon: Target },
    { id: 'simplifier', label: 'Prompt Formatter', icon: Type },
    { id: 'study-logs', label: 'Study Logs', icon: Clock },
    { id: 'adaptive-study', label: 'Adaptive Study', icon: Shield },
    { id: 'memory-dna', label: 'Memory DNA', icon: Activity },
    { id: 'wellbeing', label: 'Wellbeing Coach', icon: Sparkles },
  ];

  const displayedItems = activeTab === 'study' 
    ? studyItems 
    : activeTab === 'techniques' 
      ? techniqueItems 
      : masteryItems;

  return (
    <div className={`w-64 border-r flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden shadow-2xl select-none transition-colors duration-200 ${
      isLight ? 'bg-[#fffaf5] text-stone-900 border-orange-200' : 'bg-[#1a1614] text-orange-100 border-[#3f332c]'
    }`}>
      {/* Top Header - Compact & Clean */}
      <div className={`px-4 py-3.5 flex items-center justify-between border-b shrink-0 ${
        isLight ? 'border-orange-200 bg-orange-50/50' : 'border-[#3f332c] bg-[#1a1614]'
      }`}>
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => { setView('dashboard'); if (onClose) onClose(); }}
          title="Return to Home Dashboard"
        >
          <Logo size={26} showText={true} />
        </div>
        <button 
          onClick={onClose} 
          className={`lg:hidden p-1.5 rounded-xl cursor-pointer transition-colors ${
            isLight ? 'text-stone-600 hover:bg-orange-100/80' : 'text-orange-200 hover:bg-white/10'
          }`}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Non-Scrollable Category Switcher Bar */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className={`grid grid-cols-3 p-1 rounded-xl border text-[10px] font-black uppercase tracking-wider ${
          isLight ? 'bg-orange-100/70 border-orange-200' : 'bg-[#241c19] border-[#3f332c]'
        }`}>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'study'
                ? 'bg-orange-600 text-white shadow-sm font-black'
                : isLight ? 'text-stone-600 hover:text-stone-950 font-bold' : 'text-orange-200/70 hover:text-white'
            }`}
          >
            Core
          </button>
          <button
            onClick={() => setActiveTab('techniques')}
            className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'techniques'
                ? 'bg-orange-600 text-white shadow-sm font-black'
                : isLight ? 'text-stone-600 hover:text-stone-950 font-bold' : 'text-orange-200/70 hover:text-white'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('mastery')}
            className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'mastery'
                ? 'bg-orange-600 text-white shadow-sm font-black'
                : isLight ? 'text-stone-600 hover:text-stone-950 font-bold' : 'text-orange-200/70 hover:text-white'
            }`}
          >
            Support
          </button>
        </div>
      </div>
      
      {/* Main Navigation List - Clean, Compact & ZERO SCROLLING */}
      <div className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-hide flex flex-col justify-start">
        <div className="flex items-center justify-between px-2 py-0.5 mb-1">
          <span className={`text-[9px] uppercase font-black tracking-[0.2em] font-sans italic ${
            isLight ? 'text-orange-700' : 'text-orange-500'
          }`}>
            {activeTab === 'study' ? 'Core Facilities' : activeTab === 'techniques' ? 'Memory Tools' : 'Support Facilities'}
          </span>
          <span className={`text-[9px] font-bold ${
            isLight ? 'text-stone-500' : 'text-orange-200/50'
          }`}>
            {displayedItems.length} items
          </span>
        </div>

        <div className="space-y-0.5">
          {displayedItems.map(item => (
            <NavItem 
              key={item.id} 
              item={item} 
              id={item.id} 
              currentView={currentView} 
              setView={setView} 
              onClose={onClose} 
              isLight={isLight}
            />
          ))}
        </div>
      </div>

      {/* Bottom Bar: Settings & Sign In/Out - Cleanly themed */}
      <div className={`p-3 border-t space-y-1 shrink-0 ${
        isLight ? 'bg-orange-50/90 border-orange-200' : 'bg-[#201815] border-[#3f332c]'
      }`}>
        <NavItem 
          item={{ id: 'settings', label: t.settings, icon: Settings }} 
          id="settings" 
          currentView={currentView} 
          setView={setView} 
          onClose={onClose} 
          isLight={isLight}
        />
        {user && user.id !== 'guest' && user.email !== 'guest@maanas.com' ? (
          <button 
            onClick={async () => { 
              try {
                await signOut(auth);
              } catch (e) {
                console.warn('SignOut error:', e);
              }
              setUser(null); 
              if (onClose) onClose(); 
            }}
            className="w-full flex items-center space-x-3 px-3 sm:px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-bold cursor-pointer"
          >
            <LogOut size={16} />
            <span className="truncate">{t.logout}</span>
          </button>
        ) : (
          <button 
            onClick={() => { setView('auth'); if (onClose) onClose(); }}
            className={`w-full flex items-center space-x-3 px-3 sm:px-3.5 py-2 rounded-xl transition-all text-xs font-bold cursor-pointer ${
              isLight ? 'text-orange-800 hover:bg-orange-100/70 font-black' : 'text-orange-400 hover:bg-orange-500/10'
            }`}
          >
            <LogIn size={16} />
            <span className="truncate">{t.signIn}</span>
          </button>
        )}
      </div>
    </div>
  );
}
