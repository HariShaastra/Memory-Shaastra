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
  StudyMaterial
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ms_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [viewHistory, setViewHistory] = useState<AppView[]>(['focus']);
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
      gamification, addXP, level, updateStreak, unlockBadge
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
