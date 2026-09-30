import { GeneratedQuestion } from '../types';

export interface UserActivityUnit {
  id: string;
  sourceType: 'flashcard' | 'mnemonic' | 'palace' | 'link' | 'story' | 'first-letter' | 'task';
  prompt: string;
  answer: string;
  context: string;
}

// Extract all user activities into standardized testable units
export function extractUserActivityUnits(data: {
  flashcards?: Array<{ id: string; question: string; answer: string; subject?: string }>;
  mnemonics?: Array<{ id: string; title: string; phrase: string; actualInfo?: string; subject?: string }>;
  studyTasks?: Array<{ id: string; topic: string; subject?: string }>;
  linkChains?: Array<{ id: string; title: string; items: string[]; story?: string }>;
  storyChains?: Array<{ id: string; title: string; story: string }>;
  firstLetterEntries?: Array<{ id: string; title: string; mnemonic: string; items: string[] }>;
  memoryPalaces?: Array<{ id: string; name: string; locations: Array<{ name: string; concept?: string }> }>;
}): UserActivityUnit[] {
  const units: UserActivityUnit[] = [];

  // 1. Flashcards
  (data.flashcards || []).forEach(f => {
    if (f.question && f.answer) {
      units.push({
        id: `fc_${f.id}`,
        sourceType: 'flashcard',
        prompt: f.question.trim(),
        answer: f.answer.trim(),
        context: f.subject || 'Flashcard Recall'
      });
    }
  });

  // 2. Mnemonics
  (data.mnemonics || []).forEach(m => {
    if (m.title && m.phrase) {
      units.push({
        id: `mn_${m.id}`,
        sourceType: 'mnemonic',
        prompt: m.title.trim(),
        answer: m.actualInfo ? `${m.phrase} (Concept: ${m.actualInfo})` : m.phrase.trim(),
        context: m.subject || 'Mnemonic Acronym'
      });
    }
  });

  // 3. Study Tasks
  (data.studyTasks || []).forEach(t => {
    if (t.topic) {
      units.push({
        id: `task_${t.id}`,
        sourceType: 'task',
        prompt: t.topic.trim(),
        answer: `Topic in ${t.subject || 'General Study'}`,
        context: t.subject || 'Study Schedule'
      });
    }
  });

  // 4. Link Chains
  (data.linkChains || []).forEach(l => {
    if (l.title && l.items && l.items.length > 0) {
      units.push({
        id: `link_${l.id}`,
        sourceType: 'link',
        prompt: l.title.trim(),
        answer: l.items.join(' → '),
        context: 'Linking Method'
      });
    }
  });

  // 5. Story Chains
  (data.storyChains || []).forEach(s => {
    if (s.title && s.story) {
      units.push({
        id: `story_${s.id}`,
        sourceType: 'story',
        prompt: s.title.trim(),
        answer: s.story.length > 100 ? s.story.substring(0, 100) + '...' : s.story,
        context: 'Story Method'
      });
    }
  });

  // 6. First Letter Aids
  (data.firstLetterEntries || []).forEach(fl => {
    if (fl.title && fl.mnemonic) {
      units.push({
        id: `fl_${fl.id}`,
        sourceType: 'first-letter',
        prompt: fl.title.trim(),
        answer: `${fl.mnemonic} (${fl.items.join(', ')})`,
        context: 'First Letter Method'
      });
    }
  });

  // 7. Memory Palaces
  (data.memoryPalaces || []).forEach(p => {
    if (p.name && p.locations && p.locations.length > 0) {
      const concepts = p.locations.filter(l => l.concept).map(l => `${l.name}: ${l.concept}`);
      if (concepts.length > 0) {
        units.push({
          id: `pal_${p.id}`,
          sourceType: 'palace',
          prompt: `Palace: ${p.name}`,
          answer: concepts.slice(0, 3).join('; '),
          context: 'Memory Palace'
        });
      }
    }
  });

  return units;
}

// Shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate simple, randomized questions across all applicable formats strictly based on user activity
export function generateActivityBasedQuestions(
  units: UserActivityUnit[],
  maxQuestions: number = 4
): GeneratedQuestion[] {
  if (units.length === 0) {
    return [
      {
        id: 'fallback_1',
        type: 'short',
        difficulty: 'easy',
        question: 'Active Recall Practice: Briefly write down the most important concept you revised recently.',
        correctAnswer: 'Key concept recall and definition.',
        explanation: 'Regular active retrieval strengthens neural retention.'
      }
    ];
  }

  const shuffledUnits = shuffleArray(units);
  const selectedUnits = shuffledUnits.slice(0, Math.min(maxQuestions, shuffledUnits.length));

  // Applicable formats to rotate randomly
  const formats: Array<'mcq' | 'fill-blank' | 'true-false' | 'short'> = ['mcq', 'fill-blank', 'true-false', 'short'];
  const shuffledFormats = shuffleArray(formats);

  const questions: GeneratedQuestion[] = selectedUnits.map((unit, index) => {
    const format = shuffledFormats[index % shuffledFormats.length];
    const qId = `act_q_${Date.now()}_${index}`;

    if (format === 'mcq') {
      // Pick 3 distractors from other units or smart variations
      const otherAnswers = units
        .filter(u => u.id !== unit.id)
        .map(u => u.answer);
      const shuffledOthers = shuffleArray(otherAnswers).slice(0, 3);
      
      while (shuffledOthers.length < 3) {
        shuffledOthers.push(`Alternative recall fact #${shuffledOthers.length + 1}`);
      }

      const options = shuffleArray([unit.answer, ...shuffledOthers]);

      return {
        id: qId,
        type: 'mcq',
        difficulty: 'easy',
        question: `[${unit.context}] In your recent learning, what is associated with "${unit.prompt}"?`,
        options,
        correctAnswer: unit.answer,
        explanation: `Directly from your activity: "${unit.prompt}" corresponds to "${unit.answer}".`
      };
    } else if (format === 'fill-blank') {
      return {
        id: qId,
        type: 'fill-blank',
        difficulty: 'easy',
        question: `[${unit.context}] Fill in the blank: "${unit.prompt}" relates directly to: "____"`,
        correctAnswer: unit.answer,
        explanation: `From your notes: "${unit.prompt}" is linked with "${unit.answer}".`
      };
    } else if (format === 'true-false') {
      const isTrue = Math.random() > 0.5;
      const otherUnit = units.find(u => u.id !== unit.id);
      const statementAnswer = isTrue || !otherUnit ? unit.answer : otherUnit.answer;

      return {
        id: qId,
        type: 'true-false',
        difficulty: 'easy',
        question: `True or False: In your study on "${unit.context}", "${unit.prompt}" is paired with "${statementAnswer}".`,
        correctAnswer: isTrue ? 'True' : 'False',
        explanation: `Verified from your activity: "${unit.prompt}" is paired with "${unit.answer}".`
      };
    } else {
      // Short answer
      return {
        id: qId,
        type: 'short',
        difficulty: 'easy',
        question: `[${unit.context}] In a brief sentence, recall what you learned about "${unit.prompt}".`,
        correctAnswer: unit.answer,
        explanation: `From your recent activity: "${unit.answer}".`
      };
    }
  });

  return questions;
}
