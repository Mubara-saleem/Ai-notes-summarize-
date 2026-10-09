import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  PlusCircle,
  Languages,
  BookOpenCheck,
} from 'lucide-react';
import { AppLanguage, ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  onOpenMobileSidebar: () => void;
  onQuickNewSummary: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: AppLanguage;
  onToggleLanguage: (lang: AppLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onQuickNewSummary,
  darkMode,
  onToggleDarkMode,
  language,
  onToggleLanguage,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Study Dashboard',
          subtitle: 'Welcome to your AI-powered lecture notes companion',
        };
      case 'summarize':
        return {
          title: 'Summarize Notes',
          subtitle: 'Upload documents or paste text to generate instant study guides',
        };
      case 'myNotes':
        return {
          title: 'Saved Notes Library',
          subtitle: 'Revisit, review, and export your previous summaries and flashcards',
        };
      case 'quiz':
        return {
          title: 'AI Practice Quiz',
          subtitle: 'Test your knowledge with custom MCQs, True/False, and short-answers',
        };
      case 'flashcards':
        return {
          title: 'Active Recall Flashcards',
          subtitle: 'Review key terms, concepts, and definitions with flip cards',
        };
      case 'settings':
        return {
          title: 'Settings & Preferences',
          subtitle: 'Customize study options, model settings, and local storage',
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Language selector toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onToggleLanguage('ur')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'ur'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-urdu font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-urdu'
            }`}
          >
            اردو
          </button>
        </div>

        {/* Quick Summarize Action */}
        {currentTab !== 'summarize' && (
          <button
            onClick={onQuickNewSummary}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all duration-150"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>
    </header>
  );
};
