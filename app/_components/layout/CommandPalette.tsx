'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  Headphones,
  Mic,
  StickyNote,
  BarChart3,
  X,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { vocabularyData } from '@/lib/vocabulary-data';

interface PaletteItem {
  id: string;
  type: 'nav' | 'vocab';
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  shortcut?: string;
  sub?: string;
  emoji?: string;
}

const navItems: PaletteItem[] = [
  { id: 'nav-home',      type: 'nav', label: 'Go to Home',             href: '/',          icon: Home,       shortcut: 'G H' },
  { id: 'nav-vocab',     type: 'nav', label: 'Go to Vocabulary',       href: '/vocabulary', icon: BookOpen,   shortcut: 'G V' },
  { id: 'nav-listening', type: 'nav', label: 'Go to Listening Studio', href: '/listening',  icon: Headphones, shortcut: 'G L' },
  { id: 'nav-speaking',  type: 'nav', label: 'Go to Speaking',         href: '/speaking',   icon: Mic,        shortcut: 'G S' },
  { id: 'nav-notes',     type: 'nav', label: 'Go to My Notes',         href: '/my-notes',   icon: StickyNote, shortcut: 'G N' },
  { id: 'nav-progress',  type: 'nav', label: 'Go to Progress',         href: '/dashboard',  icon: BarChart3,  shortcut: 'G P' },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, closeCommandPalette, setCategory } = useAppStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build vocab items from data
  const vocabItems: PaletteItem[] = vocabularyData.map(w => ({
    id: `vocab-${w.id}`,
    type: 'vocab',
    label: w.word,
    href: '/vocabulary',
    sub: w.definition_en,
    emoji: w.emoji,
    shortcut: w.level,
  }));

  const allItems = [...navItems, ...vocabItems];

  const filtered = query.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.sub?.toLowerCase().includes(query.toLowerCase())
      )
    : navItems;

  // Reset on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const handleSelect = useCallback((item: PaletteItem) => {
    if (item.type === 'vocab') {
      setCategory(vocabularyData.find(w => w.id === item.id.replace('vocab-', ''))?.category ?? 'all');
    }
    router.push(item.href);
    closeCommandPalette();
  }, [router, closeCommandPalette, setCategory]);

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCommandPalette();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) handleSelect(item);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, filtered, activeIndex, closeCommandPalette, handleSelect]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(11,15,25,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={closeCommandPalette}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-xl rounded-2xl border overflow-hidden pointer-events-auto"
              style={{
                backgroundColor: '#1E293B',
                borderColor: '#2D3A55',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor: '#2D3A55' }}
              >
                <Search size={16} style={{ color: '#64748B', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages or vocabulary..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: '#F1F5F9' }}
                />
                <button
                  onClick={closeCommandPalette}
                  className="p-1 rounded"
                  style={{ color: '#64748B' }}
                  aria-label="Close command palette"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Results list */}
              <div
                ref={listRef}
                className="overflow-y-auto py-2"
                style={{ maxHeight: '60vh' }}
              >
                {!query.trim() && (
                  <p className="px-4 py-1 text-xs font-medium uppercase tracking-wider" style={{ color: '#3D4F70' }}>
                    Navigation
                  </p>
                )}
                {query.trim() && filtered.length > 0 && (
                  <p className="px-4 py-1 text-xs font-medium uppercase tracking-wider" style={{ color: '#3D4F70' }}>
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  </p>
                )}

                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center" style={{ color: '#64748B' }}>
                    <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                  </div>
                )}

                {filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-idx={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{
                        backgroundColor: isActive ? 'rgba(139,92,246,0.1)' : 'transparent',
                        borderLeft: isActive ? '2px solid #8B5CF6' : '2px solid transparent',
                      }}
                    >
                      {item.emoji ? (
                        <span className="text-lg shrink-0 w-6 text-center">{item.emoji}</span>
                      ) : Icon ? (
                        <div
                          className="p-1.5 rounded-lg shrink-0"
                          style={{ backgroundColor: isActive ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)' }}
                        >
                          <Icon size={14} color={isActive ? '#8B5CF6' : '#94A3B8'} />
                        </div>
                      ) : null}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: isActive ? '#F1F5F9' : '#94A3B8' }}>
                          {item.label}
                        </p>
                        {item.sub && (
                          <p className="text-xs truncate mt-0.5" style={{ color: '#64748B' }}>{item.sub}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.shortcut && (
                          <span
                            className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              color: '#64748B',
                              border: '1px solid #2D3A55',
                            }}
                          >
                            {item.shortcut}
                          </span>
                        )}
                        <ArrowRight size={12} style={{ color: isActive ? '#8B5CF6' : '#3D4F70' }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer hints */}
              <div
                className="flex items-center gap-4 px-4 py-2 border-t text-xs"
                style={{ borderColor: '#2D3A55', color: '#3D4F70' }}
              >
                <span>↑↓ navigate</span>
                <span>Enter select</span>
                <span>Esc close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}