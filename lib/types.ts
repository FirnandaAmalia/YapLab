// ─── Vocabulary ────────────────────────────────────────────────────────────────
export type { PartOfSpeech, CEFRLevel, VocabWord } from './vocabulary-data';

// ─── SRS State ─────────────────────────────────────────────────────────────────
export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export type DifficultyLevel = 'new' | 'learning' | 'review' | 'mastered';

export interface SRSCard {
  wordId: string;
  nextReviewDate: number; // Unix timestamp ms
  reviewCount: number;
  difficulty: DifficultyLevel;
  easeFactor: number;
  interval: number; // days
  lastStudied: number; // timestamp
}

// ─── Study Mode ────────────────────────────────────────────────────────────────
export type StudyMode = 'flashcard' | 'quiz' | 'quiz-reverse' | 'shadowing' | 'guess';

// ─── Listening ─────────────────────────────────────────────────────────────────
export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  translation_id: string;
}

export interface ListeningVideo {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  duration: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  category: 'Movie Clips' | 'Daily Conversation' | 'Songs' | 'BBC/VOA' | 'TOEIC/IELTS' | 'Kids';
  transcript: TranscriptSegment[];
  thumbnailUrl: string;
}

// ─── Notes ─────────────────────────────────────────────────────────────────────
export interface SegmentNoteData {
  id: string;
  videoId: string;
  segmentId: string;
  segmentText: string;
  note: string;
  timestamp: number; // segment start time in seconds
  createdAt: number; // unix ms
}