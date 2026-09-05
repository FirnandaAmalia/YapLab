'use client';

import { motion } from 'framer-motion';
import type { StudyMode } from '@/lib/types';
import { Layers, HelpCircle, FlipHorizontal, Mic, PenLine } from 'lucide-react';

interface ModeSwitcherProps {
  mode: StudyMode;
  onChange: (mode: StudyMode) => void;
}

const modes: { id: StudyMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'flashcard',     label: 'Flashcard',      icon: Layers,          desc: 'Flip & review' },
  { id: 'quiz',          label: 'Quiz',            icon: HelpCircle,      desc: 'Multiple choice' },
  { id: 'quiz-reverse',  label: 'Quiz Reverse',    icon: FlipHorizontal,  desc: 'Def → Word' },
  { id: 'guess',         label: 'Guess',           icon: PenLine,         desc: 'Type the word' },
  { id: 'shadowing',     label: 'Shadowing',       icon: Mic,             desc: 'TTS + Record' },
];

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {modes.map(m => {
        const active = m.id === mode;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              backgroundColor: active ? 'rgba(16,185,129,0.12)' : 'transparent',
              borderColor: active ? '#10B981' : '#2D3A55',
              color: active ? '#10B981' : '#64748B',
            }}
          >
            <Icon size={15} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}