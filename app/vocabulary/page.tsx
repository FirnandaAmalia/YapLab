'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { vocabularyData } from '@/lib/vocabulary-data';
import { CategoryFilter } from '../_components/vocabulary/CategoryFilter';
import { ModeSwitcher } from '../_components/vocabulary/ModeSwitcher';
import { FlashcardCard } from '../_components/vocabulary/FlashcardCard';
import { QuizCard } from '../_components/vocabulary/QuizCard';
import { ShadowingCard } from '../_components/vocabulary/ShadowingCard';
import { GuessCard } from '../_components/vocabulary/GuessCard';
import { SRSControls } from '../_components/vocabulary/SRSControls';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import type { StudyMode } from '@/lib/types';

export default function VocabularyPage() {
  const {
    currentMode, setMode,
    selectedCategory,
    currentCardIndex, setCurrentCardIndex,
    rateCard, getCard, getDueCards,
  } = useAppStore();

  const [cardFlipped, setCardFlipped] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  // Get words for current category
  const words = selectedCategory === 'all'
    ? vocabularyData
    : vocabularyData.filter(w => w.category === selectedCategory);

  const currentWord = words[currentCardIndex % Math.max(1, words.length)];
  const card = currentWord ? getCard(currentWord.id) : null;

  const goNext = useCallback(() => {
    setCurrentCardIndex((currentCardIndex + 1) % Math.max(1, words.length));
    setCardFlipped(false);
    setQuizAnswered(false);
  }, [currentCardIndex, words.length, setCurrentCardIndex]);

  const goPrev = useCallback(() => {
    setCurrentCardIndex((currentCardIndex - 1 + words.length) % Math.max(1, words.length));
    setCardFlipped(false);
    setQuizAnswered(false);
  }, [currentCardIndex, words.length, setCurrentCardIndex]);

  const handleRate = useCallback((rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentWord) return;
    rateCard(currentWord.id, rating);
    goNext();
  }, [currentWord, rateCard, goNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in input / textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (currentMode === 'flashcard') {
            setFlipKey(k => k + 1);
          }
          break;
        case '1':
          if (currentMode === 'flashcard' && cardFlipped) handleRate('again');
          break;
        case '2':
          if (currentMode === 'flashcard' && cardFlipped) handleRate('hard');
          break;
        case '3':
          if (currentMode === 'flashcard' && cardFlipped) handleRate('good');
          break;
        case '4':
          if (currentMode === 'flashcard' && cardFlipped) handleRate('easy');
          break;
        case 'j':
        case 'ArrowRight':
          goNext();
          break;
        case 'k':
        case 'ArrowLeft':
          goPrev();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentMode, cardFlipped, handleRate, goNext, goPrev]);

  const showSRS = currentMode === 'flashcard' && cardFlipped;

  return (
    <div className="flex h-full">
      {/* Left: Category Sidebar */}
      <aside
        className="w-52 shrink-0 border-r p-3 overflow-y-auto"
        style={{ backgroundColor: '#131929', borderColor: '#2D3A55' }}
      >
        <CategoryFilter />
      </aside>

      {/* Right: Study area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#2D3A55' }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#F1F5F9' }}>Vocabulary</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {selectedCategory === 'all' ? 'All words' : selectedCategory} · {currentCardIndex + 1} / {words.length}
            </p>
          </div>
          <ModeSwitcher
            mode={currentMode}
            onChange={(m: StudyMode) => { setMode(m); setCardFlipped(false); setQuizAnswered(false); }}
          />
        </div>

        {/* Card area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6 overflow-y-auto">
          {words.length === 0 ? (
            <div className="text-center">
              <CheckCircle size={48} color="#10B981" className="mx-auto mb-3" />
              <p className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>All caught up!</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>No cards due for review in this category.</p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentWord?.id}-${currentMode}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-lg"
                >
                  {currentWord && currentMode === 'flashcard' && (
                    <FlashcardCard
                      word={currentWord}
                      onFlip={setCardFlipped}
                      flipKey={flipKey}
                    />
                  )}
                  {currentWord && currentMode === 'quiz' && (
                    <QuizCard
                      word={currentWord}
                      reverse={false}
                      onAnswer={correct => {
                        setQuizAnswered(true);
                        setTimeout(() => { rateCard(currentWord.id, correct ? 'good' : 'again'); goNext(); }, 1200);
                      }}
                    />
                  )}
                  {currentWord && currentMode === 'quiz-reverse' && (
                    <QuizCard
                      word={currentWord}
                      reverse={true}
                      onAnswer={correct => {
                        setQuizAnswered(true);
                        setTimeout(() => { rateCard(currentWord.id, correct ? 'good' : 'again'); goNext(); }, 1200);
                      }}
                    />
                  )}
                  {currentWord && currentMode === 'shadowing' && (
                    <ShadowingCard word={currentWord} />
                  )}
                  {currentWord && currentMode === 'guess' && (
                    <GuessCard
                      word={currentWord}
                      onAnswer={correct => {
                        setTimeout(() => { rateCard(currentWord.id, correct ? 'good' : 'again'); goNext(); }, 1500);
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* SRS Controls (flashcard mode) */}
              {card && (
                <SRSControls card={card} onRate={handleRate} visible={showSRS} />
              )}

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={goPrev}
                  className="p-2 rounded-lg border transition-colors"
                  style={{ borderColor: '#2D3A55', color: '#64748B' }}
                  aria-label="Previous card"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm" style={{ color: '#64748B' }}>
                  {currentCardIndex + 1} / {words.length}
                </span>
                <button
                  onClick={goNext}
                  className="p-2 rounded-lg border transition-colors"
                  style={{ borderColor: '#2D3A55', color: '#64748B' }}
                  aria-label="Next card"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {currentMode === 'flashcard' && (
                <p className="text-xs" style={{ color: '#3D4F70' }}>
                  Space = flip · 1–4 = rate · J/K or ←/→ = navigate
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}