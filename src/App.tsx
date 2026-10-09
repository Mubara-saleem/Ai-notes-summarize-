import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SummarizeView } from './components/SummarizeView';
import { QuizView } from './components/QuizView';
import { FlashcardsView } from './components/FlashcardsView';
import { MyNotesView } from './components/MyNotesView';
import { SettingsView } from './components/SettingsView';
import { AppLanguage, SavedNote, ViewTab } from './types';
import { SampleNoteItem } from './data/sampleNotes';
import {
  clearAllNotes,
  deleteNote,
  getSavedNotes,
  saveNote,
} from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('ai_notes_theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });
  const [language, setLanguage] = useState<AppLanguage>('en');

  // Stored notes state
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [activeNote, setActiveNote] = useState<SavedNote | null>(null);
  const [initialSummarizeAction, setInitialSummarizeAction] = useState<
    'upload' | 'paste' | undefined
  >(undefined);

  // Initialize saved notes
  useEffect(() => {
    const loaded = getSavedNotes();
    setSavedNotes(loaded);
    if (loaded.length > 0) {
      setActiveNote(loaded[0]);
    }
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('ai_notes_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ai_notes_theme', 'light');
    }
  }, [darkMode]);

  const handleSaveNote = (note: SavedNote) => {
    saveNote(note);
    setSavedNotes(getSavedNotes());
    setActiveNote(note);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    const updated = getSavedNotes();
    setSavedNotes(updated);
    if (activeNote?.id === id) {
      setActiveNote(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleClearAllNotes = () => {
    clearAllNotes();
    setSavedNotes([]);
    setActiveNote(null);
  };

  const handleNavigateToSummarize = (action?: 'upload' | 'paste') => {
    setInitialSummarizeAction(action);
    setCurrentTab('summarize');
  };

  const handleLoadSampleFromDashboard = (sample: SampleNoteItem) => {
    // Create a temporary or fresh note object with sample details
    const sampleNote: SavedNote = {
      id: 'sample_' + Date.now(),
      title: sample.title,
      rawText: sample.text,
      language: sample.language,
      summaryLength: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shortSummary: '',
      detailedSummary: '',
      bulletPoints: [],
      definitions: [],
      keyConcepts: [],
    };
    setActiveNote(sampleNote);
    setLanguage(sample.language);
    setCurrentTab('summarize');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        savedNotesCount={savedNotes.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* App Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onQuickNewSummary={() => {
            setActiveNote(null);
            setCurrentTab('summarize');
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          language={language}
          onToggleLanguage={(lang) => setLanguage(lang)}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              savedNotes={savedNotes}
              onNavigateToSummarize={handleNavigateToSummarize}
              onOpenSavedNote={(note) => {
                setActiveNote(note);
                setCurrentTab('summarize');
              }}
              onDeleteNote={handleDeleteNote}
              onNavigateToQuiz={(note) => {
                if (note) setActiveNote(note);
                setCurrentTab('quiz');
              }}
              onNavigateToFlashcards={(note) => {
                if (note) setActiveNote(note);
                setCurrentTab('flashcards');
              }}
              onLoadSampleNote={handleLoadSampleFromDashboard}
              language={language}
            />
          )}

          {currentTab === 'summarize' && (
            <SummarizeView
              initialAction={initialSummarizeAction}
              currentNote={activeNote}
              onSaveNote={handleSaveNote}
              onNavigateToQuiz={(note) => {
                setActiveNote(note);
                setCurrentTab('quiz');
              }}
              onNavigateToFlashcards={(note) => {
                setActiveNote(note);
                setCurrentTab('flashcards');
              }}
              language={language}
              onLanguageChange={(lang) => setLanguage(lang)}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizView
              savedNotes={savedNotes}
              selectedNote={activeNote}
              onSelectNote={(note) => setActiveNote(note)}
              onSaveUpdatedNote={handleSaveNote}
              language={language}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              savedNotes={savedNotes}
              selectedNote={activeNote}
              onSelectNote={(note) => setActiveNote(note)}
              onSaveUpdatedNote={handleSaveNote}
              language={language}
            />
          )}

          {currentTab === 'myNotes' && (
            <MyNotesView
              savedNotes={savedNotes}
              onOpenNote={(note) => {
                setActiveNote(note);
                setCurrentTab('summarize');
              }}
              onDeleteNote={handleDeleteNote}
              onClearAll={handleClearAllNotes}
              onNavigateToQuiz={(note) => {
                setActiveNote(note);
                setCurrentTab('quiz');
              }}
              onNavigateToFlashcards={(note) => {
                setActiveNote(note);
                setCurrentTab('flashcards');
              }}
              onNewNote={() => {
                setActiveNote(null);
                setCurrentTab('summarize');
              }}
              language={language}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((prev) => !prev)}
              language={language}
              onLanguageChange={(lang) => setLanguage(lang)}
              onClearAllNotes={handleClearAllNotes}
              totalNotesCount={savedNotes.length}
            />
          )}
        </main>
      </div>
    </div>
  );
}
