import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SRSCard, SRSRating, DifficultyLevel } from './types';
import { vocabularyData } from './vocabulary-data';
import type { StudyMode } from './types';

// ─── SRS interval logic ────────────────────────────────────────────────────────
function getNextInterval(card: SRSCard, rating: SRSRating): Partial<SRSCard> {
  const now = Date.now();
  let { easeFactor, interval, reviewCount } = card;

  switch (rating) {
    case 'again': {
      return {
        nextReviewDate: now + 10 * 60 * 1000,
        reviewCount: reviewCount + 1,
        difficulty: 'learning',
        easeFactor: Math.max(1.3, easeFactor - 0.2),
        interval: 1,
        lastStudied: now,
      };
    }
    case 'hard': {
      interval = Math.max(1, Math.round(interval * 1.2));
      return {
        nextReviewDate: now + interval * 24 * 60 * 60 * 1000,
        reviewCount: reviewCount + 1,
        difficulty: reviewCount === 0 ? 'learning' : 'review',
        easeFactor: Math.max(1.3, easeFactor - 0.15),
        interval,
        lastStudied: now,
      };
    }
    case 'good': {
      if (reviewCount === 0) {
        interval = 1;
      } else if (reviewCount === 1) {
        interval = 4;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      const goodDiff: DifficultyLevel = interval >= 7 ? 'mastered' : 'review';
      return {
        nextReviewDate: now + interval * 24 * 60 * 60 * 1000,
        reviewCount: reviewCount + 1,
        difficulty: goodDiff,
        easeFactor,
        interval,
        lastStudied: now,
      };
    }
    case 'easy': {
      if (reviewCount === 0) {
        interval = 4;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      return {
        nextReviewDate: now + interval * 24 * 60 * 60 * 1000,
        reviewCount: reviewCount + 1,
        difficulty: 'mastered',
        easeFactor: Math.min(4.0, easeFactor + 0.15),
        interval,
        lastStudied: now,
      };
    }
  }
}

function isSameDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

function isYesterday(ts: number) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(ts);
  return d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
}

// ─── Store interface ───────────────────────────────────────────────────────────
interface AppStore {
  // SRS
  srsCards: Record<string, SRSCard>;
  rateCard: (wordId: string, rating: SRSRating) => void;
  getCard: (wordId: string) => SRSCard;
  getDueCards: (category?: string) => string[];

  // Session
  currentMode: StudyMode;
  setMode: (mode: StudyMode) => void;
  selectedCategory: string;
  setCategory: (cat: string) => void;
  currentCardIndex: number;
  setCurrentCardIndex: (idx: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Stats
  totalCards: number;
  studiedToday: number;
  streak: number;
  lastStudyDate: number;

  // Activity log
  activityLog: { date: number; count: number }[];

  // Command Palette
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const defaultCard = (wordId: string): SRSCard => ({
  wordId,
  nextReviewDate: Date.now(),
  reviewCount: 0,
  difficulty: 'new',
  easeFactor: 2.5,
  interval: 0,
  lastStudied: 0,
});

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      srsCards: {},

      getCard: (wordId) => get().srsCards[wordId] ?? defaultCard(wordId),

      rateCard: (wordId, rating) => {
        const now = Date.now();
        const existing = get().getCard(wordId);
        const updates = getNextInterval(existing, rating);
        const { lastStudyDate, streak, activityLog, studiedToday } = get();

        // Update streak
        let newStreak = streak;
        let newStudiedToday = studiedToday;
        let newLastStudyDate = lastStudyDate;

        if (!lastStudyDate || !isSameDay(lastStudyDate, now)) {
          // New day
          if (lastStudyDate && isYesterday(lastStudyDate)) {
            newStreak = streak + 1;
          } else if (lastStudyDate && !isSameDay(lastStudyDate, now)) {
            newStreak = 1; // reset
          } else {
            newStreak = Math.max(1, streak);
          }
          newStudiedToday = 1;
          newLastStudyDate = now;
        } else {
          newStudiedToday = studiedToday + 1;
        }

        // Update activity log
        const todayEntry = activityLog.find(e => isSameDay(e.date, now));
        let newLog;
        if (todayEntry) {
          newLog = activityLog.map(e =>
            isSameDay(e.date, now) ? { ...e, count: e.count + 1 } : e
          );
        } else {
          newLog = [...activityLog, { date: now, count: 1 }].slice(-90);
        }

        set((state) => ({
          srsCards: {
            ...state.srsCards,
            [wordId]: { ...existing, ...updates },
          },
          studiedToday: newStudiedToday,
          streak: newStreak,
          lastStudyDate: newLastStudyDate,
          activityLog: newLog,
        }));
      },

      getDueCards: (category?: string) => {
        const now = Date.now();
        let words = vocabularyData;
        if (category && category !== 'all') {
          words = words.filter(w => w.category === category);
        }
        return words
          .filter((w) => {
            const card = get().srsCards[w.id];
            if (!card) return true;
            return card.nextReviewDate <= now;
          })
          .map((w) => w.id);
      },

      currentMode: 'flashcard',
      setMode: (mode) => set({ currentMode: mode, currentCardIndex: 0 }),

      selectedCategory: 'all',
      setCategory: (cat) => set({ selectedCategory: cat, currentCardIndex: 0 }),

      currentCardIndex: 0,
      setCurrentCardIndex: (idx) => set({ currentCardIndex: idx }),

      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      totalCards: vocabularyData.length,
      studiedToday: 0,
      streak: 0,
      lastStudyDate: 0,
      activityLog: [],

      // Command Palette
      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
    }),
    {
      name: 'yaplab-store-v1',
      partialize: (state) => ({
        srsCards: state.srsCards,
        studiedToday: state.studiedToday,
        streak: state.streak,
        lastStudyDate: state.lastStudyDate,
        activityLog: state.activityLog,
      }),
    }
  )
);