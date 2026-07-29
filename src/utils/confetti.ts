import confetti from 'canvas-confetti';

export function triggerCompletionCelebration() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#eab308', '#10b981', '#6366f1', '#ec4899']
    });
  } catch (e) {
    console.warn('Confetti error:', e);
  }
}
