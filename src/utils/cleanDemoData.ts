import { 
  Flashcard, 
  Mnemonic, 
  MemoryPalace, 
  LinkChain, 
  FirstLetterAid, 
  StudyTask, 
  ScheduledRevisionTask, 
  StudyMaterial, 
  ExamPlan 
} from '../types';

const today = new Date().toISOString().split('T')[0];

// 1. Flashcards: Exactly ONE general demo card explaining active recall & grading
export const DEMO_FLASHCARDS: Flashcard[] = [
  {
    id: 'demo_fc_general',
    question: 'How do Active Recall Flashcards help you learn faster?',
    answer: 'Instead of passive re-reading, actively trying to answer from memory strengthens neural pathways. Flip the card, check your answer, and rate how well you remembered it (Again, Hard, Good, Easy) so the app schedules your next review at the ideal moment.',
    subject: 'General Knowledge',
    chapter: 'Getting Started',
    difficulty: 'medium',
    nextReview: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5
  }
];

// 2. Mnemonics Vault: Exactly ONE general demo mnemonic
export const DEMO_MNEMONICS: Mnemonic[] = [
  {
    id: 'demo_mn_general',
    title: 'Planets in Order from the Sun',
    phrase: 'My Very Educated Mother Just Served Us Noodles',
    actualInfo: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Use the first letter of each word in a catchy sentence to recall ordered items effortlessly.',
    subject: 'General Knowledge',
    chapter: 'Memory Essentials'
  }
];

// 3. Memory Palace: Exactly ONE general demo palace explaining the Method of Loci
export const DEMO_PALACES: MemoryPalace[] = [
  {
    id: 'demo_palace_general',
    name: 'My Living Room (Sample Palace)',
    subject: 'General Knowledge',
    locations: [
      {
        id: 'loc_1',
        name: 'Front Door',
        concept: 'Location 1: Anchor your first concept here. Imagine an exaggerated, vivid image happening at the door to trigger instant recall.'
      },
      {
        id: 'loc_2',
        name: 'Coffee Table',
        concept: 'Location 2: Walk sequentially through your room. The next fact is visually placed right on this coffee table.'
      }
    ]
  }
];

// 4. Linking Method: Exactly ONE general demo link chain
export const DEMO_LINK_CHAINS: LinkChain[] = [
  {
    id: 'demo_link_general',
    title: 'Connecting Key Concepts (Link Method)',
    items: ['Focus Sprint', 'Active Retrieval', 'Long-Term Memory'],
    story: 'Link item 1 to item 2 with a vivid action: A glowing Timer (Focus Sprint) shoots laser beams at a locked safe (Active Retrieval), and opening the safe reveals a permanent diamond archive (Long-Term Memory).',
    subject: 'General Knowledge'
  }
];

// 5. Story Method: Exactly ONE general demo story chain
export const DEMO_STORY_CHAINS: LinkChain[] = [
  {
    id: 'demo_story_general',
    title: 'The Narrative Recall Method',
    items: ['Idea Initiation', 'Deep Research', 'System Design', 'Final Delivery'],
    story: 'An astronaut has a brilliant spark of light (Idea Initiation), dives into a deep ocean of star-charts (Deep Research), builds a golden rocket blueprint on the shore (System Design), and launches it into orbit to cheering crowds (Final Delivery).',
    subject: 'General Knowledge'
  }
];

// 6. First-Letter Aid: Exactly ONE general demo acronym
export const DEMO_FIRST_LETTER: FirstLetterAid[] = [
  {
    id: 'demo_fl_general',
    title: 'SMART Goal Criteria',
    description: 'A universal framework to turn vague study ambitions into clear, actionable outcomes.',
    items: ['Specific (What exactly will you do?)', 'Measurable (How will you verify progress?)', 'Achievable (Is it realistic?)', 'Relevant (Does it align with your exam?)', 'Time-bound (What is the exact deadline?)'],
    mnemonic: 'S.M.A.R.T.',
    subject: 'General Knowledge'
  }
];

// 7. Study Schedule / Planner: Exactly ONE general demo task
export const DEMO_STUDY_TASKS: StudyTask[] = [
  {
    id: 'demo_task_general',
    subject: 'General Study',
    topic: 'How to Use Memory Shaastra Facilities',
    plannedDate: today,
    estimatedTime: '25 mins',
    completed: false
  }
];

// 8. Revision Hall: Exactly ONE general demo scheduled revision
export const DEMO_SCHEDULED_REVISIONS: ScheduledRevisionTask[] = [
  {
    id: 'demo_rev_general',
    activityId: 'demo_act_general',
    itemTitle: 'Spaced Review: Memory Fundamentals & Active Recall',
    itemType: 'flashcard',
    dueDate: today,
    intervalDays: 1,
    completed: false,
    durationMinutes: 15
  }
];

// 9. Exam Planning: Exactly ONE general demo syllabus plan
export const DEMO_EXAM_PLANS: ExamPlan[] = [
  {
    id: 'demo_exam_general',
    title: 'General Curriculum & Exam Plan',
    examDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    isActive: true,
    subjects: [
      {
        id: 'sub_demo_1',
        name: 'Foundations of Learning & Recall',
        chapters: [
          {
            id: 'chap_demo_1',
            name: 'Chapter 1: Spaced Repetition and Retrieval',
            completed: false,
            topics: [
              {
                id: 'top_demo_1',
                name: 'The Testing Effect vs Passive Highlighting',
                completed: false,
                subTopics: [
                  { id: 'subtop_1', name: 'Why self-testing creates durable retention', completed: true },
                  { id: 'subtop_2', name: 'How to structure daily 25-minute sprints', completed: false }
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

// 10. Personal Library: Exactly ONE general demo document
export const DEMO_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'demo_mat_general',
    title: 'Guide: How to Learn Anything with Memory Shaastra',
    groupName: 'Getting Started Guide',
    subject: 'General Knowledge',
    content: 'Welcome to Memory Shaastra.\n\nHere is how to get the most out of every facility:\n\n1. Study Bubble: Tap "Study Now" to begin a distraction-shielded timer or stopwatch sprint. Study without phone interruptions, then close and rest.\n2. Active Recall & Flashcards: Test yourself regularly. Testing cements memories far deeper than re-reading notes.\n3. Memory Palaces & Mnemonics: Convert lists, sections, and numbers into physical room locations or memorable acronyms.\n4. Spaced Repetition: Revisit topics at calculated intervals (1d, 3d, 7d, 14d, 30d) to beat the forgetting curve permanently.\n5. Screen Balance: Let Adaptive Study Mode remind you when it is time to take healthy breaks.',
    createdAt: new Date().toISOString(),
    attachments: []
  }
];
