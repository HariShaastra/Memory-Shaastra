import { Flashcard } from '../types';

// Simple Spaced Repetition Logic (SuperMemo-2 inspired)
export function calculateNextReview(card: Flashcard, quality: 0 | 1 | 2): Flashcard {
  // quality: 0=hard, 1=medium, 2=easy
  let { interval, easeFactor } = card;

  if (quality >= 1) {
    if (interval === 0) {
      interval = 1;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    
    // Adjust ease factor
    easeFactor = easeFactor + (0.1 - (2 - quality) * (0.08 + (2 - quality) * 0.02));
  } else {
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...card,
    interval,
    easeFactor,
    nextReview: nextReviewDate.toISOString(),
  };
}

export const REVISION_INTERVALS = [1, 2, 5, 15, 30];

export function getNextRevisionDate(lastDate: string, revisionCount: number): string {
  const date = new Date(lastDate);
  const daysToAdd = REVISION_INTERVALS[Math.min(revisionCount, REVISION_INTERVALS.length - 1)];
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
}
