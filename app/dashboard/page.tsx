'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { vocabularyData, vocabularyCategories } from '@/lib/vocabulary-data';
import { StatCard } from '../_components/ui/StatCard';
import { ProgressBar } from '../_components/ui/ProgressBar';
import { BarChart3, Flame, BookOpen, Target, Clock } from 'lucide-react';

function getDayLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getHeatmapData(activityLog: { date: number; count: number }[]) {
  const days: { date: string; count: number; daysAgo: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const entry = activityLog.find(e => new Date(e.date).toDateString() === dateStr);
    days.push({ date: getDayLabel(i), count: entry?.count ?? 0, daysAgo: i });
  }
  return days;
}

function heatColor(count: number): string {
  if (count === 0) return '#1E293B';
  if (count < 5) return '#064e3b';
  if (count < 10) return '#065f46';
  if (count < 20) return '#047857';
  return '#10B981';
}

export default function DashboardPage() {
  const { srsCards, streak, studiedToday, activityLog } = useAppStore();
  const [hoursStudied, setHoursStudied] = useState(0);

  useEffect(() => {
    const h = parseFloat(localStorage.getItem('he-hours-studied') ?? '0');
    setHoursStudied(h);
  }, []);

  const totalWords = vocabularyData.length;
  const masteredWords = Object.values(srsCards).filter(c => c.difficulty === 'mastered').length;
  const reviewWords = Object.values(srsCards).filter(c => c.difficulty === 'review').length;
  const learningWords = Object.values(srsCards).filter(c => c.difficulty === 'learning').length;
  const newWords = totalWords - masteredWords - reviewWords - learningWords;

  const totalReviews = Object.values(srsCards).reduce((s, c) => s + c.reviewCount, 0);
  const accuracy = totalReviews > 0
    ? Math.round((masteredWords / totalWords) * 100)
    : 0;

  const heatmap = getHeatmapData(activityLog);

  const categoryStats = vocabularyCategories.map(cat => {
    const catWords = vocabularyData.filter(w => w.category === cat);
    const catMastered = catWords.filter(w => srsCards[w.id]?.difficulty === 'mastered').length;
    return { cat, total: catWords.length, mastered: catMastered };
  });

  const recentActivity = [...activityLog]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  return (
    <div className="p-6 flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(99,102,241,0.12)' }}>
          <BarChart3 size={22} color="#6366F1" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>Progress</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Track your learning journey</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🔥" label="Current Streak" value={`${streak} days`} accent="#F59E0B" />
        <StatCard icon="🎓" label="Words Mastered" value={masteredWords} sub={`of ${totalWords} total`} accent="#10B981" />
        <StatCard icon="⏱️" label="Hours Studied" value={`${hoursStudied.toFixed(1)}h`} accent="#6366F1" />
        <StatCard icon="📚" label="Today's Cards" value={studiedToday} accent="#3B82F6" />
      </div>

      {/* Word status breakdown */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#F1F5F9' }}>Vocabulary Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New', count: newWords, color: '#94A3B8' },
            { label: 'Learning', count: learningWords, color: '#F59E0B' },
            { label: 'Review', count: reviewWords, color: '#3B82F6' },
            { label: 'Mastered', count: masteredWords, color: '#10B981' },
          ].map(s => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs" style={{ color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity heatmap */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>30-Day Activity</h2>
          <span className="text-xs" style={{ color: '#64748B' }}>
            {activityLog.reduce((s, e) => s + e.count, 0)} total reviews
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {heatmap.map((day, i) => (
            <div
              key={i}
              title={`${day.date}: ${day.count} reviews`}
              className="rounded"
              style={{ width: 28, height: 28, backgroundColor: heatColor(day.count), cursor: 'default' }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#64748B' }}>
          <span>Less</span>
          {[0, 3, 8, 15, 25].map(v => (
            <div key={v} className="rounded" style={{ width: 14, height: 14, backgroundColor: heatColor(v) }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Category mastery */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#F1F5F9' }}>Mastery by Category</h2>
        <div className="flex flex-col gap-3">
          {categoryStats.map(({ cat, total, mastered }) => (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1.5">
                <span style={{ color: '#94A3B8' }}>{cat}</span>
                <span style={{ color: '#64748B' }}>{mastered}/{total}</span>
              </div>
              <ProgressBar value={mastered} max={total} color="#10B981" height={6} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div
          className="rounded-2xl border p-5"
          style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#F1F5F9' }}>Recent Activity</h2>
          <div className="flex flex-col gap-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span style={{ color: '#94A3B8' }}>
                  {new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span style={{ color: '#10B981' }}>{a.count} cards reviewed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
