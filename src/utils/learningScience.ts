import { Flashcard } from '../types';

// Standard SM-2 algorithm
export function calculateSM2(
  card: { interval: number; easeFactor: number; repetitions?: number },
  score: 1 | 2 | 3 | 4 // 1: Again, 2: Hard, 3: Good, 4: Easy
): { interval: number; easeFactor: number; repetitions: number; nextReview: string } {
  let repetitions = card.repetitions ?? 0;
  let interval = card.interval ?? 0;
  let easeFactor = card.easeFactor ?? 2.5;

  // Map 1..4 score to SM-2 quality q (0..5)
  // 1: Again -> q = 1 (incorrect, resets repetitions)
  // 2: Hard -> q = 3 (correct, but hard)
  // 3: Good -> q = 4 (correct, good recall)
  // 4: Easy -> q = 5 (correct, very easy recall)
  let q = 3;
  if (score === 1) q = 1;
  else if (score === 2) q = 3;
  else if (score === 3) q = 4;
  else if (score === 4) q = 5;

  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Calculate new easeFactor
  easeFactor = easeFactor + (0.15 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }
  if (easeFactor > 3.5) {
    easeFactor = 3.5;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReviewDate.toISOString(),
  };
}

// Keeping compatibility for legacy calculateNextReview if called elsewhere
export function calculateNextReview(card: Flashcard, quality: 0 | 1 | 2): Flashcard {
  const scoreMap: Record<number, 1 | 2 | 3 | 4> = {
    0: 1, // hard -> Again (1)
    1: 3, // medium -> Good (3)
    2: 4  // easy -> Easy (4)
  };
  const score = scoreMap[quality] || 3;
  const result = calculateSM2(card, score);
  return {
    ...card,
    ...result
  };
}

export const REVISION_INTERVALS = [1, 2, 5, 15, 30];

export function getNextRevisionDate(lastDate: string, revisionCount: number): string {
  const date = new Date(lastDate);
  const daysToAdd = REVISION_INTERVALS[Math.min(revisionCount, REVISION_INTERVALS.length - 1)];
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
}
