'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { TranscriptSegment } from '@/lib/types';
import { RotateCcw, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface CharState {
  char: string;
  status: 'pending' | 'correct' | 'wrong' | 'extra';
}

function buildCharStates(input: string, expected: string): CharState[] {
  const exp = expected.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const inp = input.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const states: CharState[] = [];
  const maxLen = Math.max(exp.length, inp.length);

  for (let i = 0; i < maxLen; i++) {
    if (i >= exp.length) {
      states.push({ char: inp[i], status: 'extra' });
    } else if (i >= inp.length) {
      states.push({ char: exp[i], status: 'pending' });
    } else {
      states.push({ char: exp[i], status: inp[i] === exp[i] ? 'correct' : 'wrong' });
    }
  }
  return states;
}

function calcAccuracy(input: string, expected: string): number {
  const exp = expected.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const inp = input.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  if (exp.length === 0) return 100;
  let correct = 0;
  for (let i = 0; i < Math.min(exp.length, inp.length); i++) {
    if (exp[i] === inp[i]) correct++;
  }
  return Math.round((correct / exp.length) * 100);
}

interface DictationEngineProps {
  segment: TranscriptSegment;
  onNext: () => void;
  onReplay: () => void;
  isLast: boolean;
  completedSegments: Set<string>;
  onComplete: (segmentId: string, accuracy: number) => void;
}

export function DictationEngine({
  segment,
  onNext,
  onReplay,
  isLast,
  completedSegments,
  onComplete,
}: DictationEngineProps) {
  const [input, setInput] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset on segment change
  useEffect(() => {
    setInput('');
    setShowSubtitle(false);
    setSubmitted(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [segment.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        onReplay();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onReplay]);

  const charStates = buildCharStates(input, segment.text);
  const accuracy = calcAccuracy(input, segment.text);
  const isDone = completedSegments.has(segment.id);

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    onComplete(segment.id, accuracy);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (submitted) {
        onNext();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Character comparison display */}
      <div
        className="rounded-xl border p-4 min-h-[80px] font-mono text-base leading-relaxed tracking-wide break-all"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: '#2D3A55' }}
      >
        {charStates.length === 0 ? (
          <span style={{ color: '#64748B' }}>Start typing what you hear...</span>
        ) : (
          charStates.map((cs, i) => {
            let color = '#94A3B8';
            if (cs.status === 'correct') color = '#10B981';
            else if (cs.status === 'wrong') color = '#EF4444';
            else if (cs.status === 'extra') color = '#F59E0B';
            return (
              <span
                key={i}
                style={{
                  color,
                  backgroundColor: cs.status === 'wrong' ? 'rgba(239,68,68,0.12)' : 'transparent',
                  borderRadius: 2,
                }}
              >
                {cs.char === ' ' ? '\u00A0' : cs.char}
              </span>
            );
          })
        )}
      </div>

      {/* Input */}
      <textarea
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={submitted}
        placeholder="Type what you hear..."
        rows={3}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
        style={{
          backgroundColor: '#0B0F19',
          borderColor: submitted ? (accuracy >= 80 ? '#10B981' : '#EF4444') : '#2D3A55',
          color: '#F1F5F9',
          opacity: submitted ? 0.8 : 1,
        }}
        onFocus={e => { if (!submitted) e.target.style.borderColor = '#6366F1'; }}
        onBlur={e => { if (!submitted) e.target.style.borderColor = '#2D3A55'; }}
      />

      {/* Accuracy feedback */}
      {submitted && (
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-lg"
          style={{ backgroundColor: accuracy >= 80 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}
        >
          <span className="text-2xl font-bold" style={{ color: accuracy >= 80 ? '#10B981' : '#EF4444' }}>
            {accuracy}%
          </span>
          <span className="text-sm" style={{ color: '#94A3B8' }}>accuracy</span>
        </div>
      )}

      {/* Subtitle toggle */}
      {submitted && (
        <div>
          <button
            onClick={() => setShowSubtitle(s => !s)}
            className="flex items-center gap-2 text-sm mb-2"
            style={{ color: '#94A3B8' }}
          >
            {showSubtitle ? <EyeOff size={15} /> : <Eye size={15} />}
            {showSubtitle ? 'Hide' : 'Show'} transcript
          </button>
          {showSubtitle && (
            <div
              className="rounded-lg px-4 py-3 border"
              style={{ backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <p className="text-sm" style={{ color: '#F1F5F9' }}>{segment.text}</p>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{segment.translation_id}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onReplay}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: '#2D3A55', color: '#94A3B8', backgroundColor: 'transparent' }}
          title="Ctrl+Space to replay"
        >
          <RotateCcw size={15} /> Replay
        </button>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={input.trim().length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: input.trim() ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.05)',
              color: input.trim() ? '#6366F1' : '#3D4F70',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            Check (Enter)
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            {isLast ? 'Finish' : 'Next (Enter)'} <ChevronRight size={15} />
          </button>
        )}

        <span className="text-xs ml-auto" style={{ color: '#64748B' }}>
          Ctrl+Space = replay
        </span>
      </div>
    </div>
  );
}
