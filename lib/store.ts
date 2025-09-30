import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Document {
  id: string;
  name: string;
  content: string;
  summary: string[];
  uploadedAt: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  explanation: string;
}

export interface TestResult {
  documentId: string;
  score: number;
  totalQuestions: number;
  incorrectQuestions: string[];
  completedAt: number;
}

export interface Flashcard {
  id: string;
  topic: string;
  question: string;
  answer: string;
  mastered: boolean;
}

interface AppState {
  documents: Document[];
  currentDocument: Document | null;
  questions: Question[];
  testResult: TestResult | null;
  flashcards: Flashcard[];

  addDocument: (doc: Document) => void;
  setCurrentDocument: (doc: Document | null) => void;
  setQuestions: (questions: Question[]) => void;
  setTestResult: (result: TestResult) => void;
  setFlashcards: (flashcards: Flashcard[]) => void;
  markFlashcardMastered: (id: string) => void;
  resetTest: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      documents: [],
      currentDocument: null,
      questions: [],
      testResult: null,
      flashcards: [],

      addDocument: (doc) =>
        set(() => ({
          documents: [doc], // Replace old documents instead of appending
          currentDocument: doc,
          questions: [], // Clear old questions
          testResult: null, // Clear old test results
          flashcards: [], // Clear old flashcards
        })),

      setCurrentDocument: (doc) => set({ currentDocument: doc }),

      setQuestions: (questions) => set({ questions }),

      setTestResult: (result) => set({ testResult: result }),

      setFlashcards: (flashcards) => set({ flashcards }),

      markFlashcardMastered: (id) =>
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? { ...card, mastered: true } : card
          ),
        })),

      resetTest: () =>
        set({ questions: [], testResult: null, flashcards: [] }),
    }),
    {
      name: 'learning-app-storage',
      version: 1, // Increment this to clear old storage
      partialize: (state) => ({
        // Exclude the large 'content' field from persistence
        documents: state.documents.map(doc => ({
          ...doc,
          content: '', // Don't store full document content
        })),
        currentDocument: state.currentDocument ? {
          ...state.currentDocument,
          content: '', // Don't store full document content
        } : null,
        questions: state.questions,
        testResult: state.testResult,
        flashcards: state.flashcards,
      }),
    }
  )
);