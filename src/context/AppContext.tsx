import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, onAuthStateChanged, signOut } from '../firebase';
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
  ScheduledRevisionTask,
  StudySessionLog,
  AdaptiveStudyConfig
} from '../types';
import { calculateSM2 } from '../utils/learningScience';
import { 
  DEMO_FLASHCARDS, 
  DEMO_MNEMONICS, 
  DEMO_PALACES, 
  DEMO_LINK_CHAINS, 
  DEMO_STORY_CHAINS, 
  DEMO_FIRST_LETTER, 
  DEMO_STUDY_TASKS, 
  DEMO_SCHEDULED_REVISIONS, 
  DEMO_EXAM_PLANS, 
  DEMO_STUDY_MATERIALS 
} from '../utils/cleanDemoData';

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
  setMemoryLinks: React.Dispatch<React.SetStateAction<MemoryLink[]>>;
  addMemoryLink: (sourceId: string, sourceType: MemoryLink['sourceType'], targetId: string, targetType: MemoryLink['targetType']) => void;
  removeMemoryLink: (id: string) => void;
  rateRecall: (id: string, type: 'flashcard' | 'revision', performance: 'forgot' | 'partial' | 'remembered' | 1 | 2 | 3 | 4) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Gamification & Streaks
  xp: number;
  streak: number;
  addXp: (amount: number) => void;
  updateStreak: () => void;

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
  updateScheduledRevision: (id: string, updated: Partial<ScheduledRevisionTask>) => void;
  addScheduledRevision: (taskData: Partial<ScheduledRevisionTask>) => void;

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
  addNotification: (
    titleOrObj: string | { title: string; message: string; type?: AppNotification['type']; priority?: AppNotification['priority'] }, 
    message?: string, 
    type?: AppNotification['type'], 
    priority?: AppNotification['priority']
  ) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Study Session Logs & History
  studySessionLogs: StudySessionLog[];
  addStudySessionLog: (log: Omit<StudySessionLog, 'id'>) => void;
  clearStudySessionLogs: () => void;
  lastActiveSession: { subject: string; topic: string; durationMinutes: number; timestamp: string } | null;
  saveLastActiveSession: (info: { subject: string; topic: string; durationMinutes: number }) => void;

  // Adaptive Study Mode & Screen Balance
  adaptiveStudyConfig: AdaptiveStudyConfig;
  updateAdaptiveStudyConfig: (config: Partial<AdaptiveStudyConfig>) => void;
  pauseAdaptiveStudyTracking: () => void;
  resumeAdaptiveStudyTracking: () => void;
  dismissAdaptiveIntervention: () => void;
  triggerManualInterventionTest: () => void;
  resetAdaptiveStudyTimer: () => void;

  // Backward compatibility alias for socialBlockerConfig
  socialBlockerConfig: {
    blockedApps: string[];
    studyAccounts: string[];
    dailyLimitMinutes: number;
    isEnabled: boolean;
  };
  updateSocialBlockerConfig: (config: Partial<{
    blockedApps: string[];
    studyAccounts: string[];
    dailyLimitMinutes: number;
    isEnabled: boolean;
  }>) => void;

  // Wellbeing Coach Widget
  wellbeingCoachEnabled: boolean;
  setWellbeingCoachEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function safeLoadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Failed to parse localStorage key "${key}", using fallback:`, err);
    return fallback;
  }
}

const DEMO_RESET_KEY = 'ms_demo_v4_clean_single';
if (typeof window !== 'undefined' && !localStorage.getItem(DEMO_RESET_KEY)) {
  try {
    [
      'ms_study_tasks', 'ms_mnemonics', 'ms_memory_palaces', 'ms_link_chains',
      'ms_story_chains', 'ms_first_letter', 'ms_flashcards', 'ms_exam_plans',
      'ms_study_materials', 'ms_activity_events', 'ms_scheduled_revisions',
      'ms_study_session_logs', 'ms_last_active_session'
    ].forEach(k => localStorage.removeItem(k));
    localStorage.setItem(DEMO_RESET_KEY, 'true');
  } catch (e) {
    console.warn('Could not reset demo cache:', e);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => safeLoadFromStorage<User | null>('ms_user', null));

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
    try {
      localStorage.setItem('ms_theme', t);
    } catch (e) {
      console.warn(e);
    }
    if (t === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
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
  const [revisionIntervals, setRevisionIntervals] = useState<number[]>(() =>
    safeLoadFromStorage<number[]>('ms_revision_intervals', [1, 3, 7, 14, 30])
  );

  // Calendar Activity Events: Exactly ONE general demo event
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(() =>
    safeLoadFromStorage<ActivityEvent[]>('ms_activity_events', [
      { 
        id: 'demo_act_general', 
        title: 'Spaced Recall Sprint', 
        type: 'flashcard', 
        createdAt: new Date().toISOString(), 
        description: 'Completed 25m focus sprint and flashcard retrieval' 
      }
    ])
  );

  // Scheduled Revision Tasks: Exactly ONE general demo scheduled item
  const [scheduledRevisions, setScheduledRevisions] = useState<ScheduledRevisionTask[]>(() =>
    safeLoadFromStorage<ScheduledRevisionTask[]>('ms_scheduled_revisions', DEMO_SCHEDULED_REVISIONS)
  );

  // Focus Timer active task
  const [activeFocusTask, setActiveFocusTask] = useState<ActiveFocusTask | null>(null);

  // Personalization settings
  const [personalization, setPersonalization] = useState<PersonalizationSettings>(() =>
    safeLoadFromStorage<PersonalizationSettings>('ms_personalization', {
      targetExamName: '',
      targetExamDate: '',
      focusSubject: '',
      dailyStudyGoalHours: 3
    })
  );

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    safeLoadFromStorage<AppNotification[]>('ms_notifications', [
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
    ])
  );

  // XP and Streak Gamification State
  const [xp, setXp] = useState<number>(() => safeLoadFromStorage<number>('ms_xp', 120));
  const [streak, setStreak] = useState<number>(() => safeLoadFromStorage<number>('ms_streak', 3));

  const addXp = (amount: number) => {
    setXp(prev => {
      const next = prev + amount;
      safeSaveToStorage('ms_xp', next);
      return next;
    });
  };

  const updateStreak = () => {
    setStreak(prev => {
      const next = prev + 1;
      safeSaveToStorage('ms_streak', next);
      return next;
    });
  };

  const addNotification = (
    titleOrObj: string | { title: string; message: string; type?: AppNotification['type']; priority?: AppNotification['priority'] }, 
    message?: string, 
    type: AppNotification['type'] = 'reminder', 
    priority: AppNotification['priority'] = 'medium'
  ) => {
    let t = '';
    let m = '';
    let ty = type;
    let pr = priority;

    if (typeof titleOrObj === 'object') {
      t = titleOrObj.title;
      m = titleOrObj.message;
      if (titleOrObj.type) ty = titleOrObj.type;
      if (titleOrObj.priority) pr = titleOrObj.priority;
    } else {
      t = titleOrObj;
      m = message || '';
    }

    const newNotif: AppNotification = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      title: t,
      message: m,
      type: ty,
      timestamp: new Date().toISOString(),
      read: false,
      priority: pr
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Study Session Logs & History: Exactly ONE general demo session log
  const [studySessionLogs, setStudySessionLogs] = useState<StudySessionLog[]>(() =>
    safeLoadFromStorage<StudySessionLog[]>('ms_study_session_logs', [
      {
        id: 'ssl_demo_general',
        date: new Date().toISOString().split('T')[0],
        startTime: new Date(Date.now() - 1500000).toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes: 25,
        durationSeconds: 1500,
        subject: 'General Study',
        topic: 'How to Study with Memory Shaastra',
        goal: 'Complete 25-minute sprint and test recall with flashcards',
        completed: true,
        mode: 'timer',
        activitiesDone: ['25m sprint completed', 'Tested 1 flashcard deck', 'Distraction shield active'],
        notes: 'Session logged automatically. Tap 1-Click Copy to export summary to your study journal.'
      }
    ])
  );

  const addStudySessionLog = (logData: Omit<StudySessionLog, 'id'>) => {
    const newLog: StudySessionLog = {
      ...logData,
      id: 'ssl_' + Math.random().toString(36).substr(2, 9)
    };
    setStudySessionLogs(prev => {
      const next = [newLog, ...prev];
      safeSaveToStorage('ms_study_session_logs', next);
      return next;
    });
  };

  const clearStudySessionLogs = () => {
    setStudySessionLogs([]);
    safeSaveToStorage('ms_study_session_logs', []);
  };

  // Last Active Session for 3-Second Quick-Start (Single general starting item)
  const [lastActiveSession, setLastActiveSession] = useState<{ subject: string; topic: string; durationMinutes: number; timestamp: string } | null>(() =>
    safeLoadFromStorage('ms_last_active_session', {
      subject: 'General Study',
      topic: 'How to Study with Memory Shaastra',
      durationMinutes: 25,
      timestamp: new Date().toISOString()
    })
  );

  const saveLastActiveSession = (info: { subject: string; topic: string; durationMinutes: number }) => {
    const record = { ...info, timestamp: new Date().toISOString() };
    setLastActiveSession(record);
    safeSaveToStorage('ms_last_active_session', record);
  };

  // Adaptive Study Mode & Screen Balance State
  const [adaptiveStudyConfig, setAdaptiveStudyConfig] = useState<AdaptiveStudyConfig>(() =>
    safeLoadFromStorage<AdaptiveStudyConfig>('ms_adaptive_study_config', {
      isEnabled: true,
      thresholdHours: 3,
      continuousStudySeconds: 0,
      isTrackingPaused: false,
      isInterventionActive: false,
      interventionSecondsRemaining: 300,
      lastInterventionTimestamp: undefined
    })
  );

  const lastActivityTimestampRef = useRef<number>(Date.now());
  const nextInterventionTargetSecondsRef = useRef<number>(adaptiveStudyConfig.thresholdHours * 3600);

  // Keep target in sync if thresholdHours changes
  useEffect(() => {
    nextInterventionTargetSecondsRef.current = Math.max(
      adaptiveStudyConfig.continuousStudySeconds + 1,
      adaptiveStudyConfig.thresholdHours * 3600
    );
  }, [adaptiveStudyConfig.thresholdHours]);

  // Track active user input across the app
  useEffect(() => {
    const recordActivity = () => {
      lastActivityTimestampRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, recordActivity, { passive: true }));
    return () => {
      events.forEach(evt => window.removeEventListener(evt, recordActivity));
    };
  }, []);

  // Continuous active study tracking & 5-minute break intervention ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setAdaptiveStudyConfig(prev => {
        // If intervention is active: countdown 5 minutes
        if (prev.isInterventionActive) {
          const nextRemaining = prev.interventionSecondsRemaining - 1;
          if (nextRemaining <= 0) {
            // 5 minutes finished -> automatic restoration of normal appearance!
            // Do NOT reset study timer; next intervention after +60m (3600s) continuous study
            nextInterventionTargetSecondsRef.current = prev.continuousStudySeconds + 3600;
            const updated: AdaptiveStudyConfig = {
              ...prev,
              isInterventionActive: false,
              interventionSecondsRemaining: 300,
              lastInterventionTimestamp: Date.now()
            };
            safeSaveToStorage('ms_adaptive_study_config', updated);
            return updated;
          }
          return {
            ...prev,
            interventionSecondsRemaining: nextRemaining
          };
        }

        // Check if enabled and tracking is not manually paused
        if (!prev.isEnabled || prev.isTrackingPaused) {
          return prev;
        }

        // Check inactivity: auto-pause after 5 minutes of no activity
        const now = Date.now();
        const inactiveMs = now - lastActivityTimestampRef.current;
        const isInactive = inactiveMs > 5 * 60 * 1000;
        if (isInactive) {
          return prev;
        }

        // Active study views list: active recall, revision, practice, reading during learning session
        const studyViews: AppView[] = [
          'focus', 'study-bubble', 'flashcards', 'mnemonics', 'palace', 
          'linking', 'story', 'first-letter', 'self-test', 'ai-tester', 
          'rescue-queue', 'library', 'scheduler'
        ];

        // Only increment during declared learning/study sessions
        if (!studyViews.includes(currentView)) {
          return prev;
        }

        const nextContinuousSeconds = prev.continuousStudySeconds + 1;

        // Check if intervention threshold reached
        if (nextContinuousSeconds >= nextInterventionTargetSecondsRef.current) {
          const updated: AdaptiveStudyConfig = {
            ...prev,
            continuousStudySeconds: nextContinuousSeconds,
            isInterventionActive: true,
            interventionSecondsRemaining: 300,
            lastInterventionTimestamp: Date.now()
          };
          safeSaveToStorage('ms_adaptive_study_config', updated);
          return updated;
        }

        const updated: AdaptiveStudyConfig = {
          ...prev,
          continuousStudySeconds: nextContinuousSeconds
        };
        if (nextContinuousSeconds % 10 === 0) {
          safeSaveToStorage('ms_adaptive_study_config', updated);
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentView]);

  const updateAdaptiveStudyConfig = (config: Partial<AdaptiveStudyConfig>) => {
    setAdaptiveStudyConfig(prev => {
      const next = { ...prev, ...config };
      if (config.thresholdHours !== undefined) {
        nextInterventionTargetSecondsRef.current = Math.max(
          next.continuousStudySeconds + 1,
          config.thresholdHours * 3600
        );
      }
      safeSaveToStorage('ms_adaptive_study_config', next);
      return next;
    });
  };

  const pauseAdaptiveStudyTracking = () => {
    updateAdaptiveStudyConfig({ isTrackingPaused: true });
  };

  const resumeAdaptiveStudyTracking = () => {
    lastActivityTimestampRef.current = Date.now();
    updateAdaptiveStudyConfig({ isTrackingPaused: false });
  };

  const dismissAdaptiveIntervention = () => {
    setAdaptiveStudyConfig(prev => {
      nextInterventionTargetSecondsRef.current = prev.continuousStudySeconds + 3600;
      const next: AdaptiveStudyConfig = {
        ...prev,
        isInterventionActive: false,
        interventionSecondsRemaining: 300,
        lastInterventionTimestamp: Date.now()
      };
      safeSaveToStorage('ms_adaptive_study_config', next);
      return next;
    });
  };

  const triggerManualInterventionTest = () => {
    setAdaptiveStudyConfig(prev => {
      const next: AdaptiveStudyConfig = {
        ...prev,
        isInterventionActive: true,
        interventionSecondsRemaining: 300
      };
      safeSaveToStorage('ms_adaptive_study_config', next);
      return next;
    });
  };

  const resetAdaptiveStudyTimer = () => {
    setAdaptiveStudyConfig(prev => {
      nextInterventionTargetSecondsRef.current = prev.thresholdHours * 3600;
      const next: AdaptiveStudyConfig = {
        ...prev,
        continuousStudySeconds: 0,
        isInterventionActive: false,
        interventionSecondsRemaining: 300
      };
      safeSaveToStorage('ms_adaptive_study_config', next);
      return next;
    });
  };

  // Legacy fallback config for backward compatibility
  const [socialBlockerConfig, setSocialBlockerConfig] = useState(() =>
    safeLoadFromStorage('ms_social_blocker_config', {
      blockedApps: ['YouTube & Shorts', 'Instagram & Reels', 'Facebook', 'X (Twitter)', 'Snapchat', 'Reddit', 'TikTok'],
      studyAccounts: ['@KhanAcademy', '@CrashCourse', '@MITOpenCourseWare', '@MemoryShaastraOfficial'],
      dailyLimitMinutes: 180,
      isEnabled: true
    })
  );

  const updateSocialBlockerConfig = (config: any) => {
    setSocialBlockerConfig(prev => {
      const next = { ...prev, ...config };
      safeSaveToStorage('ms_social_blocker_config', next);
      return next;
    });
  };

  // Wellbeing Coach Widget
  const [wellbeingCoachEnabled, setWellbeingCoachEnabled] = useState<boolean>(() =>
    safeLoadFromStorage<boolean>('ms_wellbeing_coach_enabled', true)
  );
  useEffect(() => {
    safeSaveToStorage('ms_wellbeing_coach_enabled', wellbeingCoachEnabled);
  }, [wellbeingCoachEnabled]);

  // Clean, Simple Pedagogical Demo Data Fallback for Guests
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() =>
    safeLoadFromStorage<StudyTask[]>('ms_study_tasks', DEMO_STUDY_TASKS)
  );

  const [mnemonics, setMnemonics] = useState<Mnemonic[]>(() =>
    safeLoadFromStorage<Mnemonic[]>('ms_mnemonics', DEMO_MNEMONICS)
  );

  const [memoryPalaces, setMemoryPalaces] = useState<MemoryPalace[]>(() =>
    safeLoadFromStorage<MemoryPalace[]>('ms_memory_palaces', DEMO_PALACES)
  );

  const [linkChains, setLinkChains] = useState<LinkChain[]>(() =>
    safeLoadFromStorage<LinkChain[]>('ms_link_chains', DEMO_LINK_CHAINS)
  );

  const [storyChains, setStoryChains] = useState<LinkChain[]>(() =>
    safeLoadFromStorage<LinkChain[]>('ms_story_chains', DEMO_STORY_CHAINS)
  );

  const [firstLetterEntries, setFirstLetterEntries] = useState<FirstLetterAid[]>(() =>
    safeLoadFromStorage<FirstLetterAid[]>('ms_first_letter', DEMO_FIRST_LETTER)
  );

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() =>
    safeLoadFromStorage<Flashcard[]>('ms_flashcards', DEMO_FLASHCARDS)
  );

  const [revisions, setRevisions] = useState<Revision[]>(() =>
    safeLoadFromStorage<Revision[]>('ms_revisions', [])
  );

  const [examPlans, setExamPlans] = useState<ExamPlan[]>(() =>
    safeLoadFromStorage<ExamPlan[]>('ms_exam_plans', DEMO_EXAM_PLANS)
  );

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() =>
    safeLoadFromStorage<StudyMaterial[]>('ms_study_materials', DEMO_STUDY_MATERIALS)
  );

  const [memoryLinks, setMemoryLinks] = useState<MemoryLink[]>(() =>
    safeLoadFromStorage<MemoryLink[]>('ms_memory_links', [])
  );

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
      durationMinutes: taskData.durationMinutes !== undefined ? taskData.durationMinutes : undefined
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
      plan.subjects?.forEach(sub => {
        sub.chapters?.forEach(chap => {
          chap.topics?.forEach(top => {
            top.subTopics?.forEach(st => {
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

  // Safe LocalStorage Helper (prevents QuotaExceededError from crashing the app when large PDFs are attached)
  const safeSaveToStorage = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`LocalStorage quota reached while saving ${key}; keeping data in active memory session.`, err);
    }
  };

  // Persisting to Local Storage
  useEffect(() => {
    safeSaveToStorage('ms_user', user);
  }, [user]);

  useEffect(() => {
    safeSaveToStorage('ms_revision_intervals', revisionIntervals);
  }, [revisionIntervals]);

  useEffect(() => {
    safeSaveToStorage('ms_activity_events', activityEvents);
  }, [activityEvents]);

  useEffect(() => {
    safeSaveToStorage('ms_scheduled_revisions', scheduledRevisions);
  }, [scheduledRevisions]);

  useEffect(() => {
    safeSaveToStorage('ms_personalization', personalization);
  }, [personalization]);

  useEffect(() => {
    safeSaveToStorage('ms_study_tasks', studyTasks);
  }, [studyTasks]);

  useEffect(() => {
    safeSaveToStorage('ms_mnemonics', mnemonics);
  }, [mnemonics]);

  useEffect(() => {
    safeSaveToStorage('ms_memory_palaces', memoryPalaces);
  }, [memoryPalaces]);

  useEffect(() => {
    safeSaveToStorage('ms_link_chains', linkChains);
  }, [linkChains]);

  useEffect(() => {
    safeSaveToStorage('ms_story_chains', storyChains);
  }, [storyChains]);

  useEffect(() => {
    safeSaveToStorage('ms_first_letter', firstLetterEntries);
  }, [firstLetterEntries]);

  useEffect(() => {
    safeSaveToStorage('ms_flashcards', flashcards);
  }, [flashcards]);

  useEffect(() => {
    safeSaveToStorage('ms_revisions', revisions);
  }, [revisions]);

  useEffect(() => {
    safeSaveToStorage('ms_exam_plans', examPlans);
  }, [examPlans]);

  useEffect(() => {
    safeSaveToStorage('ms_study_materials', studyMaterials);
  }, [studyMaterials]);

  useEffect(() => {
    safeSaveToStorage('ms_memory_links', memoryLinks);
  }, [memoryLinks]);

  useEffect(() => {
    safeSaveToStorage('ms_notifications', notifications);
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
      memoryLinks, setMemoryLinks, addMemoryLink, removeMemoryLink, rateRecall,
      theme, setTheme,
      xp, streak, addXp, updateStreak,
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
      clearAllNotifications,
      studySessionLogs,
      addStudySessionLog,
      clearStudySessionLogs,
      lastActiveSession,
      saveLastActiveSession,
      adaptiveStudyConfig,
      updateAdaptiveStudyConfig,
      pauseAdaptiveStudyTracking,
      resumeAdaptiveStudyTracking,
      dismissAdaptiveIntervention,
      triggerManualInterventionTest,
      resetAdaptiveStudyTimer,
      socialBlockerConfig,
      updateSocialBlockerConfig,
      wellbeingCoachEnabled,
      setWellbeingCoachEnabled
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
