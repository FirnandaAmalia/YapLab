'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VocabWord } from '@/lib/vocabulary-data';
import { Badge } from '../ui/Badge';
import { Lightbulb, CheckCircle, XCircle, Volume2 } from 'lucide-react';

interface GuessCardProps {
  word: VocabWord;
  onAnswer?: (correct: boolean) => void;
}

/** Mask the answer word inside the example sentence with blanks */
function maskSentence(sentence: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  const blanks = '_'.repeat(word.length);
  return sentence.replace(regex, blanks);
}

/** Return how many hint letters to reveal based on hint level (0-3) */
function getHintWord(word: string, hintLevel: number): string {
  if (hintLevel === 0) return '';
  const reveal = Math.max(1, Math.ceil((hintLevel / 3) * Math.ceil(word.length / 2)));
  return word.slice(0, reveal) + '_'.repeat(word.length - reveal);
}

export function GuessCard({ word, onAnswer }: GuessCardProps) {
  const [input, setInput] = useState('');
  const [hintLevel, setHintLevel] = useState(0);         // 0 = no hint, 1-3 = progressively more
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when word changes
  useEffect(() => {
    setInput('');
    setHintLevel(0);
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [word.id]);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word.word);
    utter.lang = 'en-US';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  }, [word.word]);

  const checkAnswer = useCallback(() => {
    if (status !== 'idle') return;
    const correct = input.trim().toLowerCase() === word.word.toLowerCase();
    setStatus(correct ? 'correct' : 'wrong');
    onAnswer?.(correct);
  }, [input, word.word, status, onAnswer]);

  const handleDontKnow = useCallback(() => {
    if (status !== 'idle') return;
    setInput(word.word);
    setStatus('wrong');
    onAnswer?.(false);
  }, [word.word, status, onAnswer]);

  const handleHint = useCallback(() => {
    if (hintLevel < 3) {
      setHintLevel(h => h + 1);
    }
  }, [hintLevel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') checkAnswer();
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const maskedExample = maskSentence(word.example_en, word.word);
  const hint = getHintWord(word.word, hintLevel);

  // letter boxes: array of chars (spaces between become space)
  const letterBoxes = word.word.split('').map((_, i) => {
    if (status !== 'idle') return word.word[i]; // reveal all on answer
    if (hintLevel > 0 && hint[i] !== '_') return hint[i]; // revealed by hint
    return '_';
  });

  // ── Colors ────────────────────────────────────────────────────────────────
  let borderColor = '#2D3A55';
  let inputBg = '#131929';
  let resultIcon = null;

  if (status === 'correct') {
    borderColor = '#10B981';
    inputBg = 'rgba(16,185,129,0.08)';
    resultIcon = <CheckCircle size={20} color="#10B981" />;
  } else if (status === 'wrong') {
    borderColor = '#EF4444';
    inputBg = 'rgba(239,68,68,0.08)';
    resultIcon = <XCircle size={20} color="#EF4444" />;
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
      {/* ── Question card ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-6 flex flex-col items-center gap-3 text-center"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        {/* Emoji */}
        <span className="text-5xl">{word.emoji}</span>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap justify-center">
          <Badge label={word.pos} variant="indigo" />
          <Badge label={word.level} variant="cefr" level={word.level} />
          <Badge label={word.category} variant="muted" />
        </div>

        {/* English definition */}
        <p className="text-base leading-relaxed" style={{ color: '#F1F5F9' }}>
          {word.definition_en}
        </p>

        {/* Indonesian definition */}
        <p className="text-sm" style={{ color: '#94A3B8' }}>
          {word.definition_id}
        </p>

        {/* Example sentence (masked) */}
        <div
          className="w-full rounded-xl border p-3 text-sm italic"
          style={{ backgroundColor: '#131929', borderColor: '#2D3A55', color: '#64748B' }}
        >
          <span style={{ color: '#94A3B8' }}>&ldquo;</span>
          {maskedExample}
          <span style={{ color: '#94A3B8' }}>&rdquo;</span>
        </div>

        <p className="text-xs" style={{ color: '#3D4F70' }}>
          Type the missing English word
        </p>
      </div>

      {/* ── Letter hint boxes ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {letterBoxes.map((ch, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              backgroundColor:
                status === 'correct'
                  ? 'rgba(16,185,129,0.15)'
                  : status === 'wrong'
                  ? 'rgba(239,68,68,0.10)'
                  : ch !== '_'
                  ? 'rgba(99,102,241,0.12)'
                  : '#1E293B',
              borderColor:
                status === 'correct'
                  ? '#10B981'
                  : status === 'wrong'
                  ? '#EF4444'
                  : ch !== '_'
                  ? '#6366F1'
                  : '#2D3A55',
            }}
            transition={{ duration: 0.25 }}
            className="w-9 h-10 rounded-lg border flex items-center justify-center text-sm font-bold"
            style={{ color: '#F1F5F9' }}
          >
            {ch === '_' ? '' : ch.toUpperCase()}
          </motion.div>
        ))}

        {/* Hint button */}
        <button
          onClick={handleHint}
          disabled={hintLevel >= 3 || status !== 'idle'}
          title={hintLevel >= 3 ? 'No more hints' : 'Show hint'}
          className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              hintLevel > 0 ? 'rgba(234,179,8,0.10)' : 'transparent',
            borderColor: hintLevel > 0 ? '#EAB308' : '#2D3A55',
            color: hintLevel > 0 ? '#EAB308' : '#64748B',
          }}
        >
          <Lightbulb size={14} />
          Hint
        </button>
      </div>

      {/* ── Input row ───────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-2">
        <div
          className="relative flex-1 flex items-center gap-2 rounded-xl border px-4 py-3 transition-colors"
          style={{ backgroundColor: inputBg, borderColor }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={status !== 'idle'}
            placeholder="Enter English word…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#F1F5F9' }}
            aria-label="Your answer"
          />
          {resultIcon}
        </div>

        {/* TTS button */}
        {status !== 'idle' && (
          <button
            onClick={speak}
            title="Listen to pronunciation"
            className="p-2 rounded-lg border transition-colors"
            style={{ borderColor: '#2D3A55', color: '#64748B' }}
          >
            <Volume2 size={18} />
          </button>
        )}
      </div>

      {/* Correct word reveal on wrong */}
      <AnimatePresence>
        {status === 'wrong' && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm"
            style={{ color: '#EF4444' }}
          >
            Correct answer:{' '}
            <span className="font-bold" style={{ color: '#F1F5F9' }}>
              {word.word}
            </span>
          </motion.p>
        )}
        {status === 'correct' && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm font-semibold"
            style={{ color: '#10B981' }}
          >
            🎉 Correct!
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDontKnow}
          disabled={status !== 'idle'}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: '#EF4444', color: '#EF4444' }}
        >
          <XCircle size={16} />
          Don&apos;t Know
        </button>

        <button
          onClick={checkAnswer}
          disabled={!input.trim() || status !== 'idle'}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: '#10B981', color: '#10B981' }}
        >
          <CheckCircle size={16} />
          Check Answer
        </button>
      </div>
    </div>
  );
}
