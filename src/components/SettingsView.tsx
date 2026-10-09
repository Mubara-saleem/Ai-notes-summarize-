import React, { useState, useEffect } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Languages,
  Sparkles,
  Database,
  Trash2,
  Check,
  ShieldCheck,
  Info,
  BookOpen,
  Keyboard,
} from 'lucide-react';
import { AppLanguage, SummaryLength } from '../types';
import { checkServerHealth } from '../utils/api';

interface SettingsViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onClearAllNotes: () => void;
  totalNotesCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  darkMode,
  onToggleDarkMode,
  language,
  onLanguageChange,
  onClearAllNotes,
  totalNotesCount,
}) => {
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [clearSuccess, setClearSuccess] = useState(false);

  useEffect(() => {
    checkServerHealth().then((status) => {
      setServerStatus(status);
    });
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all saved notes and flashcards?')) {
      onClearAllNotes();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Preferences & Settings</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your AI study assistant preferences, language, and storage.
          </p>
        </div>

        {/* Section 1: Appearance & Theme */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Appearance
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Theme Appearance
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently using {darkMode ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleDarkMode}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-blue-500 transition-colors"
            >
              Toggle {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Section 2: Language Preference */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Language Settings
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Default Study Language
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your preferred default language for summaries, quizzes, and flashcards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  language === 'en'
                    ? 'border-blue-600 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <p className="text-xs font-bold">English (UK/US)</p>
                <p className="text-[11px] text-slate-400">Standard Academic Terminology</p>
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('ur')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  language === 'ur'
                    ? 'border-purple-600 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <p className="text-xs font-bold font-urdu">اردو (Urdu)</p>
                <p className="text-[11px] text-slate-400 font-urdu">تعلیمی خلاصہ اور امتحانی مشق</p>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: AI Engine Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            AI Engine & Integration
          </h3>

          <div className="p-4 rounded-2xl bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-800/80 dark:to-indigo-950/20 border border-blue-100 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Gemini 3.8 Flash
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    High-efficiency text & academic reasoning model
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              Your API requests are proxied securely through the full-stack server backend. API keys are never exposed in browser bundles, in compliance with security guidelines.
            </p>
          </div>
        </div>

        {/* Section 4: Local Storage Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Data Storage
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Local Saved Notes: {totalNotesCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Stored securely inside your browser's persistent storage
                </p>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>

          {clearSuccess && (
            <p className="text-xs text-emerald-600 font-semibold">
              All stored notes have been successfully reset.
            </p>
          )}
        </div>

        {/* Section 5: Study Tips & Keyboard Shortcuts */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Keyboard className="w-4 h-4" />
            <span>Flashcards Keyboard Shortcuts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Space / Enter</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Flip the active flashcard</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Arrow Right (&rarr;)</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Advance to next card</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Arrow Left (&larr;)</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Go to previous card</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
