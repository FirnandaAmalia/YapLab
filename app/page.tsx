'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { vocabularyData } from '@/lib/vocabulary-data';
import { StatCard } from './_components/ui/StatCard';
import { ProgressBar } from './_components/ui/ProgressBar';
import { BookOpen, Headphones, Mic, BarChart3, ArrowRight, Zap } from 'lucide-react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const quickLinks = [
  {
    href: '/vocabulary',
    icon: BookOpen,
    title: 'Vocabulary',
    desc: 'SRS flashcards, quiz, and shadowing',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    href: '/listening',
    icon: Headphones,
    title: 'Listening Studio',
    desc: 'YouTube dictation with mock transcripts',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.25)',
  },
  {
    href: '/speaking',
    icon: Mic,
    title: 'Speaking',
    desc: 'Shadowing practice with TTS',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    href: '/dashboard',
    icon: BarChart3,
    title: 'Progress',
    desc: 'Activity heatmap and mastery stats',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
  },
];

export default function HomePage() {
  const { streak, studiedToday, srsCards, getDueCards } = useAppStore();
  const [hoursStudied, setHoursStudied] = useState(0);

  useEffect(() => {
    const h = parseFloat(localStorage.getItem('yl-hours-studied') ?? '0');
    setHoursStudied(h);
  }, []);

  const dueCount = getDueCards().length;
  const masteredCount = Object.values(srsCards).filter(c => c.difficulty === 'mastered').length;
  const totalWords = vocabularyData.length;
  const masteryPct = Math.round((masteredCount / totalWords) * 100);

  return (
    <div className="p-6 flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div
          className="p-3 rounded-2xl"
          style={{ backgroundColor: 'rgba(139,92,246,0.12)' }}
        >
          <Zap size={28} color="#8B5CF6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
            {getGreeting()}! 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            YapLab by Nanda — {dueCount > 0
              ? `You have ${dueCount} card${dueCount !== 1 ? 's' : ''} due for review.`
              : 'All caught up! Keep up the great work.'}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '🔥', label: 'Streak', value: `${streak} days`, accent: '#F59E0B' },
          { icon: '📚', label: 'Today', value: `${studiedToday} cards`, accent: '#3B82F6' },
          { icon: '🎓', label: 'Mastered', value: masteredCount, sub: `of ${totalWords}`, accent: '#10B981' },
          { icon: '⏱️', label: 'Studied', value: `${hoursStudied.toFixed(1)}h`, accent: '#8B5CF6' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Overall progress */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Overall Mastery</h2>
          <span className="text-2xl font-bold" style={{ color: '#10B981' }}>{masteryPct}%</span>
        </div>
        <ProgressBar value={masteryPct} color="#10B981" height={8} />
        <p className="text-xs mt-2" style={{ color: '#64748B' }}>
          {masteredCount} of {totalWords} words mastered
        </p>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#94A3B8' }}>Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(({ href, icon: Icon, title, desc, color, bg, border }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link href={href}>
                <div
                  className="flex items-start gap-4 p-4 rounded-xl border transition-all group"
                  style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.backgroundColor = bg; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2D3A55'; e.currentTarget.style.backgroundColor = '#1E293B'; }}
                >
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                  >
                    <Icon size={20} color={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>{title}</h3>
                      <ArrowRight size={15} style={{ color: '#3D4F70' }} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Due cards prompt */}
      {dueCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border p-5 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.25)' }}
        >
          <div>
            <p className="font-semibold text-sm" style={{ color: '#8B5CF6' }}>
              {dueCount} card{dueCount !== 1 ? 's' : ''} ready for review
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
              Keep your streak going!
            </p>
          </div>
          <Link
            href="/vocabulary"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
          >
            Study now <ArrowRight size={15} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}