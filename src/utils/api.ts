import {
  AppLanguage,
  Flashcard,
  QuizQuestion,
  SimplifiedConcept,
  SummaryLength,
} from '../types';

export interface SummarizeResponse {
  shortSummary: string;
  detailedSummary: string;
  bulletPoints: string[];
  definitions: { term: string; definition: string }[];
  keyConcepts: { concept: string; explanation: string }[];
  estimatedReadTimeMinutes?: number;
  readingDifficulty?: string;
  notice?: string;
  isDemo?: boolean;
}

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'error', hasApiKey: false };
    return await res.json();
  } catch (e) {
    return { status: 'offline', hasApiKey: false };
  }
}

export async function apiSummarize(params: {
  text: string;
  title?: string;
  language?: AppLanguage;
  length?: SummaryLength;
}): Promise<SummarizeResponse> {
  const res = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Summarization failed with status ${res.status}`);
  }

  return await res.json();
}

export async function apiGenerateQuiz(params: {
  text: string;
  count?: number;
  language?: AppLanguage;
  questionTypes?: string[];
}): Promise<{ questions: QuizQuestion[]; isDemo?: boolean }> {
  const res = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Quiz generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function apiGenerateFlashcards(params: {
  text: string;
  count?: number;
  language?: AppLanguage;
}): Promise<{ flashcards: Flashcard[]; isDemo?: boolean }> {
  const res = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Flashcard generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function apiSimplifyConcept(params: {
  text: string;
  language?: AppLanguage;
}): Promise<SimplifiedConcept & { isDemo?: boolean }> {
  const res = await fetch('/api/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Concept simplification failed with status ${res.status}`);
  }

  return await res.json();
}

export async function apiTranslateUrdu(params: {
  text: string;
  targetLanguage?: 'en' | 'ur';
}): Promise<{ translatedText: string; isDemo?: boolean }> {
  const res = await fetch('/api/translate-urdu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Translation failed with status ${res.status}`);
  }

  return await res.json();
}
