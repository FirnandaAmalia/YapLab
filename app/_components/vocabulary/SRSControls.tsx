'use client';

import { motion } from 'framer-motion';
import type { SRSCard } from '@/lib/types';

interface SRSControlsProps {
  card: SRSCard;
  onRate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
  visible: boolean;
}

const ratings = [
  { id: 'again' as const, label: 'Again', sub: '10 min', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  { id: 'hard'  as const, label: 'Hard',  sub: '< 1 day', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  { id: 'good'  as const, label: 'Good',  sub: '4 days',  color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  { id: 'easy'  as const, label: 'Easy',  sub: '1 week+', color: '#6366F1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
] as const;

export function SRSControls({ card, onRate, visible }: SRSControlsProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <p className="text-center text-sm mb-3" style={{ color: '#64748B' }}>How well did you know this?</p>
      <div className="grid grid-cols-4 gap-2">
        {ratings.map(r => (
          <button
            key={r.id}
            onClick={() => onRate(r.id)}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-medium transition-transform active:scale-95"
            style={{
              backgroundColor: r.bg,
              borderColor: r.border,
              color: r.color,
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.filter = '')}
          >
            <span className="text-sm font-semibold">{r.label}</span>
            <span className="text-xs opacity-75">{r.sub}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs mt-2 px-1" style={{ color: '#64748B' }}>
        <span>Reviews: {card.reviewCount}</span>
        <span>Difficulty: {card.difficulty}</span>
        <span>EF: {card.easeFactor.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}