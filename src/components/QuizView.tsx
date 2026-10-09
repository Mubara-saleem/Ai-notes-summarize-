import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Award,
} from 'lucide-react';
import { AppLanguage, QuizQuestion, SavedNote } from '../types';
import { apiGenerateQuiz } from '../utils/api';

interface QuizViewProps {
  savedNotes: SavedNote[];
  selectedNote: SavedNote | null;
  onSelectNote: (note: SavedNote) => void;
  onSaveUpdatedNote: (note: SavedNote) => void;
  language: AppLanguage;
}

export const QuizView: React.FC<QuizViewProps> = ({
  savedNotes,
  selectedNote,
  onSelectNote,
  onSaveUpdatedNote,
  language,
}) => {
  const currentNote = selectedNote || (savedNotes.length > 0 ? savedNotes[0] : null);

  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [shortUserAnswers, setShortUserAnswers] = useState<Record<string, string>>({});
  const [revealedShort, setRevealedShort] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const questions: QuizQuestion[] = currentNote?.quiz || [];

  const handleGenerate = async () => {
    if (!currentNote) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setShortUserAnswers({});
    setRevealedShort({});

    try {
      const res = await apiGenerateQuiz({
        text: currentNote.rawText,
        count: questionCount,
        language: currentNote.language,
      });

      const updated = {
        ...currentNote,
        quiz: res.questions,
      };
      onSaveUpdatedNote(updated);
    } catch (err: any) {
      console.error('Quiz generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate practice quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShortUserAnswers({});
    setRevealedShort({});
    setIsSubmitted(false);
  };

  // Calculate score for MCQs and True/False
  const scoreableQuestions = questions.filter((q) => q.type !== 'short');
  const correctCount = scoreableQuestions.filter(
    (q) => selectedAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
  ).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Quiz Header & Setup Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>AI Practice Quiz Generator</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test active recall and exam readiness with MCQs, True/False, and short-answers.
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
                    handleResetQuiz();
                  }
                }}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium max-w-xs truncate"
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

        {/* Note Context Banner */}
        {currentNote ? (
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Target Study Document:
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentNote.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Language: {currentNote.language.toUpperCase()} • Words: ~
                {currentNote.rawText.split(/\s+/).length}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Question Count Selector */}
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">Questions:</span>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{questions.length > 0 ? 'Regenerate Questions' : 'Generate Quiz'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">
              No saved study notes found. Please summarize or paste lecture notes first.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Quiz Score Banner (if submitted) */}
      {isSubmitted && scoreableQuestions.length > 0 && (
        <div className="p-6 rounded-3xl bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Quiz Complete!</h3>
                <p className="text-xs text-purple-100">
                  You scored {correctCount} out of {scoreableQuestions.length} (
                  {Math.round((correctCount / scoreableQuestions.length) * 100)}%)
                </p>
              </div>
            </div>

            <button
              onClick={handleResetQuiz}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCorrect =
              isSubmitted &&
              selectedAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

            return (
              <div
                key={q.id || idx}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Question {idx + 1} of {questions.length}
                    </span>
                  </div>

                  {isSubmitted && q.type !== 'short' && (
                    <span
                      className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h4
                  className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed ${
                    currentNote?.language === 'ur' ? 'font-urdu text-xl' : ''
                  }`}
                >
                  {q.question}
                </h4>

                {/* Options for MCQ */}
                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[q.id] === opt;
                      const isOptionCorrect = opt === q.correctAnswer;

                      let btnStyle =
                        'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-purple-300';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (isSelected && !isOptionCorrect) {
                          btnStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-medium';
                        } else {
                          btnStyle =
                            'opacity-60 border-slate-200 dark:border-slate-800 text-slate-500';
                        }
                      } else if (isSelected) {
                        btnStyle =
                          'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold shadow-xs';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt)}
                          disabled={isSubmitted}
                          className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start space-x-2.5 ${btnStyle}`}
                        >
                          <span className="font-bold text-slate-400 shrink-0">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span className={currentNote?.language === 'ur' ? 'font-urdu' : ''}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True / False Options */}
                {q.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {['True', 'False'].map((tf) => {
                      const isSelected = selectedAnswers[q.id] === tf;
                      const isOptionCorrect = tf === q.correctAnswer;

                      let btnStyle =
                        'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-purple-300';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (isSelected && !isOptionCorrect) {
                          btnStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-medium';
                        } else {
                          btnStyle = 'opacity-60 border-slate-200 dark:border-slate-800 text-slate-500';
                        }
                      } else if (isSelected) {
                        btnStyle =
                          'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold shadow-xs';
                      }

                      return (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => handleSelectOption(q.id, tf)}
                          disabled={isSubmitted}
                          className={`p-3 rounded-2xl border text-center font-bold text-sm transition-all ${btnStyle}`}
                        >
                          {tf}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Input */}
                {q.type === 'short' && (
                  <div className="space-y-3 pt-2">
                    <textarea
                      value={shortUserAnswers[q.id] || ''}
                      onChange={(e) =>
                        setShortUserAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="Type your brief answer here..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedShort((prev) => ({
                            ...prev,
                            [q.id]: !prev[q.id],
                          }))
                        }
                        className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {revealedShort[q.id] ? 'Hide Answer' : 'Reveal Model Answer'}
                      </button>
                    </div>

                    {(isSubmitted || revealedShort[q.id]) && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs space-y-1">
                        <p className="font-bold text-emerald-900 dark:text-emerald-200">
                          Model Answer: {q.correctAnswer}
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-300">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Card when submitted */}
                {isSubmitted && q.type !== 'short' && (
                  <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 mt-2">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Answer: <span className="text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit Action Bar */}
          <div className="sticky bottom-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Answered {Object.keys(selectedAnswers).length} of {scoreableQuestions.length} questions
            </span>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => setIsSubmitted(true)}
                disabled={isSubmitted || Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Check Answers</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
