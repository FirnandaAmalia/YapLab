'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VocabWord } from '@/lib/vocabulary-data';
import { Badge } from '../ui/Badge';

interface FlashcardCardProps {
  word: VocabWord;
  onFlip?: (flipped: boolean) => void;
  flipKey?: number;
}

export function FlashcardCard({ word, onFlip, flipKey }: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(f => {
      const next = !f;
      onFlip?.(next);
      return next;
    });
  };

  return (
    <div
      className="relative w-full max-w-lg mx-auto cursor-pointer select-none"
      style={{ perspective: '1200px', height: 340 }}
      onClick={handleFlip}
      role="button"
      aria-label={flipped ? 'Show word (click to flip back)' : 'Show definition (click to flip)'}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? handleFlip() : null}
    >
      <motion.div
        key={flipKey}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center p-8 gap-4"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            backgroundColor: '#1E293B',
            borderColor: '#2D3A55',
            boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          }}
        >
          <span className="text-6xl">{word.emoji}</span>
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#F1F5F9' }}>
              {word.word}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              <span className="text-sm font-mono" style={{ color: '#94A3B8' }}>{word.ipa_us}</span>
              <span style={{ color: '#2D3A55' }}>·</span>
              <span className="text-sm font-mono" style={{ color: '#64748B' }}>{word.ipa_uk}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge label={word.pos} variant="indigo" />
            <Badge label={word.level} variant="cefr" level={word.level} />
            <Badge label={word.category} variant="muted" />
          </div>
          <p className="text-sm mt-2" style={{ color: '#64748B' }}>Click to reveal definition</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border flex flex-col justify-between p-8 gap-3"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#1E293B',
            borderColor: '#10B981',
            boxShadow: '0 4px 32px rgba(16,185,129,0.12)',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{word.emoji}</span>
              <h3 className="text-xl font-bold" style={{ color: '#10B981' }}>{word.word}</h3>
            </div>
            <p className="text-base leading-relaxed" style={{ color: '#F1F5F9' }}>{word.definition_en}</p>
            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{word.definition_id}</p>
          </div>
          <div
            className="border-t pt-3 mt-2"
            style={{ borderColor: '#2D3A55' }}
          >
            <p className="text-sm italic" style={{ color: '#F1F5F9' }}>&ldquo;{word.example_en}&rdquo;</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>{word.example_id}</p>
          </div>
          <p className="text-xs text-center" style={{ color: '#64748B' }}>Click to flip back</p>
        </div>
      </motion.div>
    </div>
  );
}