export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface User {
  email: string;
  name: string;
  photoUrl?: string;
  avatarId?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string;
}

export type Level = 'Beginner' | 'Sharp Learner' | 'Memory Master' | 'Shaastra Sage';

export interface GamificationState {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  badges: Badge[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject?: string;
  chapter?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions?: number;
  attachments?: FileAttachment[];
}

export interface Mnemonic {
  id: string;
  title: string;
  phrase: string;
  attachments?: FileAttachment[];
}

export interface PalaceLocation {
  id: string;
  name: string;
  concept?: string;
  attachments?: FileAttachment[];
}

export interface MemoryPalace {
  id: string;
  name: string;
  locations: PalaceLocation[];
}

export interface LinkChain {
  id: string;
  title: string;
  items: string[];
  story: string;
  attachments?: FileAttachment[];
}

export interface FirstLetterAid {
  id: string;
  title: string;
  description: string;
  items: string[];
  mnemonic: string;
  attachments?: FileAttachment[];
}

export interface Revision {
  id: string;
  subject: string;
  chapter: string;
  dateStudied: string;
  examDate: string;
  completedDates: string[];
  nextRevision: string;
}

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  plannedDate: string;
  estimatedTime: string; // e.g. "2 hours"
  completed: boolean;
}

export interface ExamPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  topics: string[];
}

export interface RevisionScheduleItem {
  id: string;
  label: string;
  date: string;
  completed: boolean;
}

export interface ExamSubTopic {
  id: string;
  name: string;
  completed: boolean;
}

export interface ExamTopic {
  id: string;
  name: string;
  completed: boolean;
  subTopics: ExamSubTopic[];
}

export interface ExamChapter {
  id: string;
  name: string;
  completed: boolean;
  topics: ExamTopic[];
}

export interface ExamSubject {
  id: string;
  name: string;
  chapters: ExamChapter[];
}

export interface ExamPlan {
  id: string;
  title: string;
  examDate: string;
  subjects: ExamSubject[];
  phases: ExamPhase[];
  revisionSchedule: RevisionScheduleItem[];
  isActive: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  content: string;
  attachments: FileAttachment[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'motivational' | 'reminder' | 'exam' | 'achievement';
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface MemoryLink {
  id: string;
  sourceId: string;
  sourceType: 'flashcard' | 'mnemonic' | 'palace' | 'link-chain' | 'story' | 'first-letter' | 'material';
  targetId: string;
  targetType: 'flashcard' | 'mnemonic' | 'palace' | 'link-chain' | 'story' | 'first-letter' | 'material';
}

export interface ActivityEvent {
  id: string;
  title: string;
  type: 'flashcard' | 'mnemonic' | 'palace' | 'link-chain' | 'story' | 'first-letter' | 'material' | 'study-task';
  itemId?: string;
  createdAt: string; // ISO string
  description?: string;
}

export interface ScheduledRevisionTask {
  id: string;
  activityId: string;
  itemTitle: string;
  itemType: 'flashcard' | 'mnemonic' | 'palace' | 'link-chain' | 'story' | 'first-letter' | 'material' | 'study-task';
  itemId?: string;
  dueDate: string; // YYYY-MM-DD
  intervalDays: number;
  completed: boolean;
  completedAt?: string;
  durationMinutes?: number;
}

export type AppView = 
  | 'auth' 
  | 'dashboard' 
  | 'focus' 
  | 'flashcards' 
  | 'mnemonics' 
  | 'palace' 
  | 'linking' 
  | 'story'
  | 'first-letter' 
  | 'calendar' 
  | 'settings'
  | 'planner'
  | 'exam-mode'
  | 'library'
  | 'advice'
  | 'ai-tester'
  | 'simplifier'
  | 'memory-dna'
  | 'wellbeing';

export interface QuestionPaperSpec {
  types: Array<'mcq' | 'fill-blank' | 'short' | 'long' | 'case' | 'true-false'>;
  difficulty: 'easy' | 'moderate' | 'tough' | 'competitive';
  subject: string;
  topic: string;
  questionCount: number;
}

export interface GeneratedQuestion {
  id: string;
  type: 'mcq' | 'fill-blank' | 'short' | 'long' | 'case' | 'true-false';
  difficulty: 'easy' | 'moderate' | 'tough' | 'competitive';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TestEvaluation {
  score: number;
  maxScore: number;
  percentage: number;
  strictness: 'easy' | 'moderate' | 'tough' | 'competitive';
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: Array<{
    questionNum: number;
    userAnswer: string;
    expectedAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
    maxMarks: number;
    feedback: string;
  }>;
}

export interface LearnerAdvice {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  whatNeedsToBeDone: string[];
  howToExecute: string[];
  generatedAt: string;
}

