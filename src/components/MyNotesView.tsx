import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  Calendar,
  Languages,
  ArrowRight,
  BookOpen,
  HelpCircle,
  CreditCard,
  AlertTriangle,
  FileText,
  Filter,
} from 'lucide-react';
import { AppLanguage, SavedNote } from '../types';
import { exportNoteToPDF, exportNoteToTXT } from '../utils/pdfExporter';

interface MyNotesViewProps {
  savedNotes: SavedNote[];
  onOpenNote: (note: SavedNote) => void;
  onDeleteNote: (id: string) => void;
  onClearAll: () => void;
  onNavigateToQuiz: (note: SavedNote) => void;
  onNavigateToFlashcards: (note: SavedNote) => void;
  onNewNote: () => void;
  language: AppLanguage;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({
  savedNotes,
  onOpenNote,
  onDeleteNote,
  onClearAll,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  onNewNote,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'ur'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    return savedNotes.filter((note) => {
      // Language filter
      if (languageFilter !== 'all' && note.language !== languageFilter) {
        return false;
      }
      // Search query across title, shortSummary, definitions, bullet points
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchSummary = (note.shortSummary || '').toLowerCase().includes(q);
      const matchBullets = (note.bulletPoints || []).some((bp) =>
        bp.toLowerCase().includes(q)
      );
      const matchDefs = (note.definitions || []).some(
        (d) => d.term.toLowerCase().includes(q) || d.definition.toLowerCase().includes(q)
      );
      return matchTitle || matchSummary || matchBullets || matchDefs;
    });
  }, [savedNotes, searchQuery, languageFilter]);

  const handleCopyNote = (note: SavedNote) => {
    const text = `${note.title}\n\nSUMMARY:\n${note.shortSummary}\n\n${note.detailedSummary}\n\nKEY POINTS:\n${(note.bulletPoints || []).map((p) => '• ' + p).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Saved Notes Library & History</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search, review, export, and manage your previous study sessions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onNewNote}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              + Summarize New Note
            </button>

            {savedNotes.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, keyword, definition, or concept..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="grid grid-cols-3 gap-1 w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setLanguageFilter('all')}
                className={`py-1.5 rounded-lg transition-all ${
                  languageFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({savedNotes.length})
              </button>
              <button
                onClick={() => setLanguageFilter('en')}
                className={`py-1.5 rounded-lg transition-all ${
                  languageFilter === 'en'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguageFilter('ur')}
                className={`py-1.5 rounded-lg transition-all ${
                  languageFilter === 'ur'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-urdu'
                    : 'text-slate-600 dark:text-slate-400 font-urdu'
                }`}
              >
                اردو
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-xs font-medium">
              Are you sure you want to clear your saved notes history? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Yes, Clear All
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {searchQuery ? 'No matching notes found' : 'Your library is empty'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with another keyword or clearing your filter.'
              : 'Summarize your first lecture or document to save it here for future revision.'}
          </p>
          <button
            onClick={onNewNote}
            className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            Summarize a Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Top metadata row */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase">
                      {note.language}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 capitalize">
                      {note.summaryLength}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onOpenNote(note)}
                  className={`font-bold text-slate-900 dark:text-white text-base hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-2 mb-2 ${
                    note.language === 'ur' ? 'font-urdu text-lg' : ''
                  }`}
                >
                  {note.title}
                </h3>

                {/* Summary Preview */}
                <p
                  className={`text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 ${
                    note.language === 'ur' ? 'font-urdu text-sm' : ''
                  }`}
                >
                  {note.shortSummary || note.detailedSummary}
                </p>

                {/* Content badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {note.bulletPoints?.length || 0} Key Points
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {note.definitions?.length || 0} Definitions
                  </span>
                  {note.quiz && note.quiz.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                      {note.quiz.length} Quiz Qs
                    </span>
                  )}
                  {note.flashcards && note.flashcards.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                      {note.flashcards.length} Flashcards
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onOpenNote(note)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>Open & Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyNote(note)}
                      title="Copy Summary"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => exportNoteToTXT(note)}
                      title="Download TXT"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportNoteToPDF(note)}
                      title="Download PDF"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      title="Delete Note"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick study links */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => onNavigateToQuiz(note)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Practice Quiz</span>
                  </button>
                  <button
                    onClick={() => onNavigateToFlashcards(note)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Flashcards</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
