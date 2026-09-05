'use client';

import { vocabularyCategories } from '@/lib/vocabulary-data';
import { useAppStore } from '@/lib/store';

export function CategoryFilter() {
  const { selectedCategory, setCategory, getDueCards, srsCards } = useAppStore();

  const categories = ['all', ...vocabularyCategories];

  const getCount = (cat: string) => {
    if (cat === 'all') return getDueCards().length;
    return getDueCards(cat).length;
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: '#64748B' }}>Categories</p>
      {categories.map(cat => {
        const active = selectedCategory === cat;
        const count = getCount(cat);
        return (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left"
            style={{
              backgroundColor: active ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: active ? '#10B981' : '#94A3B8',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span className="capitalize">{cat === 'all' ? 'All Words' : cat}</span>
            {count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', color: active ? '#10B981' : '#64748B' }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}