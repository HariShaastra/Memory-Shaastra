import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '../firebase';
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
  StudyMaterial,
  AppNotification,
  MemoryLink,
  ActivityEvent,
  ScheduledRevisionTask
} from '../types';
import { calculateSM2 } from '../utils/learningScience';

interface ActiveFocusTask {
  title: string;
  durationMinutes: number;
  taskId?: string;
  subject?: string;
}

interface PersonalizationSettings {
  targetExamName: string;
  targetExamDate: string;
  focusSubject: string;
  dailyStudyGoalHours: number;
}

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
  memoryLinks: MemoryLink[];
  addMemoryLink: (sourceId: string, sourceType: MemoryLink['sourceType'], targetId: string, targetType: MemoryLink['targetType']) => void;
  removeMemoryLink: (id: string) => void;
  rateRecall: (id: string, type: 'flashcard' | 'revision', performance: 'forgot' | 'partial' | 'remembered' | 1 | 2 | 3 | 4) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Subjects & Auto Schedule
  allSubjects: string[];
  getChaptersForSubject: (subjectName?: string) => string[];
  autoCreateSM2ScheduleForSubject: (subjectName: string, examDate?: string) => void;
  signOutUser: () => Promise<void>;

  // Calendar & Spaced Revision
  activityEvents: ActivityEvent[];
  scheduledRevisions: ScheduledRevisionTask[];
  revisionIntervals: number[];
  updateRevisionIntervals: (newIntervals: number[]) => void;
  logActivity: (
    title: string, 
    type: ActivityEvent['type'], 
    itemId?: string, 
    description?: string,
    durationMinutes?: number
  ) => void;
  toggleScheduledRevision: (id: string) => void;
  deleteScheduledRevision: (id: string) => void;

  // Study Now Direct Focus Timer
  activeFocusTask: ActiveFocusTask | null;
  setActiveFocusTask: React.Dispatch<React.SetStateAction<ActiveFocusTask | null>>;
  startStudyNow: (taskTitle: string, durationMinutes?: number, subject?: string) => void;

  // Personalization
  personalization: PersonalizationSettings;
  setPersonalization: React.Dispatch<React.SetStateAction<PersonalizationSettings>>;

  // Real-time Overall Progress
  overallProgress: number;

  // Notifications
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  addNotification: (title: string, message: string, type?: AppNotification['type'], priority?: AppNotification['priority']) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ms_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const uData: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Learner',
          photoUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`
        };
        setUser(uData);
        localStorage.setItem('ms_user', JSON.stringify(uData));
      }
    });
    return () => unsubscribe();
  }, []);

  // Inactivity auto sign-out timer (60 minutes)
  useEffect(() => {
    if (!user) return;
    let timeoutId: any;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOutUser();
      }, 3600000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [user]);
  
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ms_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    localStorage.setItem('ms_theme', t);
    if (t === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);
  
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

  // Editable Revision Intervals (default: 1 day, 3 days, 7 days, 14 days, 30 days)
  const [revisionIntervals, setRevisionIntervals] = useState<number[]>(() => {
    const saved = localStorage.getItem('ms_revision_intervals');
    return saved ? JSON.parse(saved) : [1, 3, 7, 14, 30];
  });

  // Calendar Activity Events
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem('ms_activity_events');
    return saved ? JSON.parse(saved) : [
      { id: 'a1', title: 'Created Flashcard Deck', type: 'flashcard', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Active Recall & Spaced Repetition' },
      { id: 'a2', title: 'Created Mnemonic: Order of Planets', type: 'mnemonic', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), description: 'My Very Educated Mother Just Served Us Noodles' }
    ];
  });

  // Scheduled Revision Tasks (Intervals 1, 3, 7, 14, 30 days)
  const [scheduledRevisions, setScheduledRevisions] = useState<ScheduledRevisionTask[]>(() => {
    const saved = localStorage.getItem('ms_scheduled_revisions');
    if (saved) return JSON.parse(saved);

    // Initial default scheduled items for immediate usage
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const day1 = new Date(today); day1.setDate(today.getDate() + 1);
    const day3 = new Date(today); day3.setDate(today.getDate() + 3);
    const day7 = new Date(today); day7.setDate(today.getDate() + 7);

    return [
      {
        id: 'sr1',
        activityId: 'a1',
        itemTitle: 'Flashcards: Active Recall & Spaced Repetition',
        itemType: 'flashcard',
        dueDate: formatDate(today),
        intervalDays: 1,
        completed: false,
        durationMinutes: 15
      },
      {
        id: 'sr2',
        activityId: 'a2',
        itemTitle: 'Mnemonic: Order of Planets',
        itemType: 'mnemonic',
        dueDate: formatDate(day1),
        intervalDays: 3,
        completed: false,
        durationMinutes: 10
      },
      {
        id: 'sr3',
        activityId: 'a1',
        itemTitle: 'Flashcards: Key Memory Science',
        itemType: 'flashcard',
        dueDate: formatDate(day3),
        intervalDays: 7,
        completed: false,
        durationMinutes: 20
      }
    ];
  });

  // Focus Timer active task
  const [activeFocusTask, setActiveFocusTask] = useState<ActiveFocusTask | null>(null);

  // Personalization settings
  const [personalization, setPersonalization] = useState<PersonalizationSettings>(() => {
    const saved = localStorage.getItem('ms_personalization');
    return saved ? JSON.parse(saved) : {
      targetExamName: '',
      targetExamDate: '',
      focusSubject: '',
      dailyStudyGoalHours: 3
    };
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('ms_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'n1',
        title: 'Welcome to Shaastra Mind',
        message: 'Master memory techniques, spaced repetition, and exam revision with ease!',
        type: 'achievement',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: 'n2',
        title: 'Daily Study Habit',
        message: 'Complete 15 minutes of active recall today to strengthen your recall retention!',
        type: 'motivational',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        priority: 'medium'
      }
    ];
  });

  const addNotification = (
    title: string, 
    message: string, 
    type: AppNotification['type'] = 'reminder', 
    priority: AppNotification['priority'] = 'medium'
  ) => {
    const newNotif: AppNotification = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      priority
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Other Core Data State
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('ms_study_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 'st1', subject: 'Economics', topic: 'Monetary Policy & Inflation Rates', plannedDate: new Date().toISOString().split('T')[0], estimatedTime: '30 mins', completed: false },
      { id: 'st2', subject: 'Memory Science', topic: 'Loci Visualizations & Mind Palaces', plannedDate: new Date().toISOString().split('T')[0], estimatedTime: '25 mins', completed: true }
    ];
  });

  const [mnemonics, setMnemonics] = useState<Mnemonic[]>(() => {
    const saved = localStorage.getItem('ms_mnemonics');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Order of Planets', phrase: 'My Very Educated Mother Just Served Us Noodles' },
      { id: '2', title: 'Taxonomy Ranks', phrase: 'Dear King Philip Came Over For Good Soup' },
    ];
  });

  const [memoryPalaces, setMemoryPalaces] = useState<MemoryPalace[]>(() => {
    const saved = localStorage.getItem('ms_memory_palaces');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'p1', 
        name: 'Grand Living Room', 
        locations: [
          { id: 'l1', name: 'Front Entrance Door', concept: 'Photosynthesis Phase I' },
          { id: 'l2', name: 'Center Foyer Sofa', concept: 'Calvin Cycle Enzyme Step' }
        ] 
      }
    ];
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
      { id: '2', question: 'Explain Spaced Repetition.', answer: 'Reviewing information at increasing intervals (1, 3, 7, 14, 30 days) to prevent forgetting.', difficulty: 'easy', nextReview: new Date().toISOString(), interval: 0, easeFactor: 2.5 },
    ];
  });

  const [revisions, setRevisions] = useState<Revision[]>(() => {
    const saved = localStorage.getItem('ms_revisions');
    return saved ? JSON.parse(saved) : [];
  });

  const [examPlans, setExamPlans] = useState<ExamPlan[]>(() => {
    const saved = localStorage.getItem('ms_exam_plans');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ep1',
        title: 'CA Inter Exam Plan',
        examDate: '2026-04-30',
        isActive: true,
        subjects: [
          {
            id: 'es1',
            name: 'Advanced Accounts',
            chapters: [
              {
                id: 'ec1',
                name: 'Accounting Standards & Financial Statements',
                completed: false,
                topics: [
                  {
                    id: 'et1',
                    name: 'AS-15 Employee Benefits & AS-28 Impairment',
                    completed: false,
                    subTopics: [
                      { id: 'est1', name: 'Actuarial Valuations & Defined Benefits', completed: true },
                      { id: 'est2', name: 'Cash Generating Units (CGU) Valuation', completed: false }
                    ]
                  }
                ]
              },
              {
                id: 'ec2',
                name: 'Consolidated Financial Statements',
                completed: false,
                topics: [
                  {
                    id: 'et2',
                    name: 'Holding & Subsidiary Companies Equity',
                    completed: false,
                    subTopics: [
                      { id: 'est3', name: 'Non-Controlling Interest (NCI) Calculation', completed: false }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'es2',
            name: 'Corporate & Other Laws',
            chapters: [
              {
                id: 'ec3',
                name: 'Companies Act, 2013',
                completed: false,
                topics: [
                  {
                    id: 'et3',
                    name: 'Management & Administration',
                    completed: false,
                    subTopics: [
                      { id: 'est4', name: 'Annual General Meeting (AGM) Rules', completed: true },
                      { id: 'est5', name: 'Board Meeting Quorum & Resolutions', completed: false }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'es3',
            name: 'Taxation & GST',
            chapters: [
              {
                id: 'ec4',
                name: 'Goods & Services Tax (GST)',
                completed: false,
                topics: [
                  {
                    id: 'et4',
                    name: 'Input Tax Credit (ITC) Mechanism',
                    completed: false,
                    subTopics: [
                      { id: 'est6', name: 'Blocked Credits under Sec 17(5)', completed: false }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        phases: [],
        revisionSchedule: []
      }
    ];
  });

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('ms_study_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [memoryLinks, setMemoryLinks] = useState<MemoryLink[]>(() => {
    const saved = localStorage.getItem('ms_memory_links');
    return saved ? JSON.parse(saved) : [];
  });

  // Calendar Activity & Spaced Revision Logger
  const logActivity = (
    title: string, 
    type: ActivityEvent['type'], 
    itemId?: string, 
    description?: string,
    durationMinutes: number = 20
  ) => {
    const newActivity: ActivityEvent = {
      id: 'act_' + Math.random().toString(36).substr(2, 9),
      title,
      type,
      itemId,
      createdAt: new Date().toISOString(),
      description
    };

    setActivityEvents(prev => [newActivity, ...prev]);

    // Automatically create To-Do revision tasks for each interval
    const creationDate = new Date();
    const newScheduledTasks: ScheduledRevisionTask[] = revisionIntervals.map(intervalDays => {
      const dueDateObj = new Date(creationDate);
      dueDateObj.setDate(creationDate.getDate() + intervalDays);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      return {
        id: 'rev_' + Math.random().toString(36).substr(2, 9),
        activityId: newActivity.id,
        itemTitle: `Revise (${intervalDays}d): ${title}`,
        itemType: type,
        itemId,
        dueDate,
        intervalDays,
        completed: false,
        durationMinutes
      };
    });

    setScheduledRevisions(prev => [...newScheduledTasks, ...prev]);
  };

  // Update intervals and auto update future pending schedules
  const updateRevisionIntervals = (newIntervals: number[]) => {
    const sorted = [...newIntervals].sort((a, b) => a - b);
    setRevisionIntervals(sorted);
    localStorage.setItem('ms_revision_intervals', JSON.stringify(sorted));
  };

  const toggleScheduledRevision = (id: string) => {
    setScheduledRevisions(prev => prev.map(task => {
      if (task.id === id) {
        const nextState = !task.completed;
        return {
          ...task,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined
        };
      }
      return task;
    }));
  };

  const deleteScheduledRevision = (id: string) => {
    setScheduledRevisions(prev => prev.filter(task => task.id !== id));
  };

  const updateScheduledRevision = (id: string, updated: Partial<ScheduledRevisionTask>) => {
    setScheduledRevisions(prev => prev.map(task => task.id === id ? { ...task, ...updated } : task));
  };

  const addScheduledRevision = (taskData: Partial<ScheduledRevisionTask>) => {
    const newTask: ScheduledRevisionTask = {
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      activityId: 'custom_' + Date.now(),
      itemTitle: taskData.itemTitle || 'Revision Task',
      itemType: taskData.itemType || 'study-task',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      intervalDays: taskData.intervalDays || 1,
      completed: false,
      durationMinutes: taskData.durationMinutes || 20
    };
    setScheduledRevisions(prev => [newTask, ...prev]);
  };

  // Helper for all subjects across Exam Plans, Tasks, Flashcards, Materials
  const allSubjects = React.useMemo(() => {
    const set = new Set<string>([
      'Economics & Policy',
      'Cognitive Psychology',
      'General Science',
      'Memory Science'
    ]);

    examPlans.forEach(plan => {
      plan.subjects?.forEach(sub => {
        if (sub.name) set.add(sub.name);
      });
    });

    studyTasks.forEach(t => {
      if (t.subject) set.add(t.subject);
    });

    flashcards.forEach(f => {
      if (f.subject) set.add(f.subject);
    });

    studyMaterials.forEach(m => {
      if (m.subject) set.add(m.subject);
    });

    if (personalization.focusSubject) set.add(personalization.focusSubject);

    return Array.from(set).filter(Boolean);
  }, [examPlans, studyTasks, flashcards, studyMaterials, personalization.focusSubject]);

  const getChaptersForSubject = React.useCallback((subjectName?: string) => {
    if (!subjectName) return [];
    const chaptersSet = new Set<string>();

    examPlans.forEach(plan => {
      plan.subjects?.forEach(sub => {
        if (sub.name.toLowerCase().trim() === subjectName.toLowerCase().trim()) {
          sub.chapters?.forEach(chap => {
            if (chap.name) chaptersSet.add(chap.name);
          });
        }
      });
    });

    studyMaterials.forEach(mat => {
      if (mat.subject?.toLowerCase().trim() === subjectName.toLowerCase().trim() && mat.subGroup) {
        chaptersSet.add(mat.subGroup);
      }
    });

    return Array.from(chaptersSet);
  }, [examPlans, studyMaterials]);

  // Auto Create SM-2 Revision Schedule Entries when a subject is added/updated in Exam Planning
  const autoCreateSM2ScheduleForSubject = (subjectName: string, examDate?: string) => {
    if (!subjectName || !subjectName.trim()) return;
    const cleanName = subjectName.trim();

    // SM-2 Spaced Repetition Intervals: 1, 6, 14, 30 days
    const intervals = [1, 6, 14, 30];
    const today = new Date();

    const newTasks: ScheduledRevisionTask[] = intervals.map(days => {
      const dueDateObj = new Date(today);
      dueDateObj.setDate(today.getDate() + days);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      return {
        id: 'sm2_' + Math.random().toString(36).substr(2, 9),
        activityId: 'exam_sub_' + Math.random().toString(36).substr(2, 7),
        itemTitle: `[SM-2 Spaced Rev] ${cleanName} (Interval Day ${days})`,
        itemType: 'study-task',
        dueDate,
        intervalDays: days,
        completed: false,
        durationMinutes: 25
      };
    });

    setScheduledRevisions(prev => [...newTasks, ...prev]);
    addNotification(
      'SM-2 Schedule Generated',
      `Created SM-2 spaced repetition study schedule for "${cleanName}" (Days 1, 6, 14, 30).`,
      'exam'
    );
  };

  const signOutUser = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout error', err);
    }
    setUser(null);
    localStorage.removeItem('ms_user');
    addNotification('Signed Out', 'You have logged out successfully.');
  };

  // Launch Focus Mode with task context
  const startStudyNow = (taskTitle: string, durationMinutes: number = 25, subject?: string) => {
    setActiveFocusTask({
      title: taskTitle,
      durationMinutes,
      subject
    });
    setView('focus');
  };

  // Calculate Real-time Overall Progress
  const [overallProgress, setOverallProgress] = useState<number>(0);

  useEffect(() => {
    let totalItems = 0;
    let completedItems = 0;

    // 1. Study tasks
    studyTasks.forEach(t => {
      totalItems++;
      if (t.completed) completedItems++;
    });

    // 2. Scheduled Revisions
    scheduledRevisions.forEach(r => {
      totalItems++;
      if (r.completed) completedItems++;
    });

    // 3. Exam Plans Subtopics
    examPlans.forEach(plan => {
      plan.subjects.forEach(sub => {
        sub.chapters.forEach(chap => {
          chap.topics.forEach(top => {
            top.subTopics.forEach(st => {
              totalItems++;
              if (st.completed) completedItems++;
            });
          });
        });
      });
    });

    if (totalItems === 0) {
      setOverallProgress(100);
    } else {
      const pct = Math.round((completedItems / totalItems) * 100);
      setOverallProgress(pct);
    }
  }, [studyTasks, scheduledRevisions, examPlans]);

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

  const rateRecall = (id: string, type: 'flashcard' | 'revision', performance: 'forgot' | 'partial' | 'remembered' | 1 | 2 | 3 | 4) => {
    if (type === 'flashcard') {
      setFlashcards(prev => prev.map(card => {
        if (card.id !== id) return card;
        
        let score: 1 | 2 | 3 | 4 = 3;
        if (typeof performance === 'number') {
          score = performance;
        } else {
          if (performance === 'forgot') score = 1;
          else if (performance === 'partial') score = 2;
          else score = 4;
        }

        const result = calculateSM2(card, score);
        return { ...card, ...result };
      }));
    }
  };

  // Persisting to Local Storage
  useEffect(() => {
    localStorage.setItem('ms_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ms_revision_intervals', JSON.stringify(revisionIntervals));
  }, [revisionIntervals]);

  useEffect(() => {
    localStorage.setItem('ms_activity_events', JSON.stringify(activityEvents));
  }, [activityEvents]);

  useEffect(() => {
    localStorage.setItem('ms_scheduled_revisions', JSON.stringify(scheduledRevisions));
  }, [scheduledRevisions]);

  useEffect(() => {
    localStorage.setItem('ms_personalization', JSON.stringify(personalization));
  }, [personalization]);

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
    localStorage.setItem('ms_memory_links', JSON.stringify(memoryLinks));
  }, [memoryLinks]);

  useEffect(() => {
    localStorage.setItem('ms_notifications', JSON.stringify(notifications));
  }, [notifications]);

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
      memoryLinks, addMemoryLink, removeMemoryLink, rateRecall,
      theme, setTheme,
      allSubjects,
      getChaptersForSubject,
      autoCreateSM2ScheduleForSubject,
      signOutUser,
      activityEvents,
      scheduledRevisions,
      revisionIntervals,
      updateRevisionIntervals,
      logActivity,
      toggleScheduledRevision,
      deleteScheduledRevision,
      updateScheduledRevision,
      addScheduledRevision,
      activeFocusTask,
      setActiveFocusTask,
      startStudyNow,
      personalization,
      setPersonalization,
      overallProgress,
      notifications,
      setNotifications,
      addNotification,
      markAsRead,
      clearAllNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

const handleFileUpload = async (file: File): Promise<FileAttachment> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : (file.type.split('/')[0] as any),
        url: reader.result as string,
        size: file.size
      });
    };
    reader.onerror = () => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : (file.type.split('/')[0] as any),
        url: URL.createObjectURL(file),
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  });
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export const useAppContext = useApp;
