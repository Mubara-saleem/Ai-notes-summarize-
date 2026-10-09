import { SavedNote } from '../types';

const STORAGE_KEY = 'ai_notes_summarizer_saved_notes_v1';

const INITIAL_SEEDED_NOTE: SavedNote = {
  id: 'seed-note-1',
  title: 'Cellular Respiration & Energy Metabolism',
  rawText: 'BIOLOGY 201: Cellular Respiration...',
  language: 'en',
  summaryLength: 'medium',
  createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  shortSummary:
    'Cellular respiration converts biochemical energy from glucose into ATP through three principal stages: Glycolysis, the Citric Acid Cycle, and Oxidative Phosphorylation, producing a theoretical yield of 30-32 ATP.',
  detailedSummary:
    'Cellular respiration is a foundational catabolic pathway. It begins in the cytoplasm with Glycolysis (yielding 2 net ATP and 2 NADH), proceeds to Pyruvate Oxidation in the mitochondrial matrix to create Acetyl-CoA, enters the Citric Acid Cycle to harvest electrons in the form of 6 NADH and 2 FADH2 per glucose, and concludes across the inner mitochondrial cristae with Oxidative Phosphorylation.\n\nDuring Oxidative Phosphorylation, the Electron Transport Chain pumps protons into the intermembrane space, generating a steep proton motive force. Chemiosmosis harnesses this gradient as protons rush through ATP Synthase, driving ATP production. Oxygen is the critical terminal electron acceptor.',
  bulletPoints: [
    'Glycolysis occurs anaerobically in the cytoplasm with a net yield of 2 ATP and 2 NADH.',
    'Pyruvate oxidation produces Acetyl-CoA and releases CO2 in the mitochondrial matrix.',
    'The Krebs Cycle generates 6 NADH, 2 FADH2, and 2 ATP per glucose molecule.',
    'Oxidative phosphorylation generates ~28 ATP via chemiosmosis and the ATP synthase motor.',
    'Oxygen acts as the final electron acceptor in the electron transport chain, forming water.',
    'Phosphofructokinase (PFK) is the master allosteric regulator, inhibited by high ATP levels.',
  ],
  definitions: [
    {
      term: 'Cellular Respiration',
      definition:
        'The metabolic process by which cells break down glucose and nutrients to harvest energy in the form of ATP.',
    },
    {
      term: 'Chemiosmosis',
      definition:
        'The movement of protons across a semipermeable membrane down their electrochemical gradient to drive ATP synthesis.',
    },
    {
      term: 'Phosphofructokinase (PFK)',
      definition:
        'The key rate-limiting allosteric enzyme in glycolysis that prevents wasteful energy consumption when ATP is abundant.',
    },
    {
      term: 'Proton Motive Force',
      definition:
        'The electrochemical potential created by pumping H+ ions from the mitochondrial matrix into the intermembrane space.',
    },
  ],
  keyConcepts: [
    {
      concept: 'Coupled Energy Transfer',
      explanation:
        'Electron carriers (NADH and FADH2) capture high-energy electrons from catabolic oxidation and transfer them to the ETC.',
    },
    {
      concept: 'ATP Synthase Molecular Motor',
      explanation:
        'Rotary catalysis mechanism where mechanical energy of rotating subunits phosphorylates ADP into ATP.',
    },
  ],
  quiz: [
    {
      id: 'seed-q1',
      type: 'mcq',
      question: 'Where does glycolysis take place within the eukaryotic cell?',
      options: ['Mitochondrial Matrix', 'Cytosol (Cytoplasm)', 'Inner Membrane Cristae', 'Nucleus'],
      correctAnswer: 'Cytosol (Cytoplasm)',
      explanation: 'Glycolysis is an anaerobic cytoplasmic pathway that does not require organelles.',
    },
    {
      id: 'seed-q2',
      type: 'true_false',
      question: 'Oxygen acts as the primary electron donor in the electron transport chain.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'Oxygen is the terminal electron acceptor, not an electron donor. It accepts electrons and binds protons to form H2O.',
    },
    {
      id: 'seed-q3',
      type: 'short',
      question: 'What is the net gain of ATP molecules produced directly from glycolysis per glucose molecule?',
      options: [],
      correctAnswer: '2 ATP',
      explanation: 'While 4 ATP are generated during the payoff phase, 2 are consumed in the investment phase, leaving a net yield of 2 ATP.',
    },
  ],
  flashcards: [
    {
      id: 'seed-fc1',
      front: 'What is the net ATP yield of Glycolysis?',
      back: '2 ATP (4 produced minus 2 consumed in the investment phase) plus 2 NADH.',
      category: 'Stage 1',
      hint: 'Investment vs Payoff',
    },
    {
      id: 'seed-fc2',
      front: 'What is the terminal electron acceptor in the Electron Transport Chain?',
      back: 'Molecular Oxygen (O2), which combines with protons to form H2O.',
      category: 'Stage 3',
      hint: 'Required for aerobic respiration',
    },
    {
      id: 'seed-fc3',
      front: 'What enzyme catalyzes ATP synthesis powered by proton gradients?',
      back: 'ATP Synthase via chemiosmosis rotary catalysis.',
      category: 'Enzymes',
      hint: 'Molecular turbine',
    },
    {
      id: 'seed-fc4',
      front: 'Where does the Citric Acid (Krebs) Cycle occur?',
      back: 'In the Mitochondrial Matrix.',
      category: 'Stage 2',
      hint: 'Inside the inner membrane',
    },
  ],
  estimatedReadTimeMinutes: 3,
  readingDifficulty: 'Intermediate',
};

export function getSavedNotes(): SavedNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial note
      localStorage.setItem(STORAGE_KEY, JSON.stringify([INITIAL_SEEDED_NOTE]));
      return [INITIAL_SEEDED_NOTE];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading notes from localStorage:', e);
    return [INITIAL_SEEDED_NOTE];
  }
}

export function saveNote(note: SavedNote): void {
  try {
    const existing = getSavedNotes();
    const index = existing.findIndex((n) => n.id === note.id);
    let updated: SavedNote[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      updated = [note, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving note:', e);
  }
}

export function deleteNote(id: string): void {
  try {
    const existing = getSavedNotes();
    const filtered = existing.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting note:', e);
  }
}

export function clearAllNotes(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing notes:', e);
  }
}
