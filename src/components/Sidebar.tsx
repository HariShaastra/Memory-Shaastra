import React from 'react';
import { useApp } from '../context/AppContext';
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
  X
} from 'lucide-react';
import { AppView } from '../types';
import { t } from '../utils/translations';

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
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
        isActive 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-medium' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      <Icon size={20} />
      <span className="text-sm">{item.label}</span>
    </button>
  );
};

export default function Sidebar() {
  const { currentView, setView, setUser, user, isSidebarOpen, setIsSidebarOpen } = useApp();

  const mainItems = [
    { id: 'dashboard', label: t.home, icon: LayoutDashboard },
    { id: 'planner', label: t.planner, icon: Calendar },
    { id: 'focus', label: t.focus, icon: Timer },
    { id: 'flashcards', label: t.flashcards, icon: BookOpen },
    { id: 'scheduler', label: t.scheduler, icon: Calendar },
    { id: 'exam-mode', label: t.examMode, icon: Target },
    { id: 'icebreaker', label: t.icebreaker, icon: Gamepad2 },
  ];

  const toolItems = [
    { id: 'mnemonics', label: t.mnemonics, icon: Quote },
    { id: 'palace', label: t.palace, icon: Home },
    { id: 'linking', label: t.linking, icon: Link },
    { id: 'first-letter', label: t.firstLetter, icon: Type },
  ];

  const bottomItems = [
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col border-r border-zinc-200 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="relative group cursor-pointer" onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}>
            <h1 className="text-2xl font-black tracking-tighter italic serif bg-gradient-to-br from-emerald-500 to-teal-700 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform duration-300">
              MEMORY SHAASTRA
            </h1>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto pb-8 scrollbar-hide">
          <div>
            <p className="px-4 text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-4 opacity-50">Main</p>
            <div className="space-y-1">
              {mainItems.map(item => <NavItem key={item.id} item={item} id={item.id} currentView={currentView} setView={setView} onClose={() => setIsSidebarOpen(false)} />)}
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-4 opacity-50">Memory Tools</p>
            <div className="space-y-1">
              {toolItems.map(item => <NavItem key={item.id} item={item} id={item.id} currentView={currentView} setView={setView} onClose={() => setIsSidebarOpen(false)} />)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 space-y-1">
          {bottomItems.map(item => <NavItem key={item.id} item={item} id={item.id} currentView={currentView} setView={setView} onClose={() => setIsSidebarOpen(false)} />)}
          {user ? (
            <button 
              onClick={() => { setUser(null); setIsSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span className="text-sm">{t.logout}</span>
            </button>
          ) : (
            <button 
              onClick={() => { setView('auth'); setIsSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 transition-all"
            >
              <LogIn size={20} />
              <span className="text-sm">{t.signIn}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
