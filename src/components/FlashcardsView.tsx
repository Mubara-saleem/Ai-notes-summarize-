import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
  Loader2,
  Lightbulb,
  LayoutGrid,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { AppLanguage, Flashcard, SavedNote } from '../types';
import { apiGenerateFlashcards } from '../utils/api';

interface FlashcardsViewProps {
  savedNotes: SavedNote[];
  selectedNote: SavedNote | null;
  onSelectNote: (note: SavedNote) => void;
  onSaveUpdatedNote: (note: SavedNote) => void;
  language: AppLanguage;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  savedNotes,
  selectedNote,
  onSelectNote,
  onSaveUpdatedNote,
  language,
}) => {
  const currentNote = selectedNote || (savedNotes.length > 0 ? savedNotes[0] : null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [isGridView, setIsGridView] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [cardCount, setCardCount] = useState<number>(8);

  const flashcards: Flashcard[] = currentNote?.flashcards || [];

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flashcards.length === 0 || isGridView) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, flashcards.length, isGridView]);

  const handleNext = () => {
    if (flashcards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    if (flashcards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    if (!currentNote || flashcards.length < 2) return;
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const updated = { ...currentNote, flashcards: shuffled };
    onSaveUpdatedNote(updated);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!currentNote) return;
    setIsGenerating(true);
    try {
      const res = await apiGenerateFlashcards({
        text: currentNote.rawText,
        count: cardCount,
        language: currentNote.language,
      });
      const updated = { ...currentNote, flashcards: res.flashcards };
      onSaveUpdatedNote(updated);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (e) {
      console.error('Error generating flashcards:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCard = flashcards[currentIndex];
  const progressPercent = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Active Recall Flashcards</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Flip to test memory and master key definitions, mechanisms, and terms.
            </p>
          </div>

          {/* Note Source Selector */}
          {savedNotes.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Select Note:</span>
              <select
                value={currentNote?.id || ''}
                onChange={(e) => {
                  const found = savedNotes.find((n) => n.id === e.target.value);
                  if (found) {
                    onSelectNote(found);
                    setCurrentIndex(0);
                  }
                }}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium max-w-xs truncate"
              >
                {savedNotes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Source Note Banner */}
        {currentNote ? (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Study Topic:
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentNote.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {flashcards.length} cards available • {masteredIds.size} mastered
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 font-semibold"
              >
                <option value={6}>6 Cards</option>
                <option value={8}>8 Cards</option>
                <option value={12}>12 Cards</option>
                <option value={15}>15 Cards</option>
              </select>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{flashcards.length > 0 ? 'Regenerate' : 'Generate'}</span>
                  </>
                )}
              </button>

              {flashcards.length > 0 && (
                <button
                  onClick={() => setIsGridView(!isGridView)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs flex items-center"
                  title={isGridView ? 'Switch to Card Flip Mode' : 'Switch to Grid View'}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {flashcards.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Flashcards Generated Yet
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Generate flashcards from your study notes to practice active recall and memorize key concepts.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            Create Flashcards
          </button>
        </div>
      ) : isGridView ? (
        /* Grid Overview Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              All Study Flashcards ({flashcards.length})
            </h3>
            <button
              onClick={() => setIsGridView(false)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Back to Flip Mode &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map((fc, idx) => (
              <div
                key={fc.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {fc.category || 'Concept'}
                    </span>
                    <button
                      onClick={() => toggleMastered(fc.id)}
                      className={`text-xs flex items-center gap-1 font-semibold ${
                        masteredIds.has(fc.id) ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{masteredIds.has(fc.id) ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>
                  </div>

                  <h5
                    className={`font-bold text-slate-900 dark:text-white text-sm mb-3 ${
                      currentNote?.language === 'ur' ? 'font-urdu' : ''
                    }`}
                  >
                    {fc.front}
                  </h5>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">Answer / Definition:</p>
                    <p
                      className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed ${
                        currentNote?.language === 'ur' ? 'font-urdu' : ''
                      }`}
                    >
                      {fc.back}
                    </p>
                  </div>
                </div>

                {fc.hint && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    💡 Hint: {fc.hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Single Interactive Flip Card Mode */
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <span>
                Mastered: {masteredIds.size} / {flashcards.length}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none perspective-1000 min-h-[320px] sm:min-h-[380px] w-full"
          >
            <div
              className={`relative w-full h-full min-h-[320px] sm:min-h-[380px] rounded-3xl p-8 sm:p-12 transition-all duration-500 transform-style-3d shadow-md hover:shadow-xl border flex flex-col justify-between ${
                isFlipped
                  ? 'bg-linear-to-br from-indigo-900 to-slate-900 text-white border-indigo-700/80'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    isFlipped
                      ? 'bg-white/20 text-indigo-200'
                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {currentCard?.category || 'Study Term'}
                </span>

                <div className="flex items-center space-x-2 text-xs opacity-75">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click or press Space to flip</span>
                </div>
              </div>

              {/* Main Card Content */}
              <div className="my-auto py-6 text-center space-y-4">
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    isFlipped ? 'text-indigo-300' : 'text-slate-400'
                  }`}
                >
                  {isFlipped ? 'ANSWER / CONCEPT' : 'TERM / QUESTION'}
                </span>

                <h3
                  className={`text-xl sm:text-2xl font-bold leading-relaxed max-w-2xl mx-auto ${
                    currentNote?.language === 'ur'
                      ? 'font-urdu text-2xl sm:text-3xl leading-loose'
                      : ''
                  }`}
                >
                  {isFlipped ? currentCard?.back : currentCard?.front}
                </h3>

                {/* Hint on Front */}
                {!isFlipped && currentCard?.hint && (
                  <div>
                    {showHint ? (
                      <p className="text-xs text-amber-500 dark:text-amber-400 italic">
                        💡 Hint: {currentCard.hint}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(true);
                        }}
                        className="text-xs text-slate-400 hover:text-amber-500 underline transition-colors"
                      >
                        Show Hint
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <span
                  className={`font-semibold ${
                    masteredIds.has(currentCard?.id)
                      ? 'text-emerald-500 font-bold'
                      : isFlipped
                      ? 'text-slate-400'
                      : 'text-slate-400'
                  }`}
                >
                  {masteredIds.has(currentCard?.id) ? '✓ Mastered' : 'Needs Review'}
                </span>

                <span className={isFlipped ? 'text-indigo-300' : 'text-slate-400'}>
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation & Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShuffle}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => toggleMastered(currentCard?.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  masteredIds.has(currentCard?.id)
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{masteredIds.has(currentCard?.id) ? 'Mastered!' : 'Mark as Mastered'}</span>
              </button>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                <span>Flip Card</span>
              </button>

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
