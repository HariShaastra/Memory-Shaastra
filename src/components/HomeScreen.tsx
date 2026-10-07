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
  LayoutGrid
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { downloadProgressAsWordDoc } from '../utils/downloadProgressDocx';
import { AppView } from '../types';

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
    startStudyNow
  } = useAppContext();

  // Search state for shortcuts
  const [shortcutSearch, setShortcutSearch] = useState('');

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
      id: 'ai-tester' as AppView,
      title: 'AI Exam Tester',
      desc: 'Randomly generates automated revision tests in all formats based strictly on your app activity.',
      icon: Bot,
      action: 'Take Practice Test',
      badge: 'Smart Recall',
      bgClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    },
    {
      id: 'simplifier' as AppView,
      title: 'Concept Simplifier',
      desc: 'Feynman technique AI that explains complex technical jargon in crystal clear layman analogies.',
      icon: Lightbulb,
      action: 'Simplify Idea',
      badge: 'Feynman Mode',
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'memory-dna' as AppView,
      title: 'Memory DNA',
      desc: 'Visual cognitive diagnostic that analyzes your retention patterns, strengths, and recall speed.',
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

  // Line of Quick Shortcut Buttons to Every Facility of the App
  const quickFacilityShortcuts = [
    { id: 'focus' as AppView, label: 'Timer', icon: Timer },
    { id: 'planner' as AppView, label: 'Schedule', icon: CalendarIcon },
    { id: 'scheduler' as AppView, label: 'Revision Hall', icon: Layers },
    { id: 'calendar' as AppView, label: 'Calendar', icon: CalendarDays },
    { id: 'exam-mode' as AppView, label: 'Exam Mode', icon: Target },
    { id: 'rescue-queue' as AppView, label: 'Active Recall', icon: Heart },
    { id: 'flashcards' as AppView, label: 'Flashcards', icon: BookOpen },
    { id: 'mnemonics' as AppView, label: 'Mnemonics', icon: Type },
    { id: 'palace' as AppView, label: 'Memory Palace', icon: Grid },
    { id: 'linking' as AppView, label: 'Linking', icon: LinkIcon },
    { id: 'story' as AppView, label: 'Stories', icon: BookMarked },
    { id: 'first-letter' as AppView, label: 'First-Letter', icon: Type },
    { id: 'memory-boost' as AppView, label: 'Daily Boost', icon: Brain },
    { id: 'library' as AppView, label: 'Library', icon: Book },
    { id: 'ai-tester' as AppView, label: 'AI Tester', icon: Bot },
    { id: 'simplifier' as AppView, label: 'Simplifier', icon: Lightbulb },
    { id: 'memory-dna' as AppView, label: 'Memory DNA', icon: Activity },
    { id: 'wellbeing' as AppView, label: 'Wellbeing', icon: Sparkles }
  ];

  // Today's Date formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = studyTasks.filter(t => t.plannedDate === todayStr);
  const todayRevisions = scheduledRevisions.filter(sr => sr.dueDate === todayStr && !sr.completed);

  const isLight = theme === 'light';

  return (
    <div className="min-h-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10 w-full max-w-full overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. BRAND HEADING & MOTTO BOX */}
      {/* ========================================================================= */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 drop-shadow-lg font-serif">
          Memory Shaastra
        </h1>
        <div className={`p-6 sm:p-8 rounded-3xl text-center space-y-2 border-2 transition-all shadow-xl ${
          isLight 
            ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-amber-300 shadow-orange-500/10' 
            : 'bg-gradient-to-r from-orange-500/15 via-amber-500/20 to-orange-500/15 border-orange-500/30 shadow-orange-500/5'
        }`}>
          <div className="inline-block px-4 sm:px-6 py-2 rounded-2xl font-black text-sm sm:text-xl uppercase tracking-wider shadow-md bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950">
            Learning does NOT have to feel difficult
          </div>
          <p className={`text-xs sm:text-base font-bold italic tracking-tight ${
            isLight ? 'text-slate-800' : 'text-orange-200/90'
          }`}>
            Build a memory that works when it matters most.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK NAVIGATION RIBBON (RIGHT ABOVE "WHAT IS MEMORY SHAASTRA?" BOX)      */}
      {/* ========================================================================= */}
      <nav
        aria-label="Home Screen Quick Navigation"
        className={`p-3 sm:p-4 rounded-3xl border shadow-md transition-colors ${
          isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
        }`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
          {[
            { id: 'dashboard', label: 'Home', icon: Home, active: true },
            { id: 'planner', label: 'Schedule', icon: CalendarIcon, active: false },
            { id: 'flashcards', label: 'Cards', icon: BookOpen, active: false },
            { id: 'library', label: 'Library', icon: Book, active: false },
            { id: 'exam-mode', label: 'Exams', icon: Target, active: false },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as AppView)}
                className={`h-10 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border shadow-sm ${
                  tab.active
                    ? 'bg-orange-600 text-white border-orange-500'
                    : isLight
                      ? 'bg-orange-50/70 hover:bg-orange-100 text-stone-900 border-orange-200'
                      : 'bg-[#1a1614] hover:bg-[#342722] text-[#fef3c7] border-[#3f332c]'
                }`}
              >
                <Icon size={15} className={tab.active ? 'text-white shrink-0' : 'text-orange-500 shrink-0'} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              document.getElementById('all-facilities-directory')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`h-10 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border shadow-sm ${
              isLight
                ? 'bg-orange-50/70 hover:bg-orange-100 text-stone-900 border-orange-200'
                : 'bg-[#1a1614] hover:bg-[#342722] text-amber-300 border-[#3f332c]'
            }`}
          >
            <LayoutGrid size={15} className="text-orange-500 shrink-0" />
            <span className="whitespace-nowrap">All Tools</span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. WHAT IS MEMORY SHAASTRA? (IN SIMPLE WORDS) - PROMINENT CORE BOX        */}
      {/* ========================================================================= */}
      <div className="bg-[#2a221f] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border-2 border-orange-500/40 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Brain size={180} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-600/20 text-orange-400 rounded-2xl border border-orange-500/30 shadow-sm">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-200 tracking-tight">
                What is Memory Shaastra? (In Simple Words)
              </h2>
              <p className="text-[10px] sm:text-xs text-orange-300/80 font-bold uppercase tracking-wider">
                The Science of Effortless & Permanent Recall
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
            <Shield size={14} className="text-emerald-400 shrink-0" />
            <span>🛡️ Outside notifications blocked until exit</span>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-orange-100/90 font-medium leading-relaxed max-w-4xl relative z-10 pt-1">
          <strong>Memory Shaastra</strong> is a science-backed learning platform that makes studying effortless and permanent. Instead of painful, repetitive cramming, it transforms dry concepts, definitions, and facts into vivid visual pegs (<strong>Memory Palaces</strong>, <strong>Acronym Mnemonics</strong>, <strong>Linking Chains</strong>, and <strong>Stories</strong>) paired with automated <strong>Spaced Repetition schedules (1d, 3d, 7d, 14d, 30d)</strong>. You understand faster, study stress-free, and recall everything with total clarity in your exams.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 relative z-10 text-[11px] font-bold">
          <span className="px-3 py-1 bg-white/5 border border-white/10 text-orange-300 rounded-xl">
            🏰 Visual Memory Palaces
          </span>
          <span className="px-3 py-1 bg-white/5 border border-white/10 text-amber-300 rounded-xl">
            ⚡ Spaced Repetition (1d, 3d, 7d, 14d, 30d)
          </span>
          <span className="px-3 py-1 bg-white/5 border border-white/10 text-sky-300 rounded-xl">
            🔗 Associative Linking Chains
          </span>
          <span className="px-3 py-1 bg-white/5 border border-white/10 text-emerald-300 rounded-xl">
            🛡️ 100% Distraction-Free (Suppressed External Notifications)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HERO DUAL CALL-TO-ACTION BUTTONS: "Study Now" and "Daily Boost"       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BIG BUTTON 1: Study Now */}
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('focus')}
          className={`relative group overflow-hidden p-6 sm:p-8 rounded-[2.5rem] text-left transition-all flex flex-col justify-between min-h-[220px] border cursor-pointer ${
            isLight
              ? 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-slate-950 border-orange-400 shadow-xl shadow-orange-500/20'
              : 'bg-gradient-to-br from-orange-600 via-orange-700 to-amber-700 text-white border-orange-500/40 shadow-2xl shadow-orange-600/30'
          }`}
        >
          {/* Animated background glow */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-300/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 border backdrop-blur-md ${
            isLight 
              ? 'bg-slate-950/15 text-slate-950 border-slate-950/20' 
              : 'bg-white/15 text-white border-white/20'
          }`}>
            <Clock size={14} className={isLight ? 'text-slate-950' : 'text-amber-300'} />
            <span>Study Timer Mode</span>
          </div>

          <div className="space-y-3 z-10">
            <div className={`p-4 w-fit rounded-2xl backdrop-blur-md border shadow-inner group-hover:scale-110 transition-transform duration-300 ${
              isLight ? 'bg-slate-950/15 border-slate-950/20' : 'bg-white/20 border-white/20'
            }`}>
              <Play size={28} className={isLight ? 'fill-slate-950 text-slate-950' : 'fill-white text-white'} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center space-x-2 ${
                isLight ? 'text-slate-950' : 'text-white'
              }`}>
                <span>Study Now</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              </h2>
              <p className={`text-xs font-medium mt-1 max-w-md ${
                isLight ? 'text-slate-900/90' : 'text-orange-100/90'
              }`}>
                Enter instant focus session. Set customizable timers, lock distractions, and start deep focus learning!
              </p>
            </div>
          </div>
        </motion.button>

        {/* BIG BUTTON 2: Daily Boost */}
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('memory-boost')}
          className={`relative group overflow-hidden p-6 sm:p-8 rounded-[2.5rem] text-left transition-all flex flex-col justify-between min-h-[220px] border cursor-pointer ${
            isLight
              ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white border-indigo-400 shadow-xl shadow-indigo-500/20'
              : 'bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900 text-white border-violet-500/40 shadow-2xl shadow-indigo-900/30'
          }`}
        >
          {/* Animated background glow */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-violet-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 border border-white/30 text-white">
            <Sparkles size={14} className="text-yellow-300" />
            <span>ZIP • Sudoku • Blaze</span>
          </div>

          <div className="space-y-3 z-10">
            <div className="p-4 bg-white/20 w-fit rounded-2xl backdrop-blur-md border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Brain size={28} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Daily Boost</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              </h2>
              <p className="text-xs text-violet-100/90 font-medium mt-1 max-w-md">
                Sharpen cognitive reflexes with <strong>ZIP puzzle</strong>, <strong>Mini Sudoku</strong>, or <strong>Inner Blaze</strong> before studying!
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* ========================================================================= */}
      {/* LINE OF SHORTCUT BUTTONS TO EVERY FACILITY (BELOW STUDY NOW ORANGE BUTTON)*/}
      {/* ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-lg space-y-3 transition-colors ${
        isLight ? 'bg-white border-orange-200' : 'bg-[#2a221f] border-[#3f332c]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles size={15} className="text-orange-500" />
            <span className={`text-xs font-black uppercase tracking-wider ${
              isLight ? 'text-stone-900' : 'text-amber-300'
            }`}>
              Quick Facility Shortcuts
            </span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            isLight ? 'text-stone-700' : 'text-orange-200/80'
          }`}>
            All 18 Facilities
          </span>
        </div>

        {/* The line of buttons - wrapping without side scroll */}
        <div className="flex flex-wrap items-center gap-2">
          {quickFacilityShortcuts.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer shadow-sm ${
                  isLight
                    ? 'bg-orange-50/90 hover:bg-orange-100 text-stone-900 hover:text-orange-900 border-orange-300'
                    : 'bg-[#1a1614] hover:bg-[#342722] text-[#fef3c7] hover:text-white border-[#3f332c] hover:border-orange-500/50'
                }`}
              >
                <Icon size={13} className="text-orange-500 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PERSONALISED DASHBOARD                                                 */}
      {/* ========================================================================= */}
      <div className="bg-[#2a221f] p-6 sm:p-8 rounded-3xl border border-[#3f332c] space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1 bg-orange-600/20 text-orange-400 text-[11px] font-black uppercase tracking-wider rounded-full border border-orange-500/30">
                Personalised Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#fef3c7] tracking-tight">
              Welcome back, <span className="text-orange-500">{(user?.name && !user.name.toLowerCase().includes('explorer')) ? user.name : 'Learner'}</span>!
            </h1>
            {targetExamTitle ? (
              <p className="text-xs sm:text-sm text-stone-700 dark:text-orange-200/80 max-w-xl font-medium">
                Target Exam: <strong className="text-orange-500 dark:text-orange-300 font-bold">{targetExamTitle}</strong>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-stone-700 dark:text-orange-200/80 max-w-xl font-medium">
                Ready to review and commit concepts to permanent long-term memory?
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadDoc}
              className="px-4 py-3 bg-[#1a1614] hover:bg-[#342a27] text-orange-200 text-xs font-bold rounded-2xl border border-[#3f332c] hover:border-orange-500/40 transition-all flex items-center space-x-2 cursor-pointer shadow"
              title="Download full progress report in Word (.docx) format"
            >
              <Download size={16} className="text-orange-400" />
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#3f332c]">
          <div className="bg-[#1a1614] p-4 rounded-2xl border border-[#3f332c]">
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-700 dark:text-orange-200/80">Active Flashcards</p>
            <p className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{flashcards.length}</p>
          </div>
          <div className="bg-[#1a1614] p-4 rounded-2xl border border-[#3f332c]">
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-700 dark:text-orange-200/80">Memory Aids</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{mnemonics.length + linkChains.length + storyChains.length}</p>
          </div>
          <div className="bg-[#1a1614] p-4 rounded-2xl border border-[#3f332c]">
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-700 dark:text-orange-200/80">Scheduled Tasks</p>
            <p className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{studyTasks.length}</p>
          </div>
          <div className="bg-[#1a1614] p-4 rounded-2xl border border-[#3f332c]">
            <p className="text-[10px] uppercase font-black tracking-wider text-stone-700 dark:text-orange-200/80">Days to Exam</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{daysToGo !== null ? `${daysToGo}d` : 'Set in Exam'}</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TODAY'S STUDY & REVISION AGENDA                                       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#3f332c] pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/20">
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#fef3c7] tracking-tight">Today's Schedule & Due Revisions</h2>
              <p className="text-xs text-orange-200/60">Active tasks and spaced revisions due today ({new Date().toLocaleDateString()})</p>
            </div>
          </div>
          <button 
            onClick={() => setView('planner')}
            className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-xs font-bold rounded-xl border border-orange-500/30 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Manage Schedule</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {todayTasks.length === 0 && todayRevisions.length === 0 ? (
          <div className="p-6 bg-[#1a1614] rounded-2xl border border-[#3f332c] text-center space-y-3">
            <p className="text-xs text-orange-200/70 font-semibold">No specific tasks or revisions due for today.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => setView('planner')}
                className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-orange-700 transition-all cursor-pointer"
              >
                + Add Activity / Revision
              </button>
              <button 
                onClick={() => startStudyNow('Active Focus Study', 25)}
                className="px-4 py-2 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Play size={14} />
                <span>Start Focus Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map(task => (
              <div key={task.id} className="p-4 bg-[#1a1614] rounded-2xl border border-[#3f332c] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-orange-600/20 text-orange-400 text-[10px] font-black rounded uppercase">
                      {task.subject || 'General'}
                    </span>
                    {task.estimatedTime ? (
                      <span className="text-[10px] text-orange-200/50 font-bold">{task.estimatedTime}</span>
                    ) : (
                      <span className="text-[10px] text-orange-200/40 font-bold">Flexible</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-orange-100">{task.topic}</h4>
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
              <div key={rev.id} className="p-4 bg-[#1a1614] rounded-2xl border border-[#3f332c] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded uppercase">
                      Revision (Interval {rev.intervalDays}d)
                    </span>
                    {rev.durationMinutes ? (
                      <span className="text-[10px] text-orange-200/50 font-bold">{rev.durationMinutes} mins</span>
                    ) : (
                      <span className="text-[10px] text-orange-200/40 font-bold">Flexible</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-orange-100">{rev.itemTitle}</h4>
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
      {/* 6. SHORTCUTS & ALL FACILITIES (BELOW DASHBOARD - LAST ON PAGE)            */}
      {/* ========================================================================= */}
      <div id="all-facilities-directory" className="space-y-8 pt-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3f332c] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-orange-600/20 text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-orange-500/30">
                Facility Directory
              </span>
              <span className="text-[10px] text-orange-200/60 font-bold uppercase tracking-wider">
                All 18 Tools Available
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#fef3c7] tracking-tight mt-1">
              Shortcuts to All Facilities
            </h2>
            <p className="text-xs text-orange-200/70 mt-0.5">
              Organized into clear classifications with one-liner explanations for each tool.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/60" />
            <input 
              type="text"
              value={shortcutSearch}
              onChange={e => setShortcutSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full bg-[#1a1614] border border-[#3f332c] text-xs py-2.5 pl-10 pr-4 rounded-2xl text-[#fef3c7] focus:outline-none focus:border-orange-500 font-medium"
            />
            {shortcutSearch && (
              <button 
                onClick={() => setShortcutSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-orange-200/40 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CLASSIFICATION 1: STUDY & PLANNING                                   */}
        {/* ===================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-orange-300">
                Study & Planning Facilities
              </h3>
            </div>
            <span className="text-[10px] font-bold text-orange-200/50 uppercase">
              {filteredStudy.length} Facilities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredStudy.map(facility => {
              const Icon = facility.icon;
              return (
                <div
                  key={facility.id}
                  className="p-5 sm:p-6 bg-[#2a221f] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${facility.bgClass} group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-white/5 text-orange-300 rounded-full border border-white/10">
                        {facility.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-[#fef3c7] group-hover:text-orange-400 transition-colors">
                        {facility.title}
                      </h4>
                      <p className="text-xs text-orange-200/70 mt-1 leading-relaxed">
                        {facility.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setView(facility.id as AppView)}
                    className="w-full py-2.5 px-4 bg-[#1a1614] hover:bg-orange-600 group-hover:bg-orange-600 text-orange-200 group-hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between border border-[#3f332c] group-hover:border-orange-500 shadow-sm cursor-pointer active:scale-95"
                  >
                    <span>{facility.action}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CLASSIFICATION 2: MEMORY SCIENCE & TECHNIQUES                        */}
        {/* ===================================================================== */}
        <div className="space-y-4 pt-4 border-t border-[#3f332c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-amber-300">
                Memory Science & Techniques
              </h3>
            </div>
            <span className="text-[10px] font-bold text-orange-200/50 uppercase">
              {filteredTechniques.length} Methods
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTechniques.map(facility => {
              const Icon = facility.icon;
              return (
                <div
                  key={facility.id}
                  className="p-5 sm:p-6 bg-[#2a221f] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${facility.bgClass} group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-white/5 text-amber-300 rounded-full border border-white/10">
                        {facility.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-[#fef3c7] group-hover:text-orange-400 transition-colors">
                        {facility.title}
                      </h4>
                      <p className="text-xs text-orange-200/70 mt-1 leading-relaxed">
                        {facility.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setView(facility.id as AppView)}
                    className="w-full py-2.5 px-4 bg-[#1a1614] hover:bg-orange-600 group-hover:bg-orange-600 text-orange-200 group-hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between border border-[#3f332c] group-hover:border-orange-500 shadow-sm cursor-pointer active:scale-95"
                  >
                    <span>{facility.action}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CLASSIFICATION 3: MASTERY & AI TOOLS                                 */}
        {/* ===================================================================== */}
        <div className="space-y-4 pt-4 border-t border-[#3f332c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-sky-300">
                Mastery & AI Tools
              </h3>
            </div>
            <span className="text-[10px] font-bold text-orange-200/50 uppercase">
              {filteredMastery.length} Tools
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredMastery.map(facility => {
              const Icon = facility.icon;
              return (
                <div
                  key={facility.id}
                  className="p-5 sm:p-6 bg-[#2a221f] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${facility.bgClass} group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-white/5 text-sky-300 rounded-full border border-white/10">
                        {facility.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-[#fef3c7] group-hover:text-orange-400 transition-colors">
                        {facility.title}
                      </h4>
                      <p className="text-xs text-orange-200/70 mt-1 leading-relaxed">
                        {facility.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (facility.isCustomClick && facility.onClick) {
                        facility.onClick();
                      } else {
                        setView(facility.id as AppView);
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-[#1a1614] hover:bg-orange-600 group-hover:bg-orange-600 text-orange-200 group-hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between border border-[#3f332c] group-hover:border-orange-500 shadow-sm cursor-pointer active:scale-95"
                  >
                    <span>{facility.action}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
