import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  AppView, 
  StudyTask, 
  FirstLetterAid, 
  ExamPlan, 
  FileAttachment, 
  Mnemonic, 
  MemoryPalace, 
  LinkChain, 
  Flashcard, 
  Revision,
  GamificationState,
  Level,
  Badge,
  StudyMaterial,
  AppNotification,
  MemoryLink
} from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentView: AppView;
  setView: (view: AppView) => void;
  goBack: () => void;
  studyTasks: StudyTask[];
  setStudyTasks: React.Dispatch<React.SetStateAction<StudyTask[]>>;
  mnemonics: Mnemonic[];
  setMnemonics: React.Dispatch<React.SetStateAction<Mnemonic[]>>;
  memoryPalaces: MemoryPalace[];
  setMemoryPalaces: React.Dispatch<React.SetStateAction<MemoryPalace[]>>;
  linkChains: LinkChain[];
  setLinkChains: React.Dispatch<React.SetStateAction<LinkChain[]>>;
  storyChains: LinkChain[];
  setStoryChains: React.Dispatch<React.SetStateAction<LinkChain[]>>;
  firstLetterEntries: FirstLetterAid[];
  setFirstLetterEntries: React.Dispatch<React.SetStateAction<FirstLetterAid[]>>;
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  revisions: Revision[];
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>;
  examPlans: ExamPlan[];
  setExamPlans: React.Dispatch<React.SetStateAction<ExamPlan[]>>;
  studyMaterials: StudyMaterial[];
  setStudyMaterials: React.Dispatch<React.SetStateAction<StudyMaterial[]>>;
  handleFileUpload: (file: File) => Promise<FileAttachment>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gamification: GamificationState;
  addXP: (amount: number) => void;
  level: Level;
  updateStreak: () => void;
  unlockBadge: (badge: Badge) => void;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  memoryLinks: MemoryLink[];
  addMemoryLink: (sourceId: string, sourceType: MemoryLink['sourceType'], targetId: string, targetType: MemoryLink['targetType']) => void;
  removeMemoryLink: (id: string) => void;
  rateRecall: (id: string, type: 'flashcard' | 'revision', performance: 'forgot' | 'partial' | 'remembered') => void;
  optimizeRevisionForExams: () => void;
  triggerRandomRecallNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ms_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [viewHistory, setViewHistory] = useState<AppView[]>(['dashboard']);
  const currentView = viewHistory[viewHistory.length - 1];

  const setView = (view: AppView) => {
    if (view === currentView) return;
    setViewHistory(prev => [...prev, view]);
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      setViewHistory(prev => prev.slice(0, -1));
    }
  };

  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('ms_study_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [mnemonics, setMnemonics] = useState<Mnemonic[]>(() => {
    const saved = localStorage.getItem('ms_mnemonics');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Order of Planets', phrase: 'My Very Educated Mother Just Served Us Noodles' },
      { id: '2', title: 'Taxonomy', phrase: 'Dear King Philip Came Over For Good Soup' },
    ];
  });

  const [memoryPalaces, setMemoryPalaces] = useState<MemoryPalace[]>(() => {
    const saved = localStorage.getItem('ms_memory_palaces');
    return saved ? JSON.parse(saved) : [];
  });

  const [linkChains, setLinkChains] = useState<LinkChain[]>(() => {
    const saved = localStorage.getItem('ms_link_chains');
    return saved ? JSON.parse(saved) : [];
  });

  const [storyChains, setStoryChains] = useState<LinkChain[]>(() => {
    const saved = localStorage.getItem('ms_story_chains');
    return saved ? JSON.parse(saved) : [];
  });

  const [firstLetterEntries, setFirstLetterEntries] = useState<FirstLetterAid[]>(() => {
    const saved = localStorage.getItem('ms_first_letter');
    return saved ? JSON.parse(saved) : [];
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('ms_flashcards');
    return saved ? JSON.parse(saved) : [
      { id: '1', question: 'What is Active Recall?', answer: 'A learning technique that involves testing yourself on information to strengthen memory pathways.', difficulty: 'medium', nextReview: new Date().toISOString(), interval: 0, easeFactor: 2.5 },
      { id: '2', question: 'Explain Spaced Repetition.', answer: 'Reviewing information at increasing intervals (1, 2, 5, 15, 30 days) to prevent forgetting.', difficulty: 'easy', nextReview: new Date().toISOString(), interval: 0, easeFactor: 2.5 },
    ];
  });

  const [revisions, setRevisions] = useState<Revision[]>(() => {
    const saved = localStorage.getItem('ms_revisions');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        subject: 'Economics', 
        chapter: 'Monetary Policy', 
        dateStudied: new Date().toISOString(),
        examDate: '2026-05-15',
        completedDates: [],
        nextRevision: new Date(Date.now() + 86400000).toISOString()
      },
    ];
  });

  const [examPlans, setExamPlans] = useState<ExamPlan[]>(() => {
    const saved = localStorage.getItem('ms_exam_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('ms_study_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [gamification, setGamification] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('ms_gamification');
    return saved ? JSON.parse(saved) : {
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      badges: []
    };
  });

  const level = ((): Level => {
    const { xp } = gamification;
    if (xp < 500) return 'Beginner';
    if (xp < 1500) return 'Sharp Learner';
    if (xp < 3000) return 'Memory Master';
    return 'Shaastra Sage';
  })();

  const addXP = (amount: number) => {
    setGamification(prev => ({ ...prev, xp: prev.xp + amount }));
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = gamification.lastActiveDate;

    if (lastActive === today) return;

    const lastDate = lastActive ? new Date(lastActive) : null;
    const tomorrow = lastDate ? new Date(lastDate) : null;
    if (tomorrow) tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isConsecutive = tomorrow && tomorrow.toISOString().split('T')[0] === today;

    setGamification(prev => ({
      ...prev,
      lastActiveDate: today,
      streak: isConsecutive ? prev.streak + 1 : 1
    }));
  };

  const unlockBadge = (badge: Badge) => {
    if (gamification.badges.find(b => b.id === badge.id)) return;
    setGamification(prev => ({
      ...prev,
      badges: [...prev.badges, { ...badge, unlockedAt: new Date().toISOString() }]
    }));
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('ms_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const addNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const [memoryLinks, setMemoryLinks] = useState<MemoryLink[]>(() => {
    const saved = localStorage.getItem('ms_memory_links');
    return saved ? JSON.parse(saved) : [];
  });

  const addMemoryLink = (sourceId: string, sourceType: MemoryLink['sourceType'], targetId: string, targetType: MemoryLink['targetType']) => {
    const alreadyConnected = memoryLinks.some(l => 
      (l.sourceId === sourceId && l.targetId === targetId) ||
      (l.sourceId === targetId && l.targetId === sourceId)
    );
    if (alreadyConnected || sourceId === targetId) return;

    const newLink: MemoryLink = {
      id: Math.random().toString(36).substr(2, 9),
      sourceId,
      sourceType,
      targetId,
      targetType
    };
    setMemoryLinks(prev => [...prev, newLink]);
  };

  const removeMemoryLink = (id: string) => {
    setMemoryLinks(prev => prev.filter(l => l.id !== id));
  };

  const rateRecall = (id: string, type: 'flashcard' | 'revision', performance: 'forgot' | 'partial' | 'remembered') => {
    const today = new Date().toISOString();
    
    let earnedXP = 15;
    if (performance === 'partial') earnedXP = 30;
    if (performance === 'remembered') earnedXP = 60;
    addXP(earnedXP);
    updateStreak();

    if (type === 'flashcard') {
      setFlashcards(prev => prev.map(card => {
        if (card.id !== id) return card;
        
        let interval = card.interval || 1;
        let easeFactor = card.easeFactor || 2.5;
        
        if (performance === 'forgot') {
          interval = 1;
          easeFactor = Math.max(1.3, easeFactor - 0.2);
        } else if (performance === 'partial') {
          interval = Math.ceil(interval * 1.3);
        } else {
          interval = Math.ceil(interval * easeFactor);
          easeFactor = Math.min(3.5, easeFactor + 0.15);
        }
        
        return {
          ...card,
          interval,
          easeFactor,
          nextReview: new Date(Date.now() + interval * 86400000).toISOString()
        };
      }));
    } else if (type === 'revision') {
      setRevisions(prev => prev.map(rev => {
        if (rev.id !== id) return rev;
        const currentCompleted = rev.completedDates || [];
        const completedCount = currentCompleted.length;
        
        const baseIntervals = [1, 3, 7, 14, 30, 60, 90];
        let nextIdx = completedCount;
        
        if (performance === 'forgot') {
          nextIdx = 0;
        } else if (performance === 'partial') {
          nextIdx = Math.max(0, completedCount - 1);
        } else {
          nextIdx = completedCount + 1;
        }
        
        const nextInterval = baseIntervals[Math.min(nextIdx, baseIntervals.length - 1)];
        return {
          ...rev,
          completedDates: [...currentCompleted, today],
          nextRevision: new Date(Date.now() + nextInterval * 86400000).toISOString()
        };
      }));
    }
  };

  const optimizeRevisionForExams = () => {
    const activePlan = examPlans.find(plan => plan.isActive) || examPlans[0];
    if (!activePlan?.examDate) return;

    const examDateVal = new Date(activePlan.examDate);
    const diffDays = Math.ceil((examDateVal.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 10) {
      setRevisions(prev => prev.map(rev => {
        const revDate = new Date(rev.nextRevision);
        if (revDate > examDateVal) {
          const optimizedDate = new Date(examDateVal.getTime() - (2 * 86400000));
          return { ...rev, nextRevision: optimizedDate.toISOString() };
        }
        return rev;
      }));

      setFlashcards(prev => prev.map(card => {
        const reviewDate = new Date(card.nextReview);
        if (reviewDate > examDateVal) {
          const optimizedDate = new Date(examDateVal.getTime() - (1 * 86400000));
          return { ...card, nextReview: optimizedDate.toISOString() };
        }
        return card;
      }));

      addNotification({
        title: "Exam Engine Active",
        message: `High-priority recall triggers activated! Schedule adjusted for ${activePlan.title}.`,
        type: 'exam',
        priority: 'high'
      });
    }
  };

  // Notification generation logic
  useEffect(() => {
    if (!user) return;

    const checkAndGenerate = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastCheckDate = localStorage.getItem('ms_last_notif_check');
      
      if (lastCheckDate === today) return; // Only check once per day

      const newNotifs: Omit<AppNotification, 'id' | 'timestamp' | 'read'>[] = [];

      // 1. Motivational Nudges for Inactivity
      const lastActive = gamification.lastActiveDate;
      if (lastActive) {
        const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActive >= 2) {
          newNotifs.push({
            title: "We miss you!",
            message: "Consistency is key to mastering any shaastra. Let's study for just 5 minutes today?",
            type: 'motivational',
            priority: 'high'
          });
        } else if (daysSinceActive === 0) {
           // Encouragement for regular users
           if (Math.random() > 0.8) {
             newNotifs.push({
               title: "Keep it up!",
               message: "You're doing great. Your brain is building stronger pathways every day.",
               type: 'motivational',
               priority: 'low'
             });
           }
        }
      }

      // 2. Exam Reminders
      examPlans.forEach(plan => {
        const examDate = new Date(plan.examDate);
        const daysUntilExam = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExam > 0 && daysUntilExam <= 7) {
          newNotifs.push({
            title: `Countdown: ${daysUntilExam} days to ${plan.title}`,
            message: "Review your priority topics and use the Focus Mode to polish your memory.",
            type: 'exam',
            priority: 'high'
          });
        }
      });

      // 3. Revision Reminders
      revisions.forEach(rev => {
        const nextRevDate = new Date(rev.nextRevision).toISOString().split('T')[0];
        if (nextRevDate === today) {
          newNotifs.push({
            title: "Revision Due",
            message: `Time to review ${rev.chapter} (${rev.subject}). Spaced repetition works magic!`,
            type: 'reminder',
            priority: 'medium'
          });
        }
      });

      newNotifs.forEach(n => addNotification(n));
      localStorage.setItem('ms_last_notif_check', today);
    };

    const timeout = setTimeout(checkAndGenerate, 3000); // Wait a bit after load
    return () => clearTimeout(timeout);
  }, [user, examPlans, revisions, gamification.lastActiveDate]);

  const triggerRandomRecallNotification = () => {
    const options: { title: string; message: string; type: 'reminder' | 'exam' | 'motivational' }[] = [];

    flashcards.forEach(f => {
      options.push({
        title: "Active Recall Challenge",
        message: `Can you recall: "${f.question}"? Head to Active Recall block to test yourself!`,
        type: 'reminder'
      });
    });

    mnemonics.forEach(m => {
      options.push({
        title: "Active Recall Challenge",
        message: `What is the trick phrase for: "${m.title}"? Give your brain a speed boost!`,
        type: 'reminder'
      });
    });

    studyMaterials.forEach(sm => {
      options.push({
        title: "Active Recall Challenge",
        message: `Recall summary concepts of downloaded archive: "${sm.title}".`,
        type: 'reminder'
      });
    });

    firstLetterEntries.forEach(fl => {
      options.push({
        title: "Active Recall Challenge",
        message: `What does the acronym word "${fl.word}" abbreviate to? Play back your memory now.`,
        type: 'reminder'
      });
    });

    if (options.length === 0) {
      options.push({
        title: "Active Recall Tip",
        message: "No memory items logged yet! Create flashcards, mnemonics, or library documents to get customized recall prompts.",
        type: 'motivational'
      });
    }

    const randomChoice = options[Math.floor(Math.random() * options.length)];
    addNotification({
      title: randomChoice.title,
      message: randomChoice.message,
      type: randomChoice.type,
      priority: 'high'
    });
  };

  // Also trigger a random notification on startup to populate it beautifully with random inputs
  useEffect(() => {
    if (user && (flashcards.length > 2 || mnemonics.length > 2 || studyMaterials.length > 0)) {
      const timeoutId = setTimeout(() => {
        triggerRandomRecallNotification();
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ms_user', JSON.stringify(user));
    if (user && currentView === 'auth') setView('dashboard');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ms_study_tasks', JSON.stringify(studyTasks));
  }, [studyTasks]);

  useEffect(() => {
    localStorage.setItem('ms_mnemonics', JSON.stringify(mnemonics));
  }, [mnemonics]);

  useEffect(() => {
    localStorage.setItem('ms_memory_palaces', JSON.stringify(memoryPalaces));
  }, [memoryPalaces]);

  useEffect(() => {
    localStorage.setItem('ms_link_chains', JSON.stringify(linkChains));
  }, [linkChains]);

  useEffect(() => {
    localStorage.setItem('ms_story_chains', JSON.stringify(storyChains));
  }, [storyChains]);

  useEffect(() => {
    localStorage.setItem('ms_first_letter', JSON.stringify(firstLetterEntries));
  }, [firstLetterEntries]);

  useEffect(() => {
    localStorage.setItem('ms_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('ms_revisions', JSON.stringify(revisions));
  }, [revisions]);

  useEffect(() => {
    localStorage.setItem('ms_exam_plans', JSON.stringify(examPlans));
  }, [examPlans]);

  useEffect(() => {
    localStorage.setItem('ms_study_materials', JSON.stringify(studyMaterials));
  }, [studyMaterials]);

  useEffect(() => {
    localStorage.setItem('ms_gamification', JSON.stringify(gamification));
  }, [gamification]);

  useEffect(() => {
    localStorage.setItem('ms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ms_memory_links', JSON.stringify(memoryLinks));
  }, [memoryLinks]);

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      currentView, setView, goBack,
      studyTasks, setStudyTasks,
      mnemonics, setMnemonics,
      memoryPalaces, setMemoryPalaces,
      linkChains, setLinkChains,
      storyChains, setStoryChains,
      firstLetterEntries, setFirstLetterEntries,
      flashcards, setFlashcards,
      revisions, setRevisions,
      examPlans, setExamPlans,
      studyMaterials, setStudyMaterials,
      handleFileUpload,
      isSidebarOpen, setIsSidebarOpen,
      gamification, addXP, level, updateStreak, unlockBadge,
      notifications, setNotifications, addNotification, markAsRead, clearAllNotifications,
      memoryLinks, addMemoryLink, removeMemoryLink, rateRecall, optimizeRevisionForExams,
      triggerRandomRecallNotification
    }}>
      {children}
    </AppContext.Provider>
  );
}

const handleFileUpload = async (file: File): Promise<FileAttachment> => {
  // Mock file upload
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.split('/')[0] as any,
        url: URL.createObjectURL(file),
        size: file.size
      });
    }, 1000);
  });
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export const useAppContext = useApp;
