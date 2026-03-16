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
  attachments?: FileAttachment[];
}

export interface Mnemonic {
  id: string;
  title: string;
  phrase: string;
  attachments?: FileAttachment[];
}

export interface MemoryPalace {
  id: string;
  name: string;
  locations: {
    id: string;
    name: string;
    concept?: string;
    attachments?: FileAttachment[];
  }[];
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

export type AppView = 
  | 'auth' 
  | 'dashboard' 
  | 'focus' 
  | 'flashcards' 
  | 'mnemonics' 
  | 'palace' 
  | 'linking' 
  | 'first-letter' 
  | 'scheduler' 
  | 'icebreaker' 
  | 'settings'
  | 'planner'
  | 'exam-mode';
