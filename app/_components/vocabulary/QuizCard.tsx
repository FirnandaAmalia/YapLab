'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VocabWord } from '@/lib/vocabulary-data';
import { vocabularyData } from '@/lib/vocabulary-data';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizCardProps {
  word: VocabWord;
  reverse?: boolean; // reverse: show definition, guess word
  onAnswer?: (correct: boolean) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDistractors(correctId: string, count = 3): VocabWord[] {
  return shuffleArray(vocabularyData.filter(w => w.id !== correctId)).slice(0, count);
}

export function QuizCard({ word, reverse = false, onAnswer }: QuizCardProps) {
  const [options, setOptions] = useState<VocabWord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const reset = useCallback(() => {
    const distractors = getDistractors(word.id);
    const all = shuffleArray([word, ...distractors]);
    setOptions(all);
    setSelected(null);
    setRevealed(false);
  }, [word]);

  useEffect(() => { reset(); }, [reset]);

  const handleSelect = (id: string) => {
    if (revealed) return;
    setSelected(id);
    setRevealed(true);
    onAnswer?.(id === word.id);
  };

  const prompt = reverse
    ? <><p className="text-base" style={{ color: '#F1F5F9' }}>{word.definition_en}</p><p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{word.definition_id}</p></>
    : <><h2 className="text-3xl font-bold" style={{ color: '#F1F5F9' }}>{word.word}</h2><span className="text-sm font-mono mt-1" style={{ color: '#94A3B8' }}>{word.ipa_us}</span></>;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
      {/* Question */}
      <div
        className="rounded-2xl border p-6 flex flex-col items-center gap-3 text-center"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <span className="text-5xl">{word.emoji}</span>
        {prompt}
        <div className="flex gap-2 flex-wrap justify-center mt-1">
          <Badge label={word.level} variant="cefr" level={word.level} />
          <Badge label={word.category} variant="muted" />
        </div>
        <p className="text-sm" style={{ color: '#64748B' }}>
          {reverse ? 'Which word matches this definition?' : 'Which definition matches this word?'}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {options.map(opt => {
          const isCorrect = opt.id === word.id;
          const isSelected = opt.id === selected;
          let borderColor = '#2D3A55';
          let bgColor = '#1E293B';
          let textColor = '#94A3B8';

          if (revealed) {
            if (isCorrect) { borderColor = '#10B981'; bgColor = 'rgba(16,185,129,0.08)'; textColor = '#10B981'; }
            else if (isSelected && !isCorrect) { borderColor = '#EF4444'; bgColor = 'rgba(239,68,68,0.08)'; textColor = '#EF4444'; }
          } else if (isSelected) {
            borderColor = '#6366F1'; bgColor = 'rgba(99,102,241,0.08)';
          }

          const label = reverse ? opt.word : opt.definition_en;

          return (
            <motion.button
              key={opt.id}
              whileHover={!revealed ? { scale: 1.01 } : {}}
              whileTap={!revealed ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(opt.id)}
              className="w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors"
              style={{ backgroundColor: bgColor, borderColor, color: textColor, cursor: revealed ? 'default' : 'pointer' }}
            >
              <span className="flex-1 text-sm">{label}</span>
              {revealed && isCorrect && <CheckCircle size={18} color="#10B981" />}
              {revealed && isSelected && !isCorrect && <XCircle size={18} color="#EF4444" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}