'use client';

import { useState } from 'react';
import { listeningData, listeningCategories, type ListeningCategory } from '@/lib/listening-data';
import { VideoCard } from '../_components/listening/VideoCard';
import { YouTubeImporter } from '../_components/listening/YouTubeImporter';
import { Headphones } from 'lucide-react';

function getDictationProgress(videoId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const video = listeningData.find(v => v.id === videoId);
    if (!video) return 0;
    const done = JSON.parse(localStorage.getItem(`he-dictation-${videoId}`) ?? '[]') as string[];
    return Math.round((done.length / video.transcript.length) * 100);
  } catch { return 0; }
}

export default function ListeningPage() {
  const [activeCategory, setActiveCategory] = useState<ListeningCategory>('All');

  const filtered = activeCategory === 'All'
    ? listeningData
    : listeningData.filter(v => v.category === activeCategory);

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
        >
          <Headphones size={22} color="#10B981" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>Listening Studio</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Watch, listen, and dictate to improve your comprehension</p>
        </div>
      </div>

      {/* YouTube Importer */}
      <YouTubeImporter />

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {listeningCategories.map(cat => {
          const active = cat === activeCategory;
          const count = cat === 'All' ? listeningData.length : listeningData.filter(v => v.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={{
                backgroundColor: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                borderColor: active ? '#10B981' : '#2D3A55',
                color: active ? '#10B981' : '#64748B',
              }}
            >
              {cat}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                  color: active ? '#10B981' : '#64748B',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            progress={getDictationProgress(video.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg" style={{ color: '#64748B' }}>No videos in this category.</p>
        </div>
      )}
    </div>
  );
}
