import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';
import { 
  Bookmark, 
  BookmarkPlus, 
  X, 
  Trash2, 
  Calendar, 
  Home, 
  BookOpen, 
  Heart, 
  Book, 
  Target, 
  Timer, 
  Brain, 
  Layers, 
  Type, 
  Link as LinkIcon, 
  BookMarked, 
  Lightbulb, 
  Clock, 
  Shield, 
  Activity, 
  Sparkles,
  Check,
  Search,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'memoryshaastra_bookmarked_facilities';
const DEFAULT_BOOKMARKS = ['calendar', 'palace', 'flashcards', 'rescue-queue', 'library'];

export interface FacilityMeta {
  id: AppView;
  label: string;
  shortLabel: string;
  icon: any;
  category: 'Core' | 'Tools' | 'Support';
  desc: string;
}

export const ALL_APP_FACILITIES: FacilityMeta[] = [
  // Core
  { id: 'dashboard', label: 'Home Dashboard', shortLabel: 'Home', icon: Home, category: 'Core', desc: 'Main learning hub & priority actions' },
  { id: 'study-bubble', label: 'Study Bubble', shortLabel: 'Study Bubble', icon: Target, category: 'Core', desc: 'Distraction-free focus workspace' },
  { id: 'focus', label: 'Study Timer', shortLabel: 'Study Timer', icon: Timer, category: 'Core', desc: 'Sprint timer & Monk Mode' },
  { id: 'rescue-queue', label: 'Active recall', shortLabel: 'Active recall', icon: Heart, category: 'Core', desc: 'Targeted retrieval on vulnerable cards' },
  { id: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: Calendar, category: 'Core', desc: 'Schedule and revision milestones' },
  { id: 'exam-mode', label: 'Exam Planning', shortLabel: 'Exam Plan', icon: Target, category: 'Core', desc: 'Target exam countdown & syllabus track' },
  { id: 'library', label: 'Personal library', shortLabel: 'Personal library', icon: Book, category: 'Core', desc: 'Searchable notes & study materials' },
  { id: 'planner', label: 'Study Schedule', shortLabel: 'Study Schedule', icon: Layers, category: 'Core', desc: 'Daily task planner & syllabus goals' },
  { id: 'memory-boost', label: 'Daily Boost', shortLabel: 'Daily Boost', icon: Brain, category: 'Core', desc: '2048, ZIP & Inner Blaze' },

  // Tools
  { id: 'flashcards', label: 'Flashcards', shortLabel: 'Flashcards', icon: BookOpen, category: 'Tools', desc: 'Spaced repetition flashcard decks' },
  { id: 'palace', label: "Memory palace (Sherlock Holmes' technique)", shortLabel: 'Memory palace', icon: Home, category: 'Tools', desc: 'Spatial loci journey method' },
  { id: 'linking', label: 'Linking Method', shortLabel: 'Linking Method', icon: LinkIcon, category: 'Tools', desc: 'Chain facts with mental associations' },
  { id: 'story', label: 'Story Method', shortLabel: 'Story Method', icon: BookMarked, category: 'Tools', desc: 'Narrative storytelling memorisation' },
  { id: 'first-letter', label: 'First Letter Method', shortLabel: 'First Letter', icon: Type, category: 'Tools', desc: 'Acrostics & initialism memory aids' },
  { id: 'mnemonics', label: 'Mnemonics Generator', shortLabel: 'Mnemonics', icon: Type, category: 'Tools', desc: 'Vivid acronyms & memory rhymes' },
  { id: 'scheduler', label: 'Revision Hall', shortLabel: 'Revision Hall', icon: Layers, category: 'Tools', desc: 'Spaced repetition review intervals' },

  // Support
  { id: 'self-test', label: 'Self-Test Facility', shortLabel: 'Self-Test', icon: Target, category: 'Support', desc: 'Ungraded self-recall practice tests' },
  { id: 'simplifier', label: 'Prompt Formatter', shortLabel: 'Prompt Formatter', icon: Lightbulb, category: 'Support', desc: 'Feynman & Socratic pedagogical prompt generator' },
  { id: 'study-logs', label: 'Study Session Logs', shortLabel: 'Study Logs', icon: Clock, category: 'Support', desc: 'Time tracking, logs & progress export' },
  { id: 'adaptive-study', label: 'Adaptive Study Balance', shortLabel: 'Adaptive Study', icon: Shield, category: 'Support', desc: 'Break pacing & screen time balance' },
  { id: 'memory-dna', label: 'Memory DNA', shortLabel: 'Memory DNA', icon: Activity, category: 'Support', desc: 'Cognitive strengths & next actions' },
  { id: 'wellbeing', label: 'Wellbeing Coach', shortLabel: 'Wellbeing', icon: Sparkles, category: 'Support', desc: 'Hydration, rest & study wellness' },
];

export function BookmarksBar({ position = 'top' }: { position?: 'top' | 'bottom' }) {
  const { currentView, setView, theme } = useApp();
  const isLight = theme === 'light';

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_BOOKMARKS;
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  // Sync state across instances (e.g. top and bottom bars)
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setBookmarkedIds(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('ms_bookmarks_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ms_bookmarks_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const saveBookmarks = (newList: string[]) => {
    setBookmarkedIds(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch {}
    window.dispatchEvent(new CustomEvent('ms_bookmarks_changed'));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = bookmarkedIds.filter(b => b !== id);
    saveBookmarks(filtered);
  };

  const handleToggle = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      saveBookmarks(bookmarkedIds.filter(b => b !== id));
    } else {
      saveBookmarks([...bookmarkedIds, id]);
    }
  };

  const renderBookmarkButton = (id: string) => {
    const fac = ALL_APP_FACILITIES.find(f => f.id === id);
    if (!fac) return null;
    const Icon = fac.icon;
    const isActive = currentView === fac.id;

    return (
      <div key={id} className="relative group inline-flex shrink-0">
        <button
          onClick={() => setView(fac.id)}
          className={`px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap ${
            isActive
              ? 'bg-orange-600 text-white border-orange-500 font-black shadow-md'
              : isLight
              ? 'bg-white hover:bg-orange-100/70 text-stone-800 border-orange-200 hover:border-orange-300'
              : 'bg-[#281f1b] hover:bg-[#392b26] text-orange-100 border-[#3f312a] hover:border-orange-500/40'
          }`}
          title={`Open ${fac.label}`}
        >
          <Icon size={12} className={isActive ? 'text-white' : 'text-orange-500'} />
          <span>{fac.shortLabel}</span>
        </button>

        {/* Delete button (visible on hover or in delete mode) */}
        <button
          onClick={(e) => handleDelete(e, fac.id)}
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] shadow transition-opacity cursor-pointer ${
            isDeleteMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title={`Remove ${fac.shortLabel}`}
          aria-label={`Remove ${fac.shortLabel}`}
        >
          <X size={9} strokeWidth={3} />
        </button>
      </div>
    );
  };

  return (
    <>
      <div 
        className={`w-full px-2.5 sm:px-6 py-2 transition-colors border-y select-none max-w-full overflow-hidden ${
          position === 'top' 
            ? isLight ? 'bg-orange-50/80 border-orange-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]' : 'bg-[#201815]/95 border-[#382a24]'
            : isLight ? 'bg-orange-50/80 border-orange-200/90 mt-4' : 'bg-[#1e1715]/95 border-[#382a24] mt-6'
        }`}
        aria-label={`${position} Bookmarks Navigation`}
      >
        <div className="max-w-6xl mx-auto w-full">
          {/* MOBILE VIEW (< sm): Clean 2-tier layout that CANNOT overlap */}
          <div className="flex flex-col gap-1.5 sm:hidden w-full">
            {/* Tier 1: Bookmarks Label & Action Controls */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-400 font-black text-[11px] uppercase tracking-wider shadow-sm shrink-0">
                <Bookmark size={12} className="fill-current shrink-0" />
                <span>Bookmarks</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsCustomizeOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
                  title="Customise bookmarks for any app facility"
                >
                  <BookmarkPlus size={11} />
                  <span>Customise</span>
                </button>

                {bookmarkedIds.length > 0 && (
                  <button
                    onClick={() => setIsDeleteMode(prev => !prev)}
                    className={`p-1 rounded-xl border text-xs transition-all cursor-pointer shrink-0 ${
                      isDeleteMode 
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm' 
                        : isLight ? 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200' : 'bg-[#281f1b] text-orange-200 border-[#3f312a]'
                    }`}
                    title={isDeleteMode ? 'Finish deleting' : 'Toggle delete mode for bookmarks'}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Tier 2: Bookmarks Buttons lined up horizontally across full container width */}
            <div className="flex flex-wrap items-center gap-1.5 w-full pt-0.5">
              {bookmarkedIds.map(id => renderBookmarkButton(id))}
            </div>
          </div>

          {/* DESKTOP & TABLET VIEW (sm+): Seamless single horizontal row */}
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-2 w-full">
            {/* Permanent Bookmarks Ribbon Label */}
            <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-400 font-black text-xs uppercase tracking-wider shadow-sm">
              <Bookmark size={13} className="fill-current shrink-0" />
              <span>Bookmarks</span>
            </div>

            {/* Bookmarks List - Clean flex-wrap with ZERO side scrolling */}
            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 justify-center">
              {bookmarkedIds.map(id => renderBookmarkButton(id))}
            </div>

            {/* Right Controls: Customise & Delete Mode */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsCustomizeOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
                title="Customise bookmarks for any app facility"
              >
                <BookmarkPlus size={12} />
                <span>Customise</span>
              </button>

              {bookmarkedIds.length > 0 && (
                <button
                  onClick={() => setIsDeleteMode(prev => !prev)}
                  className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer shrink-0 ${
                    isDeleteMode 
                      ? 'bg-rose-600 text-white border-rose-500 shadow-sm' 
                      : isLight ? 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200' : 'bg-[#281f1b] text-orange-200 border-[#3f312a]'
                  }`}
                  title={isDeleteMode ? 'Finish deleting' : 'Toggle delete mode for bookmarks'}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMIZE BOOKMARKS MODAL */}
      <AnimatePresence>
        {isCustomizeOpen && (
          <div 
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsCustomizeOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className={`max-w-xl w-full rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col ${
                isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#241c19] border-[#3f332c] text-orange-100'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
                <div className="flex items-center gap-2">
                  <Bookmark className="text-orange-500" size={18} />
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight">Customise Bookmarks</h3>
                    <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-orange-200/60'}`}>
                      Select which facilities appear at the top and bottom of every screen ({bookmarkedIds.length} active)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomizeOpen(false)}
                  className={`p-1.5 rounded-xl border cursor-pointer ${
                    isLight ? 'hover:bg-stone-100 border-stone-200' : 'hover:bg-white/10 border-white/10'
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  placeholder="Search all 21 facilities..."
                  className={`w-full text-xs py-2 pl-8 pr-4 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLight ? 'bg-orange-50/60 border-orange-200 text-stone-900' : 'bg-[#161210] border-[#3f332c] text-white'
                  }`}
                />
              </div>

              {/* Facilities List categorized by Core, Tools, Support */}
              <div className="overflow-y-auto space-y-4 pr-1 flex-1">
                {(['Core', 'Tools', 'Support'] as const).map(category => {
                  const items = ALL_APP_FACILITIES.filter(f => 
                    f.category === category &&
                    (modalSearch === '' || f.label.toLowerCase().includes(modalSearch.toLowerCase()) || f.desc.toLowerCase().includes(modalSearch.toLowerCase()))
                  );

                  if (items.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block">
                        {category === 'Core' ? 'Core Facilities' : category === 'Tools' ? 'Memory Tools' : 'Support Facilities'}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map(fac => {
                          const Icon = fac.icon;
                          const isBookmarked = bookmarkedIds.includes(fac.id);

                          return (
                            <button
                              key={fac.id}
                              type="button"
                              onClick={() => handleToggle(fac.id)}
                              className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                isBookmarked
                                  ? 'bg-orange-500/15 border-orange-400 text-orange-950 dark:text-orange-200 font-bold'
                                  : isLight
                                  ? 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                                  : 'bg-[#1a1614] hover:bg-[#2e231f] border-[#382b25] text-stone-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon size={14} className={isBookmarked ? 'text-orange-500 shrink-0' : 'text-stone-400 shrink-0'} />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">{fac.label}</p>
                                  <p className="text-[10px] opacity-70 truncate">{fac.desc}</p>
                                </div>
                              </div>

                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                                isBookmarked
                                  ? 'bg-orange-600 border-orange-500 text-white'
                                  : 'border-stone-400/40'
                              }`}>
                                {isBookmarked && <Check size={12} strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-orange-500/20 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => saveBookmarks(DEFAULT_BOOKMARKS)}
                  className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Reset to Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                >
                  Done ({bookmarkedIds.length} Saved)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
