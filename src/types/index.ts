export type SummaryLength = 'short' | 'medium' | 'detailed';
export type AppLanguage = 'en' | 'ur';

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface KeyConceptItem {
  concept: string;
  explanation: string;
}

export type QuestionType = 'mcq' | 'short' | 'true_false';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  hint?: string;
}

export interface SimplifiedConcept {
  simplifiedExplanation: string;
  analogies: string[];
  quickTakeaway: string;
}

export interface SavedNote {
  id: string;
  title: string;
  rawText: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
  language: AppLanguage;
  summaryLength: SummaryLength;
  shortSummary: string;
  detailedSummary: string;
  bulletPoints: string[];
  definitions: DefinitionItem[];
  keyConcepts: KeyConceptItem[];
  quiz?: QuizQuestion[];
  flashcards?: Flashcard[];
  simplified?: SimplifiedConcept;
  estimatedReadTimeMinutes?: number;
  readingDifficulty?: string;
}

export type ViewTab = 'dashboard' | 'summarize' | 'myNotes' | 'quiz' | 'flashcards' | 'settings';
export type NoteContentTab = 'summary' | 'bulletPoints' | 'definitions' | 'concepts' | 'quiz' | 'flashcards' | 'simplify';
