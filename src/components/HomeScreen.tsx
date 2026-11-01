import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Clock, 
  ChevronRight, 
  Brain, 
  Timer, 
  BookOpen, 
  Type, 
  Calendar as CalendarIcon, 
  Layers, 
  Award, 
  Search, 
  Grid, 
  Download,
  Link as LinkIcon,
  BookMarked,
  Play,
  ArrowRight,
  Sparkles,
  Heart,
  Bot,
  HelpCircle,
  Activity,
  CheckCircle2,
  CalendarDays,
  Lightbulb,
  Book,
  Shield,
  Home,
  LayoutGrid,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  Laptop,
  Pencil,
  SlidersHorizontal,
  Check,
  Bookmark,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  Plus
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { downloadProgressAsWordDoc } from '../utils/downloadProgressDocx';
import { AppView } from '../types';
import { ShortcutsTable } from './ShortcutsTable';

export const HomeScreen: React.FC = () => {
  const { 
    setView, 
    user, 
    studyTasks, 
    flashcards, 
    mnemonics, 
    memoryPalaces, 
    linkChains, 
    storyChains, 
    firstLetterEntries,
    scheduledRevisions,
    revisions,
    examPlans,
    personalization,
    overallProgress,
    theme,
    startStudyNow,
    lastActiveSession,
    saveLastActiveSession
  } = useAppContext();

  // Search state for shortcuts
  const [shortcutSearch, setShortcutSearch] = useState('');
  const [quickDuration, setQuickDuration] = useState<number>(25);
  const [quickMode, setQuickMode] = useState<'screen' | 'offline'>('screen');
  const [showAiGuide, setShowAiGuide] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [activeFacilityCategory, setActiveFacilityCategory] = useState<'all' | 'focus' | 'techniques' | 'mastery'>('all');

  // Facilities inline display & Session edit modal states
  const [isFacilitiesExpanded, setIsFacilitiesExpanded] = useState(false);
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(lastActiveSession?.subject || 'Economics');
  const [editTopic, setEditTopic] = useState(lastActiveSession?.topic || 'Monetary Policy & Inflation Rates');
  const [editDuration, setEditDuration] = useState(lastActiveSession?.durationMinutes || 25);
  const [editNextStep, setEditNextStep] = useState('Complete 25-minute sprint and solve active recall flashcards');

  // Default Bookmarks explicitly requested by user:
  // Calendar, Memory palace (Sherlock Holmes' technique), Flashcards, Active recall, personal library
  const DEFAULT_BOOKMARK_IDS: AppView[] = [
    'calendar',
    'palace',
    'flashcards',
    'rescue-queue',
    'library'
  ];

  // User-customizable bookmarks state persisted in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<AppView[]>(() => {
    try {
      const saved = localStorage.getItem('memoryshaastra_custom_bookmarks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as AppView[];
        }
      }
    } catch (e) {
      console.warn('Failed to parse bookmarks:', e);
    }
    return DEFAULT_BOOKMARK_IDS;
  });

  const [isCustomizeBookmarksOpen, setIsCustomizeBookmarksOpen] = useState(false);
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [isDeleteModeActive, setIsDeleteModeActive] = useState(false);

  const saveBookmarks = (newIds: AppView[]) => {
    setBookmarkedIds(newIds);
    try {
      localStorage.setItem('memoryshaastra_custom_bookmarks', JSON.stringify(newIds));
    } catch (e) {
      console.warn('Failed to save bookmarks:', e);
    }
  };

  const handleToggleBookmark = (id: AppView) => {
    if (bookmarkedIds.includes(id)) {
      saveBookmarks(bookmarkedIds.filter(b => b !== id));
    } else {
      saveBookmarks([...bookmarkedIds, id]);
    }
  };

  const handleDeleteBookmark = (e: React.MouseEvent, id: AppView) => {
    e.stopPropagation();
    saveBookmarks(bookmarkedIds.filter(b => b !== id));
  };

  const handleResetDefaultBookmarks = () => {
    saveBookmarks(DEFAULT_BOOKMARK_IDS);
  };

  const handleSaveSessionDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = editSubject.trim() || 'General Study';
    const cleanTop = editTopic.trim() || 'Focused Study Session';
    saveLastActiveSession({
      subject: cleanSub,
      topic: cleanTop,
      durationMinutes: editDuration
    });
    setQuickDuration(editDuration);
    setIsEditSessionModalOpen(false);
  };

  // Handle Download Word Document
  const handleDownloadDoc = async () => {
    await downloadProgressAsWordDoc({
      userName: user?.name || 'Student Learner',
      generatedDate: new Date().toLocaleDateString(),
      overallProgress,
      personalization,
      studyTasks: studyTasks.map(t => ({
        topic: t.topic,
        subject: t.subject,
        plannedDate: t.plannedDate,
        completed: t.completed
      })),
      flashcards: flashcards.map(f => ({
        question: f.question,
        answer: f.answer,
        difficulty: f.difficulty
      })),
      mnemonics: mnemonics.map(m => ({
        title: m.title,
        phrase: m.phrase
      })),
      memoryPalaces: memoryPalaces.map(p => ({
        name: p.name,
        locationCount: p.locations.length
      })),
      linkChains: linkChains.map(l => ({
        title: l.title,
        items: l.items
      })),
      storyChains: storyChains.map(s => ({
        title: s.title,
        story: s.story
      })),
      firstLetterEntries: firstLetterEntries.map(fl => ({
        title: fl.title,
        mnemonic: fl.mnemonic
      })),
      scheduledRevisions: scheduledRevisions.map(sr => ({
        itemTitle: sr.itemTitle,
        dueDate: sr.dueDate,
        intervalDays: sr.intervalDays,
        completed: sr.completed
      }))
    });
  };

  // Find nearest upcoming exam from Exam Planning (examPlans)
  const getNearestExamInfo = () => {
    if (!examPlans || examPlans.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plansWithDate = examPlans
      .filter(p => p.title && p.examDate && !isNaN(new Date(p.examDate).getTime()))
      .map(p => {
        const examTime = new Date(p.examDate).getTime();
        const diffDays = Math.ceil((examTime - today.getTime()) / (1000 * 60 * 60 * 24));
        return { plan: p, diffDays, examTime };
      });

    if (plansWithDate.length === 0) return null;

    const upcoming = plansWithDate.filter(e => e.diffDays >= 0);
    if (upcoming.length > 0) {
      upcoming.sort((a, b) => a.diffDays - b.diffDays);
      return upcoming[0];
    }

    plansWithDate.sort((a, b) => b.examTime - a.examTime);
    return plansWithDate[0];
  };

  const targetExamInfo = getNearestExamInfo();
  const targetExamTitle = targetExamInfo?.plan.title || (personalization.targetExamName && personalization.targetExamName.trim() !== '' ? personalization.targetExamName : null);
  const daysToGo = targetExamInfo ? Math.max(0, targetExamInfo.diffDays) : null;

  // Complete List of All App Facilities with Classifications, Big Boxes & One-Liner Explanations
  const studyFacilities = [
    {
      id: 'focus' as AppView,
      title: 'Study Timer',
      desc: 'Enter distraction-free focus sprints with customizable timer intervals and soundscapes.',
      icon: Timer,
      action: 'Launch Timer',
      badge: 'Focus Sprint',
      bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    },
    {
      id: 'planner' as AppView,
      title: 'Study Schedule',
      desc: 'Flexible topic planner to set dates, manage daily goals, and schedule focus sprints.',
      icon: CalendarIcon,
      action: 'Manage Schedule',
      badge: `${studyTasks.length} Tasks`,
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'scheduler' as AppView,
      title: 'Revision Hall',
      desc: 'Automated spaced recall cycles (1d, 3d, 7d, 14d, 30d) based on forgetting curves.',
      icon: Layers,
      action: 'Review Hall',
      badge: `${revisions.length} Cycles`,
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'calendar' as AppView,
      title: 'Calendar Timeline',
      desc: 'Visual monthly and weekly agenda tracking all upcoming exam deadlines and review sessions.',
      icon: CalendarDays,
      action: 'View Calendar',
      badge: 'Timeline',
      bgClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    },
    {
      id: 'exam-mode' as AppView,
      title: 'Exam Planning',
      desc: 'Comprehensive syllabus breakdown with phase targets and real-time subject completion rates.',
      icon: Target,
      action: 'Plan Syllabus',
      badge: targetExamTitle ? 'Exam Set' : 'Plan Now',
      bgClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    {
      id: 'rescue-queue' as AppView,
      title: 'Active Recall Queue',
      desc: 'Smart triage queue that spots fading concepts and prompts rapid retrieval before you forget.',
      icon: Heart,
      action: 'Practice Recall',
      badge: 'Urgent Recall',
      bgClass: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
  ];

  const techniqueFacilities = [
    {
      id: 'flashcards' as AppView,
      title: 'Flashcards',
      desc: 'Active recall spaced repetition cards using SM-2 algorithm with difficulty grading.',
      icon: BookOpen,
      action: 'Open Flashcards',
      badge: `${flashcards.length} Cards`,
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'mnemonics' as AppView,
      title: 'Mnemonics Vault',
      desc: 'Clever acronym phrases, peg words, and memory rhymes to lock in long academic lists.',
      icon: Type,
      action: 'View Mnemonics',
      badge: `${mnemonics.length} Phrases`,
      bgClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    {
      id: 'palace' as AppView,
      title: 'Memory Palace',
      desc: 'Ancient Method of Loci: anchor facts and concepts to specific rooms in your mental palace.',
      icon: Grid,
      action: 'Enter Palace',
      badge: `${memoryPalaces.length} Palaces`,
      bgClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    },
    {
      id: 'linking' as AppView,
      title: 'Link Method',
      desc: 'Chain sequential facts together through vivid, exaggerated, and hilarious mental imagery.',
      icon: LinkIcon,
      action: 'Link Concepts',
      badge: `${linkChains.length} Chains`,
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'story' as AppView,
      title: 'Story Method',
      desc: 'Transform dry textbook definitions into engaging, memorable narrative stories.',
      icon: BookMarked,
      action: 'Read Stories',
      badge: `${storyChains.length} Stories`,
      bgClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    },
    {
      id: 'first-letter' as AppView,
      title: 'First Letter Method',
      desc: 'Generate initialism memory aids and word abbreviations for instant exam bullet recall.',
      icon: Type,
      action: 'Create Aids',
      badge: `${firstLetterEntries.length} Aids`,
      bgClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    }
  ];

  const masteryFacilities = [
    {
      id: 'library' as AppView,
      title: 'Personal Library',
      desc: 'Searchable document repository for notes, textbook summaries, and reference attachments.',
      icon: Book,
      action: 'Open Vault',
      badge: 'Notes Vault',
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'self-test' as AppView,
      title: 'Self-Test Facility',
      desc: 'Practice test questions generated strictly from your cards & memory aids; reveal answers for self-assessment.',
      icon: Target,
      action: 'Take Practice Test',
      badge: 'Self-Recall',
      bgClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    },
    {
      id: 'simplifier' as AppView,
      title: 'Prompt & Study Formatter',
      desc: 'Generates structured pedagogical prompts for Feynman & Socratic methods, copied to launch in external tools with 1-click.',
      icon: Lightbulb,
      action: 'Format Notes',
      badge: 'Pedagogy Tool',
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'study-logs' as AppView,
      title: 'Study Session Logs',
      desc: 'Track exact time spent, stopwatch coverage, and completed study activities with 1-click clipboard copy and text export.',
      icon: Clock,
      action: 'View Study Logs',
      badge: 'Session Tracker',
      bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: 'adaptive-study' as AppView,
      title: 'Adaptive Study & Screen Balance',
      desc: 'Gentle 5-minute break interventions, active continuous study tracking, and screen balance under Settings.',
      icon: Shield,
      action: 'Configure Balance',
      badge: 'Screen Balance',
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'memory-dna' as AppView,
      title: 'Memory DNA',
      desc: 'Jargon-free summary of your activity, strengths, improvement areas, and guilt-free next action suggestions.',
      icon: Activity,
      action: 'View DNA Profile',
      badge: 'Cognitive Stats',
      bgClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      id: 'wellbeing' as AppView,
      title: 'Wellbeing Coach',
      desc: 'Evidence-based study breaks, hydration habits, rest pacing, and exam stress reduction.',
      icon: Sparkles,
      action: 'Coach Check-in',
      badge: 'Habits & Rest',
      bgClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    },
    {
      id: 'download-doc',
      title: 'Export Word Document',
      desc: 'Download your complete study timeline, memory aids, and syllabus progress as a .docx file.',
      icon: Download,
      action: 'Export .docx',
      badge: 'Real-Time',
      bgClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      isCustomClick: true,
      onClick: handleDownloadDoc
    }
  ];

  const filterFacilityList = (list: any[]) => {
    if (!shortcutSearch.trim()) return list;
    return list.filter(item => 
      item.title.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
      item.desc.toLowerCase().includes(shortcutSearch.toLowerCase())
    );
  };

  const filteredStudy = filterFacilityList(studyFacilities);
  const filteredTechniques = filterFacilityList(techniqueFacilities);
  const filteredMastery = filterFacilityList(masteryFacilities);

  // Complete registry of all facilities with explicit labels requested by the user
  const allFacilitiesMetadata: Array<{
    id: AppView;
    label: string;
    icon: any;
    category: 'Study & Planning' | 'Memory Techniques' | 'Mastery & Self-Testing';
    desc: string;
  }> = [
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, category: 'Study & Planning', desc: 'Schedules, milestones & deadlines' },
    { id: 'palace', label: "Memory palace (Sherlock Holmes' technique)", icon: Grid, category: 'Memory Techniques', desc: 'Method of Loci spatial anchors' },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen, category: 'Memory Techniques', desc: 'Spaced repetition flashcard decks' },
    { id: 'rescue-queue', label: 'Active recall', icon: Heart, category: 'Study & Planning', desc: 'Targeted retrieval on vulnerable cards' },
    { id: 'library', label: 'Personal library', icon: Book, category: 'Mastery & Self-Testing', desc: 'Searchable notes & study materials' },
    { id: 'study-bubble', label: 'Study Bubble', icon: Target, category: 'Study & Planning', desc: 'Distraction-free focus workspace' },
    { id: 'focus', label: 'Study Timer', icon: Timer, category: 'Study & Planning', desc: 'Monk Mode focus timer & sprints' },
    { id: 'planner', label: 'Study Schedule', icon: CalendarIcon, category: 'Study & Planning', desc: 'Daily task planner & syllabus goals' },
    { id: 'scheduler', label: 'Revision Hall', icon: Layers, category: 'Study & Planning', desc: 'Spaced repetition review intervals' },
    { id: 'exam-mode', label: 'Exam Planning', icon: Target, category: 'Study & Planning', desc: 'Target exam countdown & syllabus track' },
    { id: 'mnemonics', label: 'Mnemonics Generator', icon: Type, category: 'Memory Techniques', desc: 'Vivid acronyms & memory rhymes' },
    { id: 'linking', label: 'Linking Method', icon: LinkIcon, category: 'Memory Techniques', desc: 'Chain facts with vivid mental stories' },
    { id: 'story', label: 'Story Method', icon: BookMarked, category: 'Memory Techniques', desc: 'Narrative storytelling memorisation' },
    { id: 'first-letter', label: 'First Letter Method', icon: Type, category: 'Memory Techniques', desc: 'Acrostics & initialism memory aids' },
    { id: 'memory-boost', label: 'Daily Boost', icon: Brain, category: 'Mastery & Self-Testing', desc: 'ZIP puzzle, 2048 & Inner Blaze' },
    { id: 'self-test', label: 'Self-Test Facility', icon: Target, category: 'Mastery & Self-Testing', desc: 'Ungraded self-recall practice tests' },
    { id: 'simplifier', label: 'Prompt Formatter', icon: Lightbulb, category: 'Mastery & Self-Testing', desc: 'Feynman & Socratic pedagogical prompt generator' },
    { id: 'study-logs', label: 'Study Session Logs', icon: Clock, category: 'Mastery & Self-Testing', desc: 'Time tracking, logs & progress export' },
    { id: 'adaptive-study', label: 'Adaptive Study Balance', icon: Shield, category: 'Mastery & Self-Testing', desc: 'Break pacing & screen time balance' },
    { id: 'memory-dna', label: 'Memory DNA', icon: Activity, category: 'Mastery & Self-Testing', desc: 'Cognitive strengths & next actions' },
    { id: 'wellbeing', label: 'Wellbeing Coach', icon: Sparkles, category: 'Mastery & Self-Testing', desc: 'Hydration, rest & study wellness' },
  ];

  // Today's Date formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = studyTasks.filter(t => t.plannedDate === todayStr);
  const todayRevisions = scheduledRevisions.filter(sr => sr.dueDate === todayStr && !sr.completed);

  const isLight = theme === 'light';

  const handleQuickStart = () => {
    const subject = lastActiveSession?.subject || todayTasks[0]?.subject || flashcards[0]?.subject || 'General Study';
    const topic = lastActiveSession?.topic || todayTasks[0]?.topic || 'Focused Study Session';
    startStudyNow(`${subject} • ${topic}`, quickDuration, subject);
    setView('study-bubble');
  };

  return (
    <div className="min-h-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. TOP BRAND HEADING & MOTTO BANNER (MATCHING ATTACHED SCREENSHOT)        */}
      {/* ========================================================================= */}
      <div className="space-y-3.5 text-center pt-2">
        <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 drop-shadow-sm">
          Memory Shaastra
        </h1>
        <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-center space-y-2 border transition-all shadow-md ${
          isLight 
            ? 'bg-amber-100/70 border-amber-300' 
            : 'bg-amber-500/10 border-orange-500/30'
        }`}>
          <div className="inline-block px-5 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm bg-orange-500 text-slate-950">
            LEARNING DOES NOT HAVE TO FEEL DIFFICULT
          </div>
          <p className={`text-xs sm:text-sm font-bold italic tracking-tight ${
            isLight ? 'text-slate-800' : 'text-orange-200/90'
          }`}>
            Build a memory that works when it matters most.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL HERO CALL-TO-ACTION BUTTONS (STUDY BUBBLE & DAILY BOOST)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* BIG BUTTON 1: Study Bubble */}
        <motion.button
          whileHover={{ scale: 1.015, y: -3 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => setView('study-bubble')}
          className={`relative group overflow-hidden p-6 sm:p-7 rounded-[2.5rem] text-left transition-all flex flex-col justify-between min-h-[210px] border cursor-pointer ${
            isLight
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-slate-950 border-orange-400 shadow-xl shadow-orange-500/20'
              : 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white border-orange-500/40 shadow-2xl shadow-orange-600/30'
          }`}
        >
          <div className="absolute top-4 right-4 bg-black/25 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 border border-white/20 text-white">
            <Target size={14} className="text-white" />
            <span>STUDY BUBBLE MODE</span>
          </div>

          <div className="space-y-3.5 z-10">
            <div className="p-3.5 bg-black/30 w-fit rounded-2xl backdrop-blur-md border border-white/20 shadow-inner group-hover:scale-105 transition-transform">
              <Play size={24} className="fill-black text-black dark:fill-white dark:text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-2 text-slate-950 dark:text-white">
                <span>Study Bubble</span>
                <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
              </h2>
              <p className="text-xs font-medium mt-1 max-w-md text-slate-900/90 dark:text-orange-100/90 leading-relaxed">
                Dedicated distraction-minimised study workspace. Bring documents, flashcards, active recall & scratchpad together with offline study support!
              </p>
            </div>
          </div>
        </motion.button>

        {/* BIG BUTTON 2: Daily Boost */}
        <motion.button
          whileHover={{ scale: 1.015, y: -3 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => setView('memory-boost')}
          className={`relative group overflow-hidden p-6 sm:p-7 rounded-[2.5rem] text-left transition-all flex flex-col justify-between min-h-[210px] border cursor-pointer ${
            isLight
              ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 text-white border-purple-400 shadow-xl shadow-purple-500/20'
              : 'bg-gradient-to-br from-purple-700 via-indigo-700 to-violet-800 text-white border-purple-500/40 shadow-2xl shadow-purple-900/30'
          }`}
        >
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 border border-white/30 text-white">
            <Sparkles size={14} className="text-yellow-300" />
            <span>ZIP • NUMBER RECALL</span>
          </div>

          <div className="space-y-3.5 z-10">
            <div className="p-3.5 bg-white/20 w-fit rounded-2xl backdrop-blur-md border border-white/30 shadow-inner group-hover:scale-105 transition-transform">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Daily Boost</span>
                <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
              </h2>
              <p className="text-xs text-violet-100/90 font-medium mt-1 max-w-md leading-relaxed">
                Sharpen cognitive reflexes with <strong>ZIP puzzle</strong> or <strong>Number Recall</strong> before studying!
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* ========================================================================= */}
      {/* 3. INLINE ALL FACILITIES SECTION (NO POPUP MODAL)                         */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <button
          onClick={() => setIsFacilitiesExpanded(prev => !prev)}
          className={`w-full p-4 sm:p-5 rounded-3xl border shadow-lg flex items-center justify-between gap-4 transition-all active:scale-[0.99] cursor-pointer group ${
            isLight 
              ? 'bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-orange-500/10 hover:from-orange-500/20 hover:to-amber-500/25 border-orange-300 text-stone-900' 
              : 'bg-gradient-to-r from-orange-500/15 via-amber-500/20 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/30 border-orange-500/40 text-[#fef3c7]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-orange-500 text-slate-950 font-black shadow-md shrink-0">
              <Zap size={20} className="fill-slate-950" />
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate">
                All 21 App Facilities & Study Modules
              </h3>
              <p className={`text-[11px] font-bold truncate ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
                1-touch inline launcher for Study Planner, Flashcards, Palaces, Mnemonics & Self-Testing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
              {isFacilitiesExpanded ? 'Hide Facilities' : 'Browse All 21 Tools'}
            </span>
            {isFacilitiesExpanded ? (
              <ChevronUp size={20} className="text-orange-500 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown size={20} className="text-orange-500 group-hover:translate-y-0.5 transition-transform" />
            )}
          </div>
        </button>

        {/* INLINE EXPANDED FACILITIES CONTAINER (NO POPUP MODAL) */}
        {isFacilitiesExpanded && (
          <div className={`p-4 sm:p-6 rounded-3xl border shadow-xl space-y-5 animate-in fade-in duration-300 ${
            isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#241c19] border-[#3f332c] text-[#fef3c7]'
          }`}>
            {/* Header with Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-orange-500/20">
              <div>
                <h4 className="text-base sm:text-lg font-black tracking-tight">
                  Browse All 21 Facilities
                </h4>
                <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-orange-200/70'}`}>
                  Tap any facility card below to launch it instantly in 1 touch
                </p>
              </div>

              {/* Search Filter */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  value={shortcutSearch}
                  onChange={e => setShortcutSearch(e.target.value)}
                  placeholder="Filter 21 tools..."
                  className={`w-full text-xs py-2 pl-8 pr-7 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLight ? 'bg-orange-50/50 border-orange-200 text-stone-900' : 'bg-[#14100e] border-[#362923] text-white'
                  }`}
                />
                {shortcutSearch && (
                  <button
                    onClick={() => setShortcutSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills (cleanly wrapped with flex-wrap, ZERO horizontal scrollbar!) */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All 21 Tools' },
                { id: 'focus', label: 'Study & Planning' },
                { id: 'techniques', label: 'Memory Techniques' },
                { id: 'mastery', label: 'Mastery & Self-Testing' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFacilityCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    activeFacilityCategory === cat.id
                      ? 'bg-orange-500 text-slate-950 font-black border-orange-400 shadow-sm'
                      : isLight 
                        ? 'bg-orange-50/60 hover:bg-orange-100/80 text-stone-700 border-orange-200' 
                        : 'bg-[#181311] hover:bg-[#2e231f] text-orange-200/80 border-[#382b25]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Inline 21 Facilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {[...filteredStudy, ...filteredTechniques, ...filteredMastery]
                .filter(f => {
                  if (activeFacilityCategory === 'focus') return studyFacilities.some(s => s.id === f.id);
                  if (activeFacilityCategory === 'techniques') return techniqueFacilities.some(s => s.id === f.id);
                  if (activeFacilityCategory === 'mastery') return masteryFacilities.some(s => s.id === f.id);
                  return true;
                })
                .map(facility => {
                  const Icon = facility.icon;
                  return (
                    <button
                      key={facility.id}
                      onClick={() => {
                        if (facility.isCustomClick && facility.onClick) {
                          facility.onClick();
                        } else {
                          setView(facility.id as AppView);
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group shadow-sm ${
                        isLight 
                          ? 'bg-orange-50/50 hover:bg-orange-100/70 border-orange-200 hover:border-orange-300' 
                          : 'bg-[#1a1614] hover:bg-[#2c221e] border-[#362923] hover:border-orange-500/40 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${facility.bgClass}`}>
                          <Icon size={18} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md truncate ${
                          isLight ? 'bg-white text-orange-800 border border-orange-200' : 'bg-black/30 text-amber-300 border border-white/10'
                        }`}>
                          {facility.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-sm tracking-tight group-hover:text-orange-500 transition-colors break-words">
                          {facility.title}
                        </h5>
                        <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
                          {facility.desc}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs font-black text-orange-600 dark:text-orange-400">
                        <span>{facility.action}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. 3-SECOND DIRECT PATH TO STUDYING (WITH EDIT SESSION DETAILS OPTION)    */}
      {/* ========================================================================= */}
      <section 
        aria-label="Direct Study Path"
        className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          isLight ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border-orange-200' : 'bg-gradient-to-br from-[#2a221f] to-[#1f1917] border-[#3f332c]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl font-black shadow-md">
              <Play size={16} className="fill-slate-950" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight ${
                isLight ? 'text-stone-900' : 'text-amber-200'
              }`}>
                Direct Path to Studying
              </h2>
              <p className={`text-[11px] font-bold ${isLight ? 'text-stone-600' : 'text-orange-200/80'}`}>
                3-Second Quick-Start • Zero lengthy onboarding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Session Details Button */}
            <button
              onClick={() => {
                setEditSubject(lastActiveSession?.subject || todayTasks[0]?.subject || 'Economics');
                setEditTopic(lastActiveSession?.topic || todayTasks[0]?.topic || 'Monetary Policy & Inflation Rates');
                setEditDuration(lastActiveSession?.durationMinutes || 25);
                setIsEditSessionModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                isLight 
                  ? 'bg-orange-100 hover:bg-orange-200 text-orange-950 border-orange-300' 
                  : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/40'
              }`}
            >
              <Pencil size={13} />
              <span>Edit Details</span>
            </button>

            {/* AI Guide Button */}
            <button
              onClick={() => setShowAiGuide(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                isLight 
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300' 
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
              }`}
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Guide Me</span>
            </button>
          </div>
        </div>

        {/* Single Box: Step 3 - Start Where You Left Off */}
        <div className="relative z-10">
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isLight ? 'bg-amber-500/10 border-amber-300/60' : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <div className="space-y-1 text-center sm:text-left">
              <span className={`text-[11px] font-black uppercase tracking-wider ${
                isLight ? 'text-stone-900' : 'text-amber-300'
              }`}>
                Ready to Study
              </span>
              <p className={`text-xs sm:text-sm font-bold ${isLight ? 'text-stone-700' : 'text-orange-200/90'}`}>
                Resume: <strong className="text-orange-600 dark:text-orange-400">{lastActiveSession?.subject || todayTasks[0]?.subject || 'General Study'}</strong> • {lastActiveSession?.topic || todayTasks[0]?.topic || 'How to Study with Memory Shaastra'}
              </p>
            </div>

            {/* ONLY ONE BUTTON TO START WHERE LEFT OFF */}
            <button
              onClick={handleQuickStart}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Play size={15} className="fill-slate-950" />
              <span>Start Where You Left Off</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHAT IS MEMORY SHAASTRA BOX                                            */}
      {/* ========================================================================= */}
      <section 
        aria-label="What is Memory Shaastra"
        className={`p-5 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden transition-all space-y-4 ${
          isLight ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border-orange-200' : 'bg-gradient-to-br from-[#2a221f] to-[#1e1715] border-[#3f332c]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-2xl font-black shadow-md shrink-0">
              <Brain size={22} className="text-slate-950" />
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-orange-600/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/30">
                Core Cognitive Architecture
              </div>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                What is Memory Shaastra?
              </h3>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isLight ? 'bg-white text-stone-700 border-orange-200' : 'bg-black/30 text-orange-200 border-white/10'
          }`}>
            Evidence-Based System
          </span>
        </div>

        <p className={`text-xs sm:text-sm leading-relaxed font-medium break-words ${isLight ? 'text-stone-700' : 'text-orange-100/80'}`}>
          <strong>Memory Shaastra</strong> is an evidence-based memory and focus platform engineered specifically for students tackling vast, complex, or dry curricula (including CA, UPSC, Medical/NEET, JEE, Law, and Board examinations). It replaces exhausting passive reading and rote memorisation with proven neurological encoding frameworks so that information remains instantly accessible when you need it most.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'}`}>
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-wider mb-1.5">
              <Grid size={15} className="shrink-0" />
              <span>1. Spatial Palaces</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Anchor statutory sections, biological structures, and complex concepts to familiar rooms in your mental palace for effortless sequential recall.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'}`}>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider mb-1.5">
              <Clock size={15} className="shrink-0" />
              <span>2. Spaced Repetition</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Automated review cycles (1d, 3d, 7d, 14d, 30d) based on Ebbinghaus forgetting research, keeping facts fresh without endless re-reading.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'}`}>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider mb-1.5">
              <Target size={15} className="shrink-0" />
              <span>3. Active Retrieval</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Self-testing with masked answers tests real retrieval reflex under simulated exam conditions, eliminating the false feeling of competence.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'}`}>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-black text-xs uppercase tracking-wider mb-1.5">
              <Shield size={15} className="shrink-0" />
              <span>4. Study Bubble</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Dedicated workspace with outside notification suppression, offline study sync, and adaptive screen balance that helps you study and then log off guilt-free.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHY MEMORY SHAASTRA BOX (THE PROBLEM & HOW SHAASTRA SOLVES IT)         */}
      {/* ========================================================================= */}
      <section 
        aria-label="Why Memory Shaastra"
        className={`p-5 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden transition-all space-y-4 ${
          isLight ? 'bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50 border-orange-200' : 'bg-gradient-to-br from-[#241c19] to-[#1a1614] border-[#3f332c]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-2xl font-black shadow-md shrink-0">
              <HelpCircle size={22} className="text-slate-950" />
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-600/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                The Core Problem & Solution
              </div>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-stone-900' : 'text-amber-100'}`}>
                Why Memory Shaastra?
              </h3>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isLight ? 'bg-orange-100 text-orange-950 border-orange-300' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
          }`}>
            Focus On Learning Outcomes
          </span>
        </div>

        <p className={`text-xs sm:text-sm leading-relaxed font-medium break-words ${isLight ? 'text-stone-700' : 'text-orange-200/80'}`}>
          Most students spend countless hours highlighting textbooks and re-reading notes, only to blank out during exams. Here is what causes this problem and how Memory Shaastra systematically solves it:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Problem & Solution 1: Forgetting Curve */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
            isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'
          }`}>
            <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>The Problem: The Brutal Forgetting Curve</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Passive reading feels productive, but cognitive science shows students forget up to 70% of new information within 24 hours without structured interval retrieval.
            </p>
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed break-words">
                <strong className="font-black text-emerald-600 dark:text-emerald-400">Shaastra Solution:</strong> Automated SM-2 spaced repetition prompts you to revise each topic at 1d, 3d, 7d, 14d, and 30d intervals right before you forget.
              </div>
            </div>
          </div>

          {/* Problem & Solution 2: Illusion of Competence */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
            isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'
          }`}>
            <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>The Problem: The "Illusion of Competence"</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Highlighting textbooks and re-reading summaries feels comforting, but creates familiarity rather than recall. In the exam, students freeze on details.
            </p>
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed break-words">
                <strong className="font-black text-emerald-600 dark:text-emerald-400">Shaastra Solution:</strong> Active self-testing, answer masking, and retrieval queues force your brain to generate answers, cementing genuine long-term recall.
              </div>
            </div>
          </div>

          {/* Problem & Solution 3: Abstract Dry Facts */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
            isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'
          }`}>
            <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>The Problem: Rote Memorisation Fatigue</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Memorizing hundreds of statutory provisions, accounting standards, chemical equations, and legal cases through brute force causes cognitive exhaustion.
            </p>
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed break-words">
                <strong className="font-black text-emerald-600 dark:text-emerald-400">Shaastra Solution:</strong> Memory Palaces, Link chains, and First-Letter mnemonics convert dry abstractions into vivid, spatial mental anchors that are unforgettable.
              </div>
            </div>
          </div>

          {/* Problem & Solution 4: Distraction & Burnout */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
            isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#181311] border-[#382b25]'
          }`}>
            <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>The Problem: Phone Distractions & Burnout</span>
            </div>
            <p className={`text-xs leading-relaxed break-words ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              Frequent smartphone notifications fragment attention, increase study time needlessly, and lead to screen fatigue and anxiety before exams.
            </p>
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed break-words">
                <strong className="font-black text-emerald-600 dark:text-emerald-400">Shaastra Solution:</strong> Study Bubble holds outside alerts until you finish, while Adaptive Study Mode gently reminds you to rest after 2-3 hours so you study efficiently and log off.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PERSONALISED DASHBOARD                                                 */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl transition-colors ${
        isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1 bg-orange-600/20 text-orange-600 dark:text-orange-400 text-[11px] font-black uppercase tracking-wider rounded-full border border-orange-500/30">
                Personalised Dashboard
              </span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${
              isLight ? 'text-stone-900' : 'text-[#fef3c7]'
            }`}>
              Welcome back, <span className="text-orange-600 dark:text-orange-500">{(user?.name && !user.name.toLowerCase().includes('explorer')) ? user.name : 'Learner'}</span>!
            </h1>
            {targetExamTitle ? (
              <p className={`text-xs sm:text-sm max-w-xl font-medium ${
                isLight ? 'text-stone-700' : 'text-orange-200/80'
              }`}>
                Target Exam: <strong className="text-orange-600 dark:text-orange-300 font-bold">{targetExamTitle}</strong>
              </p>
            ) : (
              <p className={`text-xs sm:text-sm max-w-xl font-medium ${
                isLight ? 'text-stone-700' : 'text-orange-200/80'
              }`}>
                Ready to review and commit concepts to permanent long-term memory?
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadDoc}
              className={`px-4 py-3 text-xs font-bold rounded-2xl border transition-all flex items-center space-x-2 cursor-pointer shadow ${
                isLight 
                  ? 'bg-orange-50 hover:bg-orange-100 text-stone-900 border-orange-200' 
                  : 'bg-[#1a1614] hover:bg-[#342a27] text-orange-200 border-[#3f332c]'
              }`}
              title="Download full progress report in Word (.docx) format"
            >
              <Download size={16} className="text-orange-500" />
              <span>Export Word Doc</span>
            </button>
            <button
              onClick={() => setView('exam-mode')}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Target size={16} />
              <span>Exam Mode</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t ${
          isLight ? 'border-orange-100' : 'border-[#3f332c]'
        }`}>
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-orange-50/70 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-600 dark:text-orange-200/80">Active Flashcards</p>
            <p className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{flashcards.length}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-orange-50/70 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-600 dark:text-orange-200/80">Memory Aids</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{mnemonics.length + linkChains.length + storyChains.length}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-orange-50/70 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-600 dark:text-orange-200/80">Scheduled Tasks</p>
            <p className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{studyTasks.length}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-orange-50/70 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
          }`}>
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-600 dark:text-orange-200/80">Days to Exam</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{daysToGo !== null ? `${daysToGo}d` : 'Set in Exam'}</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TODAY'S STUDY & REVISION AGENDA                                       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className={`flex items-center justify-between border-b pb-3 ${
          isLight ? 'border-orange-200' : 'border-[#3f332c]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600/20 text-orange-500 rounded-xl border border-orange-500/20">
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
                isLight ? 'text-stone-900' : 'text-[#fef3c7]'
              }`}>
                Today's Schedule & Due Revisions
              </h2>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-orange-200/60'}`}>
                Active tasks and spaced revisions due today ({new Date().toLocaleDateString()})
              </p>
            </div>
          </div>
          <button 
            onClick={() => setView('planner')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center space-x-1.5 cursor-pointer ${
              isLight 
                ? 'bg-orange-50 hover:bg-orange-100 text-orange-950 border-orange-300' 
                : 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border-orange-500/30'
            }`}
          >
            <span>Manage Schedule</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {todayTasks.length === 0 && todayRevisions.length === 0 ? (
          <div className={`p-6 rounded-2xl border text-center space-y-3 ${
            isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-200'
          }`}>
            <p className={`text-xs font-semibold ${isLight ? 'text-stone-600' : 'text-orange-200/70'}`}>
              No specific tasks or revisions due for today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => setView('planner')}
                className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-orange-700 transition-all cursor-pointer"
              >
                + Add Activity / Revision
              </button>
              <button 
                onClick={() => setView('study-bubble')}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200' 
                    : 'bg-amber-600/20 text-amber-300 border-amber-500/30 hover:bg-amber-600/30'
                }`}
              >
                <Play size={14} />
                <span>Start Study Bubble Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map(task => (
              <div key={task.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isLight ? 'bg-white border-orange-200 text-stone-900 shadow-sm' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-orange-600/20 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded uppercase">
                      {task.subject || 'General'}
                    </span>
                    {task.estimatedTime ? (
                      <span className={`text-[10px] font-bold ${isLight ? 'text-stone-500' : 'text-orange-200/50'}`}>{task.estimatedTime}</span>
                    ) : (
                      <span className={`text-[10px] font-bold ${isLight ? 'text-stone-400' : 'text-orange-200/40'}`}>Flexible</span>
                    )}
                  </div>
                  <h4 className={`font-bold text-sm ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>{task.topic}</h4>
                </div>
                <button
                  onClick={() => {
                    const dur = parseInt(task.estimatedTime || '') || 25;
                    startStudyNow(task.topic, dur, task.subject);
                  }}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0 flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Study Now</span>
                </button>
              </div>
            ))}

            {todayRevisions.map(rev => (
              <div key={rev.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isLight ? 'bg-white border-orange-200 text-stone-900 shadow-sm' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black rounded uppercase">
                      Revision (Interval {rev.intervalDays}d)
                    </span>
                    {rev.durationMinutes ? (
                      <span className={`text-[10px] font-bold ${isLight ? 'text-stone-500' : 'text-orange-200/50'}`}>{rev.durationMinutes} mins</span>
                    ) : (
                      <span className={`text-[10px] font-bold ${isLight ? 'text-stone-400' : 'text-orange-200/40'}`}>Flexible</span>
                    )}
                  </div>
                  <h4 className={`font-bold text-sm ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>{rev.itemTitle}</h4>
                </div>
                <button
                  onClick={() => startStudyNow(rev.itemTitle, rev.durationMinutes || 25)}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0 flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Revise Now</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. FACILITY KEYBOARD SHORTCUTS REFERENCE TABLE                            */}
      {/* ========================================================================= */}
      <ShortcutsTable title="Facility Keyboard Shortcuts" />

      {/* ========================================================================= */}
      {/* EDIT SESSION DETAILS MODAL                                                */}
      {/* ========================================================================= */}
      {isEditSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-5 ${
            isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#241c19] border-[#3f332c] text-[#fef3c7]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl font-black">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">Edit Session Details</h3>
                  <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-orange-200/70'}`}>
                    Customize your subject, topic & duration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditSessionModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-stone-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSessionDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1 opacity-80">
                  Subject
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  placeholder="e.g. Economics, Biology, Company Law..."
                  className={`w-full p-3 rounded-xl border text-xs font-bold focus:outline-none focus:border-orange-500 ${
                    isLight ? 'bg-white border-stone-300' : 'bg-[#181311] border-[#362923] text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1 opacity-80">
                  Current Topic / Chapter
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={e => setEditTopic(e.target.value)}
                  placeholder="e.g. Monetary Policy & Inflation Rates..."
                  className={`w-full p-3 rounded-xl border text-xs font-bold focus:outline-none focus:border-orange-500 ${
                    isLight ? 'bg-white border-stone-300' : 'bg-[#181311] border-[#362923] text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1 opacity-80">
                  Session Sprint Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 45, 60].map(mins => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setEditDuration(mins)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        editDuration === mins
                          ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-sm'
                          : isLight 
                            ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200' 
                            : 'bg-[#181311] hover:bg-[#2c221e] text-orange-200 border-[#362923]'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditSessionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI GUIDE MODAL: "What should I do now?" (INTENTIONAL, GUILT-FREE)         */}
      {/* ========================================================================= */}
      {showAiGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto ${
            isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-[#fef3c7]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl font-black">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-black ${isLight ? 'text-stone-900' : 'text-amber-200'}`}>
                    ✨ Guide: What should I do now?
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-orange-200/70'}`}>
                    Smart guidance based on your real app items • Zero guilt
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiGuide(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Smart Option 1: Top Priority Action */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-orange-50/80 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-orange-500 text-slate-950 text-[10px] font-black uppercase">
                  Top Priority
                </span>
                <span className={`text-xs font-bold ${isLight ? 'text-stone-800' : 'text-orange-200'}`}>
                  {todayRevisions.length > 0 ? 'Spaced Repetition Due' : todayTasks.length > 0 ? 'Today\'s Study Goal' : 'Focus Sprint'}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {todayRevisions.length > 0
                  ? `You have ${todayRevisions.length} revision item(s) scheduled for today. Reviewing on time solidifies long-term storage according to the Ebbinghaus forgetting curve.`
                  : todayTasks.length > 0
                    ? `You planned to cover "${todayTasks[0].topic}" (${todayTasks[0].subject}). Jump into a quick 25-minute Study Bubble session.`
                    : 'Your review queue is clear! Start a fresh 15-minute Study Bubble sprint on any subject or try an active recall deck.'}
              </p>
              <button
                onClick={() => {
                  setShowAiGuide(false);
                  if (todayRevisions.length > 0) setView('scheduler');
                  else setView('study-bubble');
                }}
                className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Play size={12} className="fill-white" />
                <span>{todayRevisions.length > 0 ? 'Go to Revision Hall' : 'Launch Study Bubble'}</span>
              </button>
            </div>

            {/* Smart Option 2: Active Recall & Memory Techniques */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-[#1a1614] border-[#3f332c]'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  Technique Recommendation
                </span>
                <span className={`text-xs font-bold ${isLight ? 'text-stone-800' : 'text-amber-200'}`}>
                  Visual Anchoring
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                If you encounter difficult provisions, complex tax rates, or statutory sections, don't re-read repeatedly. Anchor them visually using a <strong>Memory Palace</strong> or <strong>Acronym Mnemonic</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setShowAiGuide(false); setView('flashcards'); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    isLight ? 'bg-white hover:bg-orange-50 text-stone-800 border-amber-200' : 'bg-white/5 hover:bg-white/10 text-amber-200 border-white/10'
                  }`}
                >
                  Practice Flashcards
                </button>
                <button
                  onClick={() => { setShowAiGuide(false); setView('palace'); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    isLight ? 'bg-white hover:bg-orange-50 text-stone-800 border-amber-200' : 'bg-white/5 hover:bg-white/10 text-amber-200 border-white/10'
                  }`}
                >
                  Memory Palace
                </button>
              </div>
            </div>

            {/* Smart Option 3: Refresh or Warmup */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#1a1614] border-[#3f332c]'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-sky-500 text-slate-950 text-[10px] font-black uppercase">
                  Low Energy / Warm-Up
                </span>
                <span className={`text-xs font-bold ${isLight ? 'text-stone-800' : 'text-sky-200'}`}>
                  Cognitive Reflexes
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                Feeling mentally sluggish? Spend 2 minutes on the <strong>ZIP number-tracing puzzle</strong> or <strong>Number Recall</strong> in Daily Boost to activate prefrontal alertness.
              </p>
              <button
                onClick={() => { setShowAiGuide(false); setView('memory-boost'); }}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  isLight ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300' : 'bg-white/5 hover:bg-white/10 text-stone-200 border-white/10'
                }`}
              >
                <span>Play Daily Boost</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="pt-1 text-center">
              <p className={`text-[11px] italic font-medium ${isLight ? 'text-stone-500' : 'text-orange-200/60'}`}>
                "Take it one session at a time. Consistency beats intense burnout every single time."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMISE QUICK BOOKMARKS MODAL                                           */}
      {/* ========================================================================= */}
      {isCustomizeBookmarksOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[88vh] overflow-hidden ${
            isLight ? 'bg-white border-orange-200 text-stone-900' : 'bg-[#241c19] border-[#3f332c] text-[#fef3c7]'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
              isLight ? 'bg-orange-50/50 border-orange-100' : 'bg-[#1a1614] border-[#362923]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500 text-slate-950 font-black shadow-md">
                  <BookmarkCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">Customise Quick Bookmarks</h3>
                  <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-orange-200/70'}`}>
                    Choose which facilities appear in your top bookmarks bar. Tap any facility to add or remove it.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomizeBookmarksOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Pinned Counter */}
            <div className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between gap-3 ${
              isLight ? 'bg-stone-50/80 border-stone-200' : 'bg-[#181311] border-[#2c221e]'
            }`}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  value={bookmarkSearch}
                  onChange={e => setBookmarkSearch(e.target.value)}
                  placeholder="Search across all 21 facilities..."
                  className={`w-full text-xs py-2 pl-8 pr-7 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#14100e] border-[#362923] text-white'
                  }`}
                />
                {bookmarkSearch && (
                  <button
                    onClick={() => setBookmarkSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <span className="text-xs font-black text-orange-600 dark:text-orange-400 whitespace-nowrap px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                {bookmarkedIds.length} Pinned
              </span>
            </div>

            {/* Facilities Checklist Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allFacilitiesMetadata
                  .filter(f => 
                    !bookmarkSearch.trim() || 
                    f.label.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
                    f.desc.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
                    f.category.toLowerCase().includes(bookmarkSearch.toLowerCase())
                  )
                  .map(facility => {
                    const isChecked = bookmarkedIds.includes(facility.id);
                    const Icon = facility.icon;
                    return (
                      <button
                        key={facility.id}
                        type="button"
                        onClick={() => handleToggleBookmark(facility.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isChecked
                            ? isLight 
                              ? 'bg-orange-50 border-orange-400 shadow-sm text-stone-900' 
                              : 'bg-orange-500/15 border-orange-500 text-orange-100 shadow-sm'
                            : isLight 
                              ? 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700' 
                              : 'bg-[#181311] hover:bg-[#251d1a] border-[#362923] text-orange-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-xl border shrink-0 ${
                            isChecked
                              ? 'bg-orange-500 text-slate-950 border-orange-600'
                              : isLight ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-white/5 text-orange-200 border-white/10'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black truncate">{facility.label}</h4>
                            <p className={`text-[10px] truncate ${isLight ? 'text-stone-500' : 'text-orange-200/60'}`}>
                              {facility.category} • {facility.desc}
                            </p>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked 
                            ? 'bg-orange-600 text-white border-orange-600' 
                            : isLight ? 'border-stone-300 bg-white' : 'border-[#362923] bg-[#14100e]'
                        }`}>
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-2.5 ${
              isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#1a1614] border-[#362923]'
            }`}>
              <button
                type="button"
                onClick={handleResetDefaultBookmarks}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300' 
                    : 'bg-[#241c19] hover:bg-[#342722] text-orange-200 border-[#3f332c]'
                }`}
              >
                Reset to 5 Defaults
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizeBookmarksOpen(false)}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer active:scale-95 transition-all"
              >
                Done ({bookmarkedIds.length} Bookmarks)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
