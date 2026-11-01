import { QuestionPaperSpec, GeneratedQuestion, TestEvaluation, LearnerAdvice } from '../types';

/**
 * High-performance Algorithmic Study Engine (Pure Non-AI)
 * Fast, deterministic, and works completely without any AI or API keys.
 */

export async function generateFlashcards(topic: string, count = 5) {
  const res = await fetch('/api/study/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, count })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate flashcards');
  return data.flashcards as Array<{ question: string; answer: string; difficulty: 'easy' | 'medium' | 'hard' }>;
}

export async function generateMnemonic(concept: string, details?: string) {
  const res = await fetch('/api/study/mnemonic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept, details })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate mnemonic');
  return data.mnemonic as { title: string; phrase: string };
}

export async function generatePalaceLoci(palaceName: string, topics: string[]) {
  const res = await fetch('/api/study/palace-loci', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ palaceName, topics })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate palace loci');
  return data.locations as Array<{ name: string; concept: string }>;
}

export async function generateLinkChain(items: string[]) {
  const res = await fetch('/api/study/link-chain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate link chain');
  return data.linkChain as { title: string; story: string };
}

export async function generateStory(items: string[]) {
  const res = await fetch('/api/study/story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate story');
  return data.storyChain as { title: string; story: string };
}

export async function generateFirstLetter(items: string[]) {
  const res = await fetch('/api/study/first-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate first letter aid');
  return data.firstLetterAid as { title: string; description: string; mnemonic: string };
}

export async function simplifyConcept(text: string, version: 'simple' | 'exam' | 'story') {
  const res = await fetch('/api/study/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, version })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to simplify concept');
  return data.simplifiedText as string;
}

export async function generateLearnerAdvice(userData: any) {
  const res = await fetch('/api/study/learner-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userData })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate learner advice');
  return data.advice as LearnerAdvice;
}

export async function generateTest(spec: QuestionPaperSpec) {
  const res = await fetch('/api/study/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spec })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate test paper');
  return data.questions as GeneratedQuestion[];
}

export async function evaluateTest(questions: GeneratedQuestion[], userAnswers: Record<string, string>, strictness: 'easy' | 'moderate' | 'tough' | 'competitive', pdfText?: string) {
  const res = await fetch('/api/study/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, userAnswers, strictness, pdfText })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to evaluate test');
  return data.evaluation as TestEvaluation;
}

export async function getWellbeingAdvice(sessionMinutes: number, recallAccuracy: number, mood: string, notes?: string) {
  const res = await fetch('/api/study/wellbeing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionMinutes, recallAccuracy, mood, notes })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to get wellbeing coach advice');
  return data.wellbeingAdvice as { status: string; coachMessage: string; recommendation: string; disclaimer: string };
}

// Aliases for seamless backward compatibility without AI
export const aiGenerateFlashcards = generateFlashcards;
export const aiGenerateMnemonic = generateMnemonic;
export const aiGeneratePalaceLoci = generatePalaceLoci;
export const aiGenerateLinkChain = generateLinkChain;
export const aiGenerateStory = generateStory;
export const aiGenerateFirstLetter = generateFirstLetter;
export const aiSimplifyConcept = simplifyConcept;
export const aiGenerateLearnerAdvice = generateLearnerAdvice;
export const aiGenerateTest = generateTest;
export const aiEvaluateTest = evaluateTest;
export const aiGetWellbeingAdvice = getWellbeingAdvice;
