import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  ClipboardPaste,
  Check,
  Copy,
  Download,
  Bookmark,
  Share2,
  AlertCircle,
  Loader2,
  RefreshCw,
  BookOpen,
  ChevronRight,
  HelpCircle,
  CreditCard,
  Languages,
  Maximize2,
  Eye,
  EyeOff,
  Trash2,
  Lightbulb,
} from 'lucide-react';
import {
  AppLanguage,
  Flashcard,
  NoteContentTab,
  QuizQuestion,
  SavedNote,
  SummaryLength,
} from '../types';
import { extractTextFromFile, ExtractedFileResult } from '../utils/fileExtractor';
import {
  apiGenerateFlashcards,
  apiGenerateQuiz,
  apiSimplifyConcept,
  apiSummarize,
  apiTranslateUrdu,
  SummarizeResponse,
} from '../utils/api';
import { exportNoteToPDF, exportNoteToTXT } from '../utils/pdfExporter';
import { SAMPLE_NOTES } from '../data/sampleNotes';

interface SummarizeViewProps {
  initialAction?: 'upload' | 'paste';
  currentNote: SavedNote | null;
  onSaveNote: (note: SavedNote) => void;
  onNavigateToQuiz: (note: SavedNote) => void;
  onNavigateToFlashcards: (note: SavedNote) => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
}

export const SummarizeView: React.FC<SummarizeViewProps> = ({
  initialAction,
  currentNote,
  onSaveNote,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  language,
  onLanguageChange,
}) => {
  const [inputText, setInputText] = useState<string>(currentNote?.rawText || '');
  const [title, setTitle] = useState<string>(currentNote?.title || 'Lecture Study Notes');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>(
    currentNote?.summaryLength || 'medium'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(
    currentNote?.language || language
  );

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<ExtractedFileResult | null>(
    currentNote?.fileName
      ? {
          fileName: currentNote.fileName,
          fileSize: 0,
          fileType: currentNote.fileType || 'Document',
          text: currentNote.rawText,
          wordCount: currentNote.rawText.split(/\s+/).length,
        }
      : null
  );
  const [showExtractedPreview, setShowExtractedPreview] = useState(false);
  const [isExtractingFile, setIsExtractingFile] = useState(false);

  // Generation & Results State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analyzing study notes...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NoteContentTab>('summary');

  // Active result state
  const [activeSummary, setActiveSummary] = useState<SavedNote | null>(currentNote);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(Boolean(currentNote));

  // Secondary generators loading
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [urduTranslation, setUrduTranslation] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync when currentNote changes externally (e.g. from Dashboard or My Notes)
  useEffect(() => {
    if (currentNote) {
      setInputText(currentNote.rawText);
      setTitle(currentNote.title);
      setSummaryLength(currentNote.summaryLength);
      setSelectedLanguage(currentNote.language);
      setActiveSummary(currentNote);
      setIsSaved(true);
    }
  }, [currentNote]);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsExtractingFile(true);

    try {
      const extracted = await extractTextFromFile(file);
      setUploadedFile(extracted);
      setInputText(extracted.text);
      if (!title || title === 'Lecture Study Notes') {
        const cleanName = extracted.fileName.replace(/\.[^/.]+$/, '');
        setTitle(cleanName);
      }
      setShowExtractedPreview(true);
    } catch (err: any) {
      console.error('File extraction failed:', err);
      setErrorMessage(err.message || 'Failed to extract text from file.');
    } finally {
      setIsExtractingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Please type, paste, or upload study notes before summarizing.');
      return;
    }

    if (wordCount < 10) {
      setErrorMessage(
        'The provided text is very short (less than 10 words). Please enter more lecture material or textbook content for an accurate summary.'
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStep('Reading & parsing notes with Gemini AI...');

    const stepTimer = setTimeout(() => {
      setLoadingStep('Synthesizing key definitions & core concepts...');
    }, 1800);

    try {
      const result = await apiSummarize({
        text: inputText,
        title: title || 'Study Notes',
        language: selectedLanguage,
        length: summaryLength,
      });

      clearTimeout(stepTimer);

      const newNote: SavedNote = {
        id: activeSummary?.id || 'note_' + Date.now(),
        title: title.trim() || 'Study Notes',
        rawText: inputText,
        fileName: uploadedFile?.fileName,
        fileType: uploadedFile?.fileType,
        createdAt: activeSummary?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        language: selectedLanguage,
        summaryLength,
        shortSummary: result.shortSummary,
        detailedSummary: result.detailedSummary,
        bulletPoints: result.bulletPoints,
        definitions: result.definitions,
        keyConcepts: result.keyConcepts,
        quiz: activeSummary?.quiz || [],
        flashcards: activeSummary?.flashcards || [],
        estimatedReadTimeMinutes: result.estimatedReadTimeMinutes,
        readingDifficulty: result.readingDifficulty,
      };

      setActiveSummary(newNote);
      setIsSaved(false);
      // Auto-save initial version
      onSaveNote(newNote);
      setIsSaved(true);
      setActiveTab('summary');
    } catch (err: any) {
      console.error('Summarization failed:', err);
      setErrorMessage(err.message || 'Failed to summarize notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuizOnDemand = async () => {
    if (!inputText.trim()) return;
    setIsGeneratingQuiz(true);
    setErrorMessage(null);
    try {
      const res = await apiGenerateQuiz({
        text: inputText,
        count: 5,
        language: selectedLanguage,
      });
      if (activeSummary) {
        const updated = { ...activeSummary, quiz: res.questions };
        setActiveSummary(updated);
        onSaveNote(updated);
      }
      setActiveTab('quiz');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate quiz.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcardsOnDemand = async () => {
    if (!inputText.trim()) return;
    setIsGeneratingFlashcards(true);
    setErrorMessage(null);
    try {
      const res = await apiGenerateFlashcards({
        text: inputText,
        count: 8,
        language: selectedLanguage,
      });
      if (activeSummary) {
        const updated = { ...activeSummary, flashcards: res.flashcards };
        setActiveSummary(updated);
        onSaveNote(updated);
      }
      setActiveTab('flashcards');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleSimplifyOnDemand = async () => {
    if (!inputText.trim()) return;
    setIsSimplifying(true);
    setErrorMessage(null);
    try {
      const res = await apiSimplifyConcept({
        text: activeSummary?.shortSummary || inputText,
        language: selectedLanguage,
      });
      if (activeSummary) {
        const updated = { ...activeSummary, simplified: res };
        setActiveSummary(updated);
        onSaveNote(updated);
      }
      setActiveTab('simplify');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to simplify concept.');
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleTranslateUrduOnDemand = async () => {
    const textToTranslate = activeSummary?.detailedSummary || inputText;
    if (!textToTranslate) return;
    setIsTranslating(true);
    try {
      const res = await apiTranslateUrdu({
        text: textToTranslate,
        targetLanguage: selectedLanguage === 'ur' ? 'en' : 'ur',
      });
      setUrduTranslation(res.translatedText);
    } catch (err: any) {
      setErrorMessage(err.message || 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_NOTES.find((s) => s.id === sampleId);
    if (!sample) return;
    setTitle(sample.title);
    setInputText(sample.text);
    setSelectedLanguage(sample.language);
    setUploadedFile(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Input Study Material</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide lecture slides, textbook excerpts, or typed notes below.
            </p>
          </div>

          {/* Sample loader quick picker */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Load sample:</span>
            <select
              onChange={(e) => handleLoadSample(e.target.value)}
              defaultValue=""
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="" disabled>
                Select Sample Topic...
              </option>
              {SAMPLE_NOTES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.language.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Note Title / Subject
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Biology 101 - Cell Respiration & Krebs Cycle"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </div>

        {/* File Upload Banner / Dropzone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-blue-200 dark:border-blue-900/60 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-4 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all flex items-center space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Upload PDF or TXT Document
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports .pdf, .txt, .md (Extracts selectable text)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.rtf,text/plain,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div
            onClick={() => {
              navigator.clipboard.readText().then((clip) => {
                if (clip) setInputText(clip);
              }).catch(() => {});
            }}
            className="cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex items-center space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Paste from Clipboard
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Quickly insert copied lecture notes or slides
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded File Indicator Banner */}
        {isExtractingFile && (
          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Extracting text from document... please wait.</span>
          </div>
        )}

        {uploadedFile && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {uploadedFile.fileName.split('.').pop() || 'DOC'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {uploadedFile.fileName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {uploadedFile.fileType} • {uploadedFile.wordCount.toLocaleString()} extracted words
                  {uploadedFile.pageCount ? ` • ${uploadedFile.pageCount} pages` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                {showExtractedPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showExtractedPreview ? 'Hide Preview' : 'Preview Text'}</span>
              </button>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setInputText('');
                }}
                className="text-xs p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                title="Remove uploaded document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Study Material Text
            </label>
            <div className="flex items-center space-x-3 text-slate-400">
              <span>{wordCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{charCount.toLocaleString()} chars</span>
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="text-rose-500 hover:underline text-xs ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            placeholder="Type or paste your lecture content, chapter notes, textbook paragraphs, or discussion prompts here..."
            className={`w-full p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-sans leading-relaxed ${
              selectedLanguage === 'ur' ? 'font-urdu text-base' : ''
            }`}
          />
        </div>

        {/* Controls: Length & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Summary Length */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Summary Depth / Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'short', label: 'Short', desc: 'Main ideas in 2-3 sentences' },
                { id: 'medium', label: 'Medium', desc: 'Balanced core breakdown' },
                { id: 'detailed', label: 'Detailed', desc: 'In-depth comprehensive notes' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSummaryLength(opt.id as SummaryLength)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    summaryLength === opt.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Language Output
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('en');
                  onLanguageChange('en');
                }}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                  selectedLanguage === 'en'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">English</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Standard Academic</p>
                </div>
                <span className="text-sm">🇬🇧</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('ur');
                  onLanguageChange('ur');
                }}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                  selectedLanguage === 'ur'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:border-purple-500 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>
                  <p className="text-xs font-bold font-urdu">اردو (Urdu)</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">فصیح تعلیمی زبان</p>
                </div>
                <span className="text-sm font-urdu">🇵🇰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Processing Note</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSummarize}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2.5 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Summarize My Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {activeSummary && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          {/* Results Header Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeSummary.title}
                </h3>
                {isSaved && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Read time: ~{activeSummary.estimatedReadTimeMinutes || 2} min • Difficulty:{' '}
                {activeSummary.readingDifficulty || 'Intermediate'} • Output:{' '}
                {activeSummary.language.toUpperCase()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  onSaveNote(activeSummary);
                  setIsSaved(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{isSaved ? 'Save Updates' : 'Save to Library'}</span>
              </button>

              <button
                onClick={() =>
                  copyToClipboard(
                    `${activeSummary.title}\n\nSHORT SUMMARY:\n${activeSummary.shortSummary}\n\nDETAILED SUMMARY:\n${activeSummary.detailedSummary}\n\nKEY POINTS:\n${activeSummary.bulletPoints.map((p) => '• ' + p).join('\n')}`,
                    'all'
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {copiedKey === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>

              <button
                onClick={() => exportNoteToTXT(activeSummary)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TXT</span>
              </button>

              <button
                onClick={() => exportNoteToPDF(activeSummary)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-2">
            {[
              { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
              {
                id: 'bulletPoints',
                label: `Key Points (${activeSummary.bulletPoints?.length || 0})`,
                icon: <ChevronRight className="w-4 h-4" />,
              },
              {
                id: 'definitions',
                label: `Definitions (${activeSummary.definitions?.length || 0})`,
                icon: <BookOpen className="w-4 h-4" />,
              },
              {
                id: 'concepts',
                label: `Key Concepts (${activeSummary.keyConcepts?.length || 0})`,
                icon: <Sparkles className="w-4 h-4" />,
              },
              {
                id: 'quiz',
                label: `Practice Quiz (${activeSummary.quiz?.length || 0})`,
                icon: <HelpCircle className="w-4 h-4" />,
              },
              {
                id: 'flashcards',
                label: `Flashcards (${activeSummary.flashcards?.length || 0})`,
                icon: <CreditCard className="w-4 h-4" />,
              },
              {
                id: 'simplify',
                label: 'Simplify (ELI5)',
                icon: <Lightbulb className="w-4 h-4" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as NoteContentTab)}
                className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content 1: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Short Summary Card */}
              <div className="p-6 rounded-2xl bg-linear-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Summary (Core Takeaways)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeSummary.shortSummary, 'short')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    title="Copy short summary"
                  >
                    {copiedKey === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p
                  className={`text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed ${
                    activeSummary.language === 'ur' ? 'font-urdu text-lg leading-loose' : ''
                  }`}
                >
                  {activeSummary.shortSummary}
                </p>
              </div>

              {/* Detailed Summary Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Detailed Concept Breakdown
                  </h4>
                  <button
                    onClick={() => copyToClipboard(activeSummary.detailedSummary, 'detailed')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy detailed summary"
                  >
                    {copiedKey === 'detailed' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div
                  className={`p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line ${
                    activeSummary.language === 'ur' ? 'font-urdu text-lg leading-loose' : ''
                  }`}
                >
                  {activeSummary.detailedSummary}
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('bulletPoints')}
                  className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                >
                  <span>Review Key Points</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (!activeSummary.quiz || activeSummary.quiz.length === 0) {
                      handleGenerateQuizOnDemand();
                    } else {
                      setActiveTab('quiz');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold text-xs hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Practice Quiz</span>
                </button>
                <button
                  onClick={() => {
                    if (!activeSummary.flashcards || activeSummary.flashcards.length === 0) {
                      handleGenerateFlashcardsOnDemand();
                    } else {
                      setActiveTab('flashcards');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Review Flashcards</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Content 2: Bullet Points */}
          {activeTab === 'bulletPoints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    High-Yield Revision Points
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Quick-reference points distilled for exam preparation.
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeSummary.bulletPoints.map((p) => `• ${p}`).join('\n'),
                      'bullets'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1.5"
                >
                  {copiedKey === 'bullets' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Points</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {activeSummary.bulletPoints.map((point, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3.5 group hover:border-blue-300 dark:hover:border-blue-600/50 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <p
                      className={`text-slate-800 dark:text-slate-200 text-sm leading-relaxed flex-1 ${
                        activeSummary.language === 'ur' ? 'font-urdu text-base' : ''
                      }`}
                    >
                      {point}
                    </p>
                    <button
                      onClick={() => copyToClipboard(point, `bp_${index}`)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-opacity"
                      title="Copy item"
                    >
                      {copiedKey === `bp_${index}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 3: Definitions */}
          {activeTab === 'definitions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Essential Glossary & Definitions
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Accurate definitions of key academic terms extracted from your notes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSummary.definitions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          Term {idx + 1}
                        </span>
                        <button
                          onClick={() => copyToClipboard(`${item.term}: ${item.definition}`, `def_${idx}`)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600"
                        >
                          {copiedKey === `def_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <h5
                        className={`text-base font-bold text-slate-900 dark:text-white mb-2 ${
                          activeSummary.language === 'ur' ? 'font-urdu' : ''
                        }`}
                      >
                        {item.term}
                      </h5>
                      <p
                        className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${
                          activeSummary.language === 'ur' ? 'font-urdu text-base' : ''
                        }`}
                      >
                        {item.definition}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 4: Key Concepts */}
          {activeTab === 'concepts' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Key Concepts & Relationships
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fundamental theories, conceptual mechanisms, and their connections.
                </p>
              </div>

              <div className="space-y-4">
                {activeSummary.keyConcepts.map((kc, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Concept #{idx + 1}</span>
                      </span>
                    </div>
                    <h5
                      className={`text-base font-bold text-slate-900 dark:text-white ${
                        activeSummary.language === 'ur' ? 'font-urdu' : ''
                      }`}
                    >
                      {kc.concept}
                    </h5>
                    <p
                      className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${
                        activeSummary.language === 'ur' ? 'font-urdu text-base' : ''
                      }`}
                    >
                      {kc.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 5: Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Practice Quiz for This Note</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Test your understanding with AI-generated MCQs, True/False, and short-answer questions.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleGenerateQuizOnDemand}
                    disabled={isGeneratingQuiz}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>
                          {activeSummary.quiz && activeSummary.quiz.length > 0
                            ? 'Regenerate Quiz'
                            : 'Generate Quiz'}
                        </span>
                      </>
                    )}
                  </button>
                  {activeSummary.quiz && activeSummary.quiz.length > 0 && (
                    <button
                      onClick={() => onNavigateToQuiz(activeSummary)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Interactive Mode &rarr;
                    </button>
                  )}
                </div>
              </div>

              {(!activeSummary.quiz || activeSummary.quiz.length === 0) ? (
                <div className="text-center py-12 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No quiz generated yet for this note
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Click "Generate Quiz" to create 5 customized practice questions based on these lecture notes.
                  </p>
                  <button
                    onClick={handleGenerateQuizOnDemand}
                    disabled={isGeneratingQuiz}
                    className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Generate Practice Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSummary.quiz.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 uppercase">
                          {q.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">Question {idx + 1}</span>
                      </div>
                      <p
                        className={`text-sm sm:text-base font-semibold text-slate-900 dark:text-white ${
                          activeSummary.language === 'ur' ? 'font-urdu text-lg' : ''
                        }`}
                      >
                        {q.question}
                      </p>

                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl text-xs font-medium border ${
                                opt === q.correctAnswer
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 text-xs space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Correct Answer: <span className="text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content 6: Flashcards */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Active Recall Flashcards</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Important terms and concepts ready for spaced repetition.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleGenerateFlashcardsOnDemand}
                    disabled={isGeneratingFlashcards}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {isGeneratingFlashcards ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>
                          {activeSummary.flashcards && activeSummary.flashcards.length > 0
                            ? 'Regenerate Flashcards'
                            : 'Generate Flashcards'}
                        </span>
                      </>
                    )}
                  </button>
                  {activeSummary.flashcards && activeSummary.flashcards.length > 0 && (
                    <button
                      onClick={() => onNavigateToFlashcards(activeSummary)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Flip Card Mode &rarr;
                    </button>
                  )}
                </div>
              </div>

              {(!activeSummary.flashcards || activeSummary.flashcards.length === 0) ? (
                <div className="text-center py-12 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No flashcards created yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Click "Generate Flashcards" to create 8 interactive study cards from this document.
                  </p>
                  <button
                    onClick={handleGenerateFlashcardsOnDemand}
                    disabled={isGeneratingFlashcards}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Generate Flashcards
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSummary.flashcards.map((fc, idx) => (
                    <div
                      key={fc.id || idx}
                      className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                            {fc.category || 'Term'}
                          </span>
                          <span className="text-xs text-slate-400">Card #{idx + 1}</span>
                        </div>
                        <h5
                          className={`text-base font-bold text-slate-900 dark:text-white mb-3 ${
                            activeSummary.language === 'ur' ? 'font-urdu' : ''
                          }`}
                        >
                          {fc.front}
                        </h5>
                        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
                          <p className="text-xs font-semibold text-slate-400 mb-1">Answer / Concept:</p>
                          <p
                            className={`text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed ${
                              activeSummary.language === 'ur' ? 'font-urdu text-base' : ''
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
              )}
            </div>
          )}

          {/* Tab Content 7: Simplify (ELI5) */}
          {activeTab === 'simplify' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span>Explain Like I'm a Beginner (ELI5)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Simplify dense academic concepts using intuitive everyday analogies.
                  </p>
                </div>
                <button
                  onClick={handleSimplifyOnDemand}
                  disabled={isSimplifying}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSimplifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Simplifying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeSummary.simplified ? 'Regenerate Simplification' : 'Simplify Concepts'}</span>
                    </>
                  )}
                </button>
              </div>

              {!activeSummary.simplified ? (
                <div className="text-center py-12 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <Lightbulb className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Need this explained more simply?
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Click "Simplify Concepts" to break down complex jargon with real-world analogies.
                  </p>
                  <button
                    onClick={handleSimplifyOnDemand}
                    disabled={isSimplifying}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs"
                  >
                    Simplify Concepts
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>Plain English Explanation</span>
                    </span>
                    <p
                      className={`text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed ${
                        activeSummary.language === 'ur' ? 'font-urdu text-lg' : ''
                      }`}
                    >
                      {activeSummary.simplified.simplifiedExplanation}
                    </p>
                  </div>

                  {activeSummary.simplified.analogies && activeSummary.simplified.analogies.length > 0 && (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Real-World Analogies:
                      </h5>
                      <div className="space-y-2">
                        {activeSummary.simplified.analogies.map((analogy, aIdx) => (
                          <div key={aIdx} className="flex items-start space-x-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="text-amber-500 font-bold shrink-0">✦</span>
                            <p className={activeSummary.language === 'ur' ? 'font-urdu' : ''}>{analogy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                    <strong>Quick Takeaway:</strong> {activeSummary.simplified.quickTakeaway}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
