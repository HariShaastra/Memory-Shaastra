import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartHandshake, 
  Sparkles, 
  Coffee, 
  Droplets, 
  Eye, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Smile, 
  Clock, 
  Check, 
  Settings2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const WellbeingCoachWidget: React.FC = () => {
  const { 
    wellbeingCoachEnabled, 
    setWellbeingCoachEnabled, 
    studySessionLogs, 
    streak, 
    flashcards, 
    theme 
  } = useAppContext();

  const isLight = theme === 'light';
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedNotice, setDismissedNotice] = useState(false);

  // Derive honest, real-time advice from real app user behavior
  const currentAdvice = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = studySessionLogs.filter(l => l.date === todayStr);
    const todayMins = todayLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

    if (todayMins >= 90) {
      return {
        tag: 'Pacing Check',
        icon: Coffee,
        iconColor: 'text-amber-500',
        message: `You've completed ${todayMins} mins of focused study today! Step away from the screen for 10 minutes to let your brain consolidate memories.`,
        tip: 'Long-term retention improves significantly when study intervals are followed by passive rest.'
      };
    }

    if (todayMins >= 45) {
      return {
        tag: 'Eye & Posture Break',
        icon: Eye,
        iconColor: 'text-sky-500',
        message: '45+ minutes of focus logged! Practice the 20-20-20 rule: Look at something 20 feet away for 20 seconds to ease eye strain.',
        tip: 'Hydrate with a glass of water before starting your next concept.'
      };
    }

    if (streak >= 3) {
      return {
        tag: 'Habit Rhythm',
        icon: Sparkles,
        iconColor: 'text-orange-500',
        message: `Great rhythm! You're on a ${streak}-day active study streak. 15-20 minutes of daily recall beats hours of weekend cramming.`,
        tip: 'Steady daily practice makes recall effortless on exam day.'
      };
    }

    return {
      tag: 'Mindful Study',
      icon: Droplets,
      iconColor: 'text-emerald-500',
      message: 'Welcome! Take a relaxed breath before starting. Focus on one concept at a time for optimal retention.',
      tip: 'Remember to drink water and study in short, dedicated sprints.'
    };
  }, [studySessionLogs, streak]);

  if (!wellbeingCoachEnabled) {
    return (
      <div className="w-full pt-4 pb-2 text-center">
        <button
          onClick={() => setWellbeingCoachEnabled(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
            isLight ? 'bg-orange-50 hover:bg-orange-100 text-stone-700 border-orange-200' : 'bg-[#1e1715] hover:bg-[#2e2320] text-orange-200 border-[#3f332c]'
          }`}
          title="Enable Study Wellbeing Coach"
        >
          <HeartHandshake size={13} className="text-rose-400" />
          <span>Show Wellbeing Coach Tip</span>
        </button>
      </div>
    );
  }

  const Icon = currentAdvice.icon;

  return (
    <aside aria-label="Wellbeing Coach" className="w-full mt-6 mb-2">
      <div className={`p-4 rounded-2xl border shadow-sm transition-all ${
        isLight 
          ? 'bg-amber-50/70 border-amber-200/80 text-stone-900' 
          : 'bg-[#241c19] border-[#3f332c] text-orange-100'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-500 border border-orange-500/30">
              <Icon size={14} className={currentAdvice.iconColor} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Wellbeing Coach
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/20">
                {currentAdvice.tag}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                isLight ? 'bg-white hover:bg-orange-50 text-stone-700 border-orange-200' : 'bg-[#181311] hover:bg-[#2c221e] text-orange-200 border-[#362923]'
              }`}
            >
              {isExpanded ? 'Show Less' : 'Details'}
            </button>
            <button
              onClick={() => setWellbeingCoachEnabled(false)}
              className="text-stone-400 hover:text-rose-500 font-bold px-1 cursor-pointer"
              title="Hide coach"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="text-xs font-medium leading-relaxed">
          {currentAdvice.message}
        </p>

        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-orange-500/15 text-[11px] space-y-1 text-stone-600 dark:text-orange-200/80">
            <p className="italic">💡 {currentAdvice.tip}</p>
            <p className="text-[10px] text-stone-700 dark:text-stone-300">
              Personalized based on active study session logs and streak history.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export const WellbeingCoachFooter = WellbeingCoachWidget;
