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
  Link,
  BookMarked,
  Play,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { downloadProgressAsWordDoc } from '../utils/downloadProgressDocx';

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
    examPlans,
    personalization,
    overallProgress,
    theme
  } = useAppContext();

  // Search state for Memory Skills & Techniques
  const [skillSearch, setSkillSearch] = useState('');

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

    // Filter exams that are today or in the future
    const upcoming = plansWithDate.filter(e => e.diffDays >= 0);
    if (upcoming.length > 0) {
      upcoming.sort((a, b) => a.diffDays - b.diffDays);
      return upcoming[0];
    }

    // If all are in the past, pick the most recent one
    plansWithDate.sort((a, b) => b.examTime - a.examTime);
    return plansWithDate[0];
  };

  const targetExamInfo = getNearestExamInfo();
  const targetExamTitle = targetExamInfo?.plan.title || (personalization.targetExamName && personalization.targetExamName.trim() !== '' ? personalization.targetExamName : null);
  const daysToGo = targetExamInfo ? Math.max(0, targetExamInfo.diffDays) : null;

  // All memory skills list for search filter
  const allSkills = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      desc: 'Spaced recall flashcards for facts, definitions & formulas.',
      icon: Layers,
      count: `${flashcards.length} Cards`,
      color: 'amber',
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'mnemonics',
      title: 'Mnemonics',
      desc: 'Clever acronym phrases to remember long lists quickly.',
      icon: Type,
      count: `${mnemonics.length} Phrases`,
      color: 'rose',
      bgClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    {
      id: 'palace',
      title: 'Memory Palace',
      desc: 'Associate concepts with familiar rooms & physical locations.',
      icon: Grid,
      count: `${memoryPalaces.length} Palaces`,
      color: 'sky',
      bgClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    },
    {
      id: 'linking',
      title: 'Link Method',
      desc: 'Connect sequential ideas with vivid mental chain links.',
      icon: Link,
      count: `${linkChains.length} Chains`,
      color: 'emerald',
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'story',
      title: 'Story Method',
      desc: 'Turn dry facts into memorable narrative stories.',
      icon: BookMarked,
      count: `${storyChains.length} Stories`,
      color: 'violet',
      bgClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
    },
    {
      id: 'first-letter',
      title: 'First Letter Method',
      desc: 'Generate initialism mnemonics for quick list recall.',
      icon: Type,
      count: `${firstLetterEntries.length} Aids`,
      color: 'indigo',
      bgClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    }
  ];

  const filteredSkills = allSkills.filter(s => 
    s.title.toLowerCase().includes(skillSearch.toLowerCase()) || 
    s.desc.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // Handle Study Now click for a specific scheduled task
  const handleStudyNow = (taskTitle: string, durationMinutes: number) => {
    setView('focus');
  };

  // Today's Date formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = studyTasks.filter(t => t.plannedDate === todayStr);
  const todayRevisions = scheduledRevisions.filter(sr => sr.dueDate === todayStr && !sr.completed);

  const isLight = theme === 'light';

  return (
    <div className="min-h-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* ATTRACTIVE BRAND HEADING & MOTTO BOX */}
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

      {/* 1. TOP 2 BIG BUTTONS: "Study now" and "Daily Boost" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BIG BUTTON 1: Study Now */}
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('focus')}
          className={`relative group overflow-hidden p-6 sm:p-8 rounded-[2.5rem] text-left transition-all flex flex-col justify-between min-h-[200px] border ${
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
          className={`relative group overflow-hidden p-6 sm:p-8 rounded-[2.5rem] text-left transition-all flex flex-col justify-between min-h-[200px] border ${
            isLight
              ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white border-indigo-400 shadow-xl shadow-indigo-500/20'
              : 'bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900 text-white border-violet-500/40 shadow-2xl shadow-indigo-900/30'
          }`}
        >
          {/* Animated background glow */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-violet-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 border border-white/30 text-white">
            <Brain size={14} className="text-yellow-300" />
            <span>Memory Game Icebreaker</span>
          </div>

          <div className="space-y-3 z-10">
            <div className="p-4 bg-white/20 w-fit rounded-2xl backdrop-blur-md border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Brain size={28} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Daily Boost</span>
              </h2>
              <p className="text-xs text-violet-100/90 font-medium mt-1 max-w-md">
                Quick 2-minute memory sharpening game to prime your brain before studying! Boost mental recall & retention.
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* 2. PERSONALISED DASHBOARD HEADER */}
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
              <p className="text-xs sm:text-sm text-orange-200/80 max-w-xl font-medium">
                Target Exam: <strong className="text-orange-300 font-bold">{targetExamTitle}</strong>
              </p>
            ) : (
              <p className="text-xs text-orange-200/50 max-w-xl">
                Target Exam: <button onClick={() => setView('exam-mode')} className="text-orange-400 underline font-bold hover:text-orange-300">Set Target Exam in Exam Planning</button>
              </p>
            )}
          </div>

          {/* Exam Countdown & Progress Summary */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {targetExamTitle && daysToGo !== null && (
              <div className="bg-[#fff8f0] px-5 py-3 rounded-2xl border-2 border-orange-200 flex items-center space-x-3 text-slate-900 shadow-sm">
                <Clock size={20} className="text-rose-600" />
                <div>
                  <p className="text-[10px] text-slate-700 uppercase font-black tracking-wider">Exam Countdown</p>
                  <p className="text-lg font-black text-rose-700">{daysToGo} {daysToGo === 1 ? 'Day' : 'Days'} Left</p>
                </div>
              </div>
            )}

            <div className="bg-[#1a1614] px-5 py-3 rounded-2xl border border-[#3f332c] flex items-center space-x-3 flex-1 md:flex-initial min-w-[180px]">
              <Target size={20} className="text-orange-500" />
              <div className="w-full">
                <div className="flex justify-between items-center text-[10px] font-bold text-orange-200/70 mb-1">
                  <span>YOUR PROGRESS</span>
                  <span className="text-orange-400 font-black">{overallProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#2a221f] rounded-full overflow-hidden border border-[#3f332c]">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. HIGHLIGHTED "Learn Fast" BOX & APP DESCRIPTION (Respects User Theme Settings) */}
        <div className={`p-6 rounded-2xl border space-y-3 relative overflow-hidden shadow-md transition-colors ${
          isLight 
            ? 'bg-amber-100/90 border-amber-300 text-slate-900' 
            : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
        }`}>
          <div className="flex items-center space-x-3">
            <span className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl border shadow-sm flex items-center space-x-1.5 ${
              isLight 
                ? 'bg-amber-500 text-slate-950 border-amber-400' 
                : 'bg-orange-600/20 text-orange-400 border-orange-500/30'
            }`}>
              <BookOpen size={14} className={isLight ? 'text-slate-950' : 'text-orange-400'} />
              <span>Learn Fast</span>
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-amber-900' : 'text-orange-200/70'}`}>
              Guide to Memory Shaastra
            </span>
          </div>

          <div className={`text-xs sm:text-sm leading-relaxed space-y-2 ${isLight ? 'text-slate-800' : 'text-orange-100/80'}`}>
            <p className="font-semibold">
              <strong>Memory Shaastra</strong> is your intelligent cognitive study companion built on proven memory sciences—Spaced Repetition (SM-2 intervals), Active Recall, Memory Palaces, and Mnemonics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className={`p-2.5 rounded-xl border flex items-center space-x-2 shadow-sm font-medium ${
                isLight ? 'bg-white text-slate-800 border-amber-200' : 'bg-[#2a221f] text-orange-100 border-[#3f332c]'
              }`}>
                <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                <span>1. Use <strong>Study Now</strong> for Monk Mode focus</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center space-x-2 shadow-sm font-medium ${
                isLight ? 'bg-white text-slate-800 border-amber-200' : 'bg-[#2a221f] text-orange-100 border-[#3f332c]'
              }`}>
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>2. Warm up with <strong>Daily Boost</strong></span>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center space-x-2 shadow-sm font-medium ${
                isLight ? 'bg-white text-slate-800 border-amber-200' : 'bg-[#2a221f] text-orange-100 border-[#3f332c]'
              }`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>3. Build Palaces & Mnemonics for instant recall</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S STUDY SCHEDULE & REVISIONS SECTION */}
      <div className="bg-[#2a221f] p-6 sm:p-8 rounded-3xl border border-[#3f332c] space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#3f332c] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#fef3c7] tracking-tight">Today's Study Schedule</h2>
              <p className="text-xs text-orange-200/60">Your active tasks and spaced revisions due today ({new Date().toLocaleDateString()})</p>
            </div>
          </div>
          <button 
            onClick={() => setView('planner')}
            className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-xs font-bold rounded-xl border border-orange-500/30 transition-all flex items-center space-x-1.5"
          >
            <span>Manage Schedule</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {todayTasks.length === 0 && todayRevisions.length === 0 ? (
          <div className="p-6 bg-[#1a1614] rounded-2xl border border-[#3f332c] text-center space-y-3">
            <p className="text-xs text-orange-200/70 font-semibold">No specific tasks or revisions set for today.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => setView('planner')}
                className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-orange-700 transition-all"
              >
                + Add Task to Schedule
              </button>
              <button 
                onClick={() => setView('focus')}
                className="px-4 py-2 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-600/30 transition-all flex items-center space-x-1.5"
              >
                <Play size={14} />
                <span>Start Unscheduled Study Session</span>
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
                    <span className="text-[10px] text-orange-200/50 font-bold">{task.durationMinutes} mins</span>
                  </div>
                  <h4 className="font-bold text-sm text-orange-100">{task.topic}</h4>
                </div>
                <button
                  onClick={() => handleStudyNow(task.topic, task.durationMinutes)}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0 flex items-center space-x-1.5 active:scale-95"
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
                    <span className="text-[10px] text-orange-200/50 font-bold">{rev.durationMinutes || 15} mins</span>
                  </div>
                  <h4 className="font-bold text-sm text-orange-100">{rev.itemTitle}</h4>
                </div>
                <button
                  onClick={() => handleStudyNow(rev.itemTitle, rev.durationMinutes || 15)}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0 flex items-center space-x-1.5 active:scale-95"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Study Now</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MEMORY SKILLS SECTION WITH SEARCH FACILITY */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3f332c] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/20">
              <Brain size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#fef3c7] tracking-tight">Memory Techniques</h2>
              <p className="text-xs text-orange-200/60">Search & access tools to encode, retain, and recall complex information</p>
            </div>
          </div>

          {/* SEARCH FACILITY FOR MEMORY SKILLS */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400/60" />
            <input 
              type="text"
              value={skillSearch}
              onChange={e => setSkillSearch(e.target.value)}
              placeholder="Search memory techniques..."
              className="w-full bg-[#1a1614] border border-[#3f332c] text-xs py-2.5 pl-10 pr-4 rounded-2xl text-[#fef3c7] focus:outline-none focus:border-orange-500 font-medium"
            />
            {skillSearch && (
              <button 
                onClick={() => setSkillSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-orange-200/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 6 Memory Skill Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => {
            const Icon = skill.icon;
            return (
              <motion.button
                key={skill.id}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(skill.id as any)}
                className="p-5 bg-[#2a221f] hover:bg-[#342a27] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 text-left transition-all space-y-3 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl border ${skill.bgClass} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-orange-300 bg-orange-600/20 px-3 py-1 rounded-full border border-orange-500/20">
                    {skill.count}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#fef3c7] group-hover:text-orange-400 transition-colors">{skill.title}</h3>
                  <p className="text-xs text-orange-200/60 mt-1">{skill.desc}</p>
                </div>
              </motion.button>
            );
          })}

          {filteredSkills.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-orange-200/40">
              No memory skills found matching "{skillSearch}".
            </div>
          )}
        </div>
      </div>

      {/* 5. CORE APP SECTIONS & FACILITIES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#3f332c] pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#fef3c7] tracking-tight">Study Facilities & Planning</h2>
              <p className="text-xs text-orange-200/60">Organize your study calendar, focus sessions, and library</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Calendar Section */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('calendar')}
            className="p-6 bg-[#2a221f] hover:bg-[#342a27] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 text-left transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-600/20 text-orange-400 rounded-2xl border border-orange-500/30 group-hover:scale-110 transition-transform">
                <CalendarIcon size={24} />
              </div>
              <ChevronRight size={20} className="text-orange-200/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#fef3c7] group-hover:text-orange-400 transition-colors">Calendar</h3>
              <p className="text-xs text-orange-200/60 mt-1">Automatic 1d, 3d, 7d, 14d, 30d revision tasks and activity log.</p>
            </div>
          </motion.button>

          {/* Study Schedule */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('planner')}
            className="p-6 bg-[#2a221f] hover:bg-[#342a27] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 text-left transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <ChevronRight size={20} className="text-orange-200/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#fef3c7] group-hover:text-orange-400 transition-colors">Study Schedule</h3>
              <p className="text-xs text-orange-200/60 mt-1">Searchable topic roadmap with direct "Study Now" focus timer integration.</p>
            </div>
          </motion.button>

          {/* Exam Planning */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('exam-mode')}
            className="p-6 bg-[#2a221f] hover:bg-[#342a27] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 text-left transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>
              <ChevronRight size={20} className="text-orange-200/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#fef3c7] group-hover:text-orange-400 transition-colors">Exam Planning</h3>
              <p className="text-xs text-orange-200/60 mt-1">Syllabus breakdown, phases, and subject completion tracking.</p>
            </div>
          </motion.button>

          {/* Personal Library */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('library')}
            className="p-6 bg-[#2a221f] hover:bg-[#342a27] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 text-left transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <ChevronRight size={20} className="text-orange-200/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#fef3c7] group-hover:text-orange-400 transition-colors">Personal Library</h3>
              <p className="text-xs text-orange-200/60 mt-1">Searchable document vault with easy 3-step category reader.</p>
            </div>
          </motion.button>

          {/* Study Timer */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('focus')}
            className="p-6 bg-[#2a221f] hover:bg-[#342a27] rounded-3xl border border-[#3f332c] hover:border-orange-500/50 text-left transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-violet-500/10 text-violet-400 rounded-2xl border border-violet-500/20 group-hover:scale-110 transition-transform">
                <Timer size={24} />
              </div>
              <ChevronRight size={20} className="text-orange-200/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#fef3c7] group-hover:text-orange-400 transition-colors">Study Timer</h3>
              <p className="text-xs text-orange-200/60 mt-1">Distraction-free focus timer with customizable minutes.</p>
            </div>
          </motion.button>

          {/* Download Progress Word Doc */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadDoc}
            className="p-6 bg-gradient-to-br from-orange-600 to-amber-700 text-white rounded-3xl border border-orange-500/30 text-left transition-all space-y-3 group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
                <Download size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded-full">
                Real-Time .docx
              </span>
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Download Progress</h3>
              <p className="text-xs text-white/80 mt-1">Export complete study stats & memory skills in a Word document.</p>
            </div>
          </motion.button>

        </div>
      </div>

    </div>
  );
};
