import React from 'react';
import {
  FileText,
  UploadCloud,
  ClipboardPaste,
  HelpCircle,
  CreditCard,
  ArrowRight,
  BookOpen,
  Sparkles,
  Clock,
  Trash2,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Languages,
} from 'lucide-react';
import { AppLanguage, SavedNote } from '../types';
import { SAMPLE_NOTES, SampleNoteItem } from '../data/sampleNotes';
import { exportNoteToPDF, exportNoteToTXT } from '../utils/pdfExporter';

interface DashboardViewProps {
  savedNotes: SavedNote[];
  onNavigateToSummarize: (initialAction?: 'upload' | 'paste') => void;
  onOpenSavedNote: (note: SavedNote) => void;
  onDeleteNote: (id: string) => void;
  onNavigateToQuiz: (note?: SavedNote) => void;
  onNavigateToFlashcards: (note?: SavedNote) => void;
  onLoadSampleNote: (sample: SampleNoteItem) => void;
  language: AppLanguage;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  savedNotes,
  onNavigateToSummarize,
  onOpenSavedNote,
  onDeleteNote,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  onLoadSampleNote,
  language,
}) => {
  const totalNotes = savedNotes.length;
  const totalQuizzes = savedNotes.reduce(
    (acc, n) => acc + (n.quiz && n.quiz.length > 0 ? 1 : 0),
    0
  );
  const totalFlashcards = savedNotes.reduce(
    (acc, n) => acc + (n.flashcards ? n.flashcards.length : 0),
    0
  );

  const recentNotes = savedNotes.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 sm:p-10 shadow-lg shadow-indigo-500/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-20 w-64 h-64 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Powered Smart Study Assistant for University Students</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Turn lengthy lectures into clear study notes, quizzes & flashcards.
          </h2>

          <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
            Stop drowning in hundreds of textbook pages. Upload PDFs, TXT files, or paste lecture notes to extract short summaries, key revision bullets, definitions, and active recall practice in seconds.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateToSummarize('upload')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm shadow-md transition-all active:scale-98"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Upload PDF / TXT</span>
            </button>
            <button
              onClick={() => onNavigateToSummarize('paste')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 font-semibold text-sm transition-all active:scale-98"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Paste Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Notes</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalNotes}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Practice Quizzes</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuizzes}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Flashcards</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalFlashcards}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Languages</p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>English & اردو</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Ready-to-Test Sample Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Instant Test: Pick a Sample Document</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test real AI summarization right now with pre-built academic topics.
            </p>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50 self-start">
            1-Click Load
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_NOTES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onLoadSampleNote(sample)}
              className="cursor-pointer group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {sample.category}
                  </span>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    {sample.language.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {sample.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                <span>Load & Summarize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Summarized Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Recently Summarized Notes</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access your previous study sessions, practice questions, and flashcards.
            </p>
          </div>
          {savedNotes.length > 0 && (
            <button
              onClick={() => onNavigateToSummarize('paste')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Summarize Another
            </button>
          )}
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No summarized notes yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Upload your first lecture slides, chapter notes, or PDF document to see your summaries here.
            </p>
            <button
              onClick={() => onNavigateToSummarize('paste')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              Start Summarizing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400 uppercase">
                      {note.language}
                    </span>
                  </div>

                  <h4
                    onClick={() => onOpenSavedNote(note)}
                    className="font-bold text-slate-900 dark:text-white text-base hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1 mb-2"
                  >
                    {note.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {note.shortSummary || note.detailedSummary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                      {note.bulletPoints?.length || 0} Key Points
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                      {note.definitions?.length || 0} Definitions
                    </span>
                    {note.quiz && note.quiz.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                        {note.quiz.length} Quiz Qs
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenSavedNote(note)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>Open & Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => exportNoteToPDF(note)}
                      title="Download PDF"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
