import { QuestionPaperSpec, GeneratedQuestion, TestEvaluation, LearnerAdvice } from '../types';

export async function aiGenerateFlashcards(topic: string, count = 5) {
  const res = await fetch('/api/ai/generate-flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, count })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate flashcards');
  return data.flashcards as Array<{ question: string; answer: string; difficulty: 'easy' | 'medium' | 'hard' }>;
}

export async function aiGenerateMnemonic(concept: string, details?: string) {
  const res = await fetch('/api/ai/generate-mnemonic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept, details })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate mnemonic');
  return data.mnemonic as { title: string; phrase: string };
}

export async function aiGeneratePalaceLoci(palaceName: string, topics: string[]) {
  const res = await fetch('/api/ai/generate-palace-loci', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ palaceName, topics })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate palace loci');
  return data.locations as Array<{ name: string; concept: string }>;
}

export async function aiGenerateLinkChain(items: string[]) {
  const res = await fetch('/api/ai/generate-link-chain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate link chain');
  return data.linkChain as { title: string; story: string };
}

export async function aiGenerateStory(items: string[]) {
  const res = await fetch('/api/ai/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate story');
  return data.storyChain as { title: string; story: string };
}

export async function aiGenerateFirstLetter(items: string[]) {
  const res = await fetch('/api/ai/generate-first-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate first letter aid');
  return data.firstLetterAid as { title: string; description: string; mnemonic: string };
}

export async function aiSimplifyConcept(text: string, version: 'simple' | 'exam' | 'story') {
  const res = await fetch('/api/ai/simplify-concept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, version })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to simplify concept');
  return data.simplifiedText as string;
}

export async function aiGenerateLearnerAdvice(userData: any) {
  const res = await fetch('/api/ai/generate-learner-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userData })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate learner advice');
  return data.advice as LearnerAdvice;
}

export async function aiGenerateTest(spec: QuestionPaperSpec) {
  const res = await fetch('/api/ai/generate-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spec })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate test paper');
  return data.questions as GeneratedQuestion[];
}

export async function aiEvaluateTest(questions: GeneratedQuestion[], userAnswers: Record<string, string>, strictness: 'easy' | 'moderate' | 'tough' | 'competitive', pdfText?: string) {
  const res = await fetch('/api/ai/evaluate-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, userAnswers, strictness, pdfText })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to evaluate test');
  return data.evaluation as TestEvaluation;
}

export async function aiGetWellbeingAdvice(sessionMinutes: number, recallAccuracy: number, mood: string, notes?: string) {
  const res = await fetch('/api/ai/wellbeing-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionMinutes, recallAccuracy, mood, notes })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to get wellbeing coach advice');
  return data.wellbeingAdvice as { status: string; coachMessage: string; recommendation: string; disclaimer: string };
}
