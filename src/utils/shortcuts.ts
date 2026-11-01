import { AppView } from '../types';

export interface ShortcutDefinition {
  id: AppView;
  label: string;
  category: 'Core' | 'Tools' | 'Support';
  keyCombo: string;
  keyDisplay: string;
  altKey: boolean;
  shiftKey: boolean;
  code: string;
  description: string;
}

export const FACILITY_SHORTCUTS: ShortcutDefinition[] = [
  // Core Facilities
  {
    id: 'dashboard',
    label: 'Home Dashboard',
    category: 'Core',
    keyCombo: 'Alt + Shift + H',
    keyDisplay: 'Alt + Shift + H',
    altKey: true,
    shiftKey: true,
    code: 'KeyH',
    description: 'Jump to the main Memory Shaastra home dashboard'
  },
  {
    id: 'study-bubble',
    label: 'Study Bubble',
    category: 'Core',
    keyCombo: 'Alt + Shift + B',
    keyDisplay: 'Alt + Shift + B',
    altKey: true,
    shiftKey: true,
    code: 'KeyB',
    description: 'Launch distraction-free Study Bubble workspace'
  },
  {
    id: 'focus',
    label: 'Study Timer',
    category: 'Core',
    keyCombo: 'Alt + Shift + T',
    keyDisplay: 'Alt + Shift + T',
    altKey: true,
    shiftKey: true,
    code: 'KeyT',
    description: 'Open focus sprint stopwatch & countdown timer'
  },
  {
    id: 'rescue-queue',
    label: 'Active Recall',
    category: 'Core',
    keyCombo: 'Alt + Shift + A',
    keyDisplay: 'Alt + Shift + A',
    altKey: true,
    shiftKey: true,
    code: 'KeyA',
    description: 'Practice high-priority flashcard recall queue'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    category: 'Core',
    keyCombo: 'Alt + Shift + C',
    keyDisplay: 'Alt + Shift + C',
    altKey: true,
    shiftKey: true,
    code: 'KeyC',
    description: 'View study calendar & review intervals'
  },
  {
    id: 'exam-mode',
    label: 'Exam Planning',
    category: 'Core',
    keyCombo: 'Alt + Shift + E',
    keyDisplay: 'Alt + Shift + E',
    altKey: true,
    shiftKey: true,
    code: 'KeyE',
    description: 'Inspect target exam countdown & syllabus milestones'
  },
  {
    id: 'library',
    label: 'Personal Library',
    category: 'Core',
    keyCombo: 'Alt + Shift + L',
    keyDisplay: 'Alt + Shift + L',
    altKey: true,
    shiftKey: true,
    code: 'KeyL',
    description: 'Access uploaded notes, documents & study materials'
  },
  {
    id: 'planner',
    label: 'Study Schedule',
    category: 'Core',
    keyCombo: 'Alt + Shift + J',
    keyDisplay: 'Alt + Shift + J',
    altKey: true,
    shiftKey: true,
    code: 'KeyJ',
    description: 'Organize syllabus milestones & daily study goals'
  },
  {
    id: 'memory-boost',
    label: 'Daily Boost (ZIP & Number Recall)',
    category: 'Core',
    keyCombo: 'Alt + Shift + D',
    keyDisplay: 'Alt + Shift + D',
    altKey: true,
    shiftKey: true,
    code: 'KeyD',
    description: 'Sharpen prefrontal focus with ZIP continuous connector or Number Recall'
  },

  // Memory Tools
  {
    id: 'flashcards',
    label: 'Flashcards',
    category: 'Tools',
    keyCombo: 'Alt + Shift + F',
    keyDisplay: 'Alt + Shift + F',
    altKey: true,
    shiftKey: true,
    code: 'KeyF',
    description: 'Create & test spaced repetition flashcards'
  },
  {
    id: 'palace',
    label: "Memory Palace (Sherlock Holmes' method)",
    category: 'Tools',
    keyCombo: 'Alt + Shift + P',
    keyDisplay: 'Alt + Shift + P',
    altKey: true,
    shiftKey: true,
    code: 'KeyP',
    description: 'Spatial method of loci room-by-room memory journey'
  },
  {
    id: 'linking',
    label: 'Linking Method',
    category: 'Tools',
    keyCombo: 'Alt + Shift + K',
    keyDisplay: 'Alt + Shift + K',
    altKey: true,
    shiftKey: true,
    code: 'KeyK',
    description: 'Connect facts in an unforgettable narrative chain'
  },
  {
    id: 'story',
    label: 'Story Method',
    category: 'Tools',
    keyCombo: 'Alt + Shift + S',
    keyDisplay: 'Alt + Shift + S',
    altKey: true,
    shiftKey: true,
    code: 'KeyS',
    description: 'Weave dry formulas into vibrant storytelling narratives'
  },
  {
    id: 'first-letter',
    label: 'First Letter Method',
    category: 'Tools',
    keyCombo: 'Alt + Shift + I',
    keyDisplay: 'Alt + Shift + I',
    altKey: true,
    shiftKey: true,
    code: 'KeyI',
    description: 'Construct acrostic and initialism mnemonic cues'
  },
  {
    id: 'mnemonics',
    label: 'Mnemonics Generator',
    category: 'Tools',
    keyCombo: 'Alt + Shift + M',
    keyDisplay: 'Alt + Shift + M',
    altKey: true,
    shiftKey: true,
    code: 'KeyM',
    description: 'Generate rhyming, humorous & visual memory aids'
  },
  {
    id: 'scheduler',
    label: 'Revision Hall',
    category: 'Tools',
    keyCombo: 'Alt + Shift + U',
    keyDisplay: 'Alt + Shift + U',
    altKey: true,
    shiftKey: true,
    code: 'KeyU',
    description: 'Inspect spaced repetition interval schedules'
  },

  // Support Facilities
  {
    id: 'self-test',
    label: 'Self-Test Facility',
    category: 'Support',
    keyCombo: 'Alt + Shift + Q',
    keyDisplay: 'Alt + Shift + Q',
    altKey: true,
    shiftKey: true,
    code: 'KeyQ',
    description: 'Ungraded self-recall practice tests under exam conditions'
  },
  {
    id: 'simplifier',
    label: 'Prompt Formatter',
    category: 'Support',
    keyCombo: 'Alt + Shift + R',
    keyDisplay: 'Alt + Shift + R',
    altKey: true,
    shiftKey: true,
    code: 'KeyR',
    description: 'Feynman & Socratic pedagogical prompt generator'
  },
  {
    id: 'study-logs',
    label: 'Study Session Logs',
    category: 'Support',
    keyCombo: 'Alt + Shift + O',
    keyDisplay: 'Alt + Shift + O',
    altKey: true,
    shiftKey: true,
    code: 'KeyO',
    description: 'View study session history, time tracking & export'
  },
  {
    id: 'adaptive-study',
    label: 'Adaptive Study Balance',
    category: 'Support',
    keyCombo: 'Alt + Shift + V',
    keyDisplay: 'Alt + Shift + V',
    altKey: true,
    shiftKey: true,
    code: 'KeyV',
    description: 'Screen time balance & gentle break pacing'
  },
  {
    id: 'memory-dna',
    label: 'Memory DNA',
    category: 'Support',
    keyCombo: 'Alt + Shift + N',
    keyDisplay: 'Alt + Shift + N',
    altKey: true,
    shiftKey: true,
    code: 'KeyN',
    description: 'Cognitive strengths analysis & personalized study path'
  },
  {
    id: 'wellbeing',
    label: 'Wellbeing Coach',
    category: 'Support',
    keyCombo: 'Alt + Shift + W',
    keyDisplay: 'Alt + Shift + W',
    altKey: true,
    shiftKey: true,
    code: 'KeyW',
    description: 'Hydration reminders, rest pacing & stress management'
  },
  {
    id: 'settings',
    label: 'Settings Facility',
    category: 'Support',
    keyCombo: 'Alt + Shift + X',
    keyDisplay: 'Alt + Shift + X',
    altKey: true,
    shiftKey: true,
    code: 'KeyX',
    description: 'Theme preferences, shortcuts table & data backup'
  }
];
