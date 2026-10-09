import React from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  HelpCircle,
  CreditCard,
  Settings,
  Sparkles,
  BookOpen,
  X,
  Languages,
} from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  savedNotesCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  savedNotesCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'summarize',
      label: 'Summarize Notes',
      icon: <Sparkles className="w-5 h-5" />,
      badge: 'AI',
    },
    {
      id: 'myNotes',
      label: 'My Notes',
      icon: <FolderOpen className="w-5 h-5" />,
      badge: savedNotesCount > 0 ? savedNotesCount : undefined,
    },
    {
      id: 'quiz',
      label: 'Quiz Generator',
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  AI Notes
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                  Study
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Smart Study Assistant
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Language & Study Tip Banner */}
        <div className="p-4 m-4 rounded-2xl bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-purple-950/30 border border-blue-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1.5">
            <Languages className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Bilingual Study
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Generate and revise summaries, quizzes, and flashcards in <strong>English</strong> or <strong>Urdu (اردو)</strong> seamlessly.
          </p>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>Powered by Gemini 3.8</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </span>
        </div>
      </aside>
    </>
  );
};
