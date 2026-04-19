import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';
import { t } from '../utils/translations';
import { 
  LayoutDashboard, 
  Timer, 
  BookOpen, 
  Calendar, 
  Gamepad2, 
  Settings,
  PenTool,
  Map,
  Link as LinkIcon,
  Type,
  LogOut,
  LogIn,
  Quote,
  Home,
  Link,
  Target,
  Zap,
  Book,
  X
} from 'lucide-react';
import { Logo } from './Logo';

interface NavItemProps {
  key?: string | number;
  item: any;
  id: string;
  currentView: AppView;
  setView: (view: AppView) => void;
  onClose?: () => void;
}

const NavItem = ({ item, id, currentView, setView, onClose }: NavItemProps) => {
  const Icon = item.icon;
  const isActive = currentView === id;
  return (
    <button
      onClick={() => {
        setView(id as AppView);
        if (onClose) onClose();
      }}
      className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
        isActive 
          ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20 shadow-[0_0_20px_rgba(234,88,12,0.1)]' 
          : 'text-orange-100/60 hover:text-orange-100 hover:bg-[#2a221f]'
      }`}
    >
      {isActive && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-1.5 w-1 h-6 bg-orange-600 rounded-full"
        />
      )}
      <Icon size={18} className={`transition-transform duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]' : 'group-hover:scale-110'}`} />
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${isActive ? 'opacity-100' : 'opacity-100'}`}>{item.label}</span>
      
      {isActive && (
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
      )}
    </button>
  );
};

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { currentView, setView, setUser, user } = useApp();

  const mainItems = [
    { id: 'dashboard', label: t.home, icon: Home },
    { id: 'planner', label: t.planner, icon: Calendar },
    { id: 'focus', label: t.focus, icon: Timer },
    { id: 'memory-boost', label: 'Boost', icon: Zap },
    { id: 'flashcards', label: t.flashcards, icon: BookOpen },
    { id: 'scheduler', label: t.scheduler, icon: Calendar },
    { id: 'exam-mode', label: t.examMode, icon: Target },
  ];

  const toolItems = [
    { id: 'mnemonics', label: t.mnemonics, icon: Quote },
    { id: 'palace', label: t.palace, icon: Home },
    { id: 'linking', label: t.linking, icon: LinkIcon },
    { id: 'story', label: t.story, icon: Book },
    { id: 'first-letter', label: t.firstLetter, icon: Type },
  ];

  const bottomItems = [
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#1a1614] border-r border-[#3f332c] flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden shadow-2xl">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setView('dashboard'); if (onClose) onClose(); }}>
          <Logo size={32} showText={true} />
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-orange-200 hover:bg-white/5 rounded-full">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto pb-8 scrollbar-hide">
        <div>
          <p className="px-4 text-[9px] uppercase font-black tracking-[0.2em] text-orange-300 opacity-90 mb-4 font-sans">Main</p>
          <div className="space-y-1">
            {mainItems.map(item => <NavItem key={item.id} item={item} id={item.id} currentView={currentView} setView={setView} onClose={onClose} />)}
          </div>
        </div>

        <div>
          <p className="px-4 text-[9px] uppercase tracking-[0.2em] text-orange-300 opacity-90 mb-4 font-sans">Skills</p>
          <div className="space-y-1">
            {toolItems.map(item => <NavItem key={item.id} item={item} id={item.id} currentView={currentView} setView={setView} onClose={onClose} />)}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/5 space-y-1">
        {bottomItems.map(item => <NavItem key={item.id} item={item} id={item.id} currentView={currentView} setView={setView} onClose={onClose} />)}
        {user ? (
          <button 
            onClick={() => { setUser(null); if (onClose) onClose(); }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold"
          >
            <LogOut size={20} />
            <span className="text-sm">{t.logout}</span>
          </button>
        ) : (
          <button 
            onClick={() => { setView('auth'); if (onClose) onClose(); }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-orange-400 hover:bg-orange-500/10 transition-all font-bold"
          >
            <LogIn size={20} />
            <span className="text-sm">{t.signIn}</span>
          </button>
        )}
      </div>
    </div>
  );
}
