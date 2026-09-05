'use client';

import { useState, useEffect } from 'react';
import { Search, Settings, Flame, Command } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function TopBar() {
  const { searchQuery, setSearchQuery, streak, studiedToday, openCommandPalette } = useAppStore();
  const [hoursStudied, setHoursStudied] = useState(0);

  useEffect(() => {
    const stored = parseFloat(localStorage.getItem('yl-hours-studied') ?? '0');
    setHoursStudied(stored);
  }, []);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCommandPalette]);

  return (
    <header
      className="flex items-center gap-3 px-6 py-3 border-b shrink-0"
      style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
    >
      {/* Command Palette trigger */}
      <button
        onClick={openCommandPalette}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm shrink-0 transition-colors"
        style={{
          backgroundColor: 'rgba(139,92,246,0.06)',
          borderColor: '#2D3A55',
          color: '#64748B',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
          e.currentTarget.style.color = '#8B5CF6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#2D3A55';
          e.currentTarget.style.color = '#64748B';
        }}
        aria-label="Open command palette"
      >
        <Command size={14} />
        <span className="hidden sm:inline">K</span>
      </button>

      {/* Search */}
      <div className="flex-1 relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
        <input
          type="text"
          placeholder="Search words, topics..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none border transition-colors"
          style={{
            backgroundColor: '#0B0F19',
            borderColor: '#2D3A55',
            color: '#F1F5F9',
          }}
          onFocus={e => (e.target.style.borderColor = '#8B5CF6')}
          onBlur={e => (e.target.style.borderColor = '#2D3A55')}
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: '#2D3A55', backgroundColor: 'rgba(245,158,11,0.08)' }}>
          <Flame size={16} color="#F59E0B" />
          <span className="text-sm font-semibold" style={{ color: '#F59E0B' }}>{streak}</span>
          <span className="text-xs" style={{ color: '#64748B' }}>day streak</span>
        </div>

        {/* Hours */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm" style={{ color: '#94A3B8' }}>
          <span>⏱</span>
          <span>{hoursStudied.toFixed(1)}h studied</span>
        </div>

        {/* Cards today */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm" style={{ color: '#94A3B8' }}>
          <span>📚</span>
          <span>{studiedToday} today</span>
        </div>

        {/* Settings */}
        <button
          className="p-2 rounded-lg border transition-colors"
          style={{ borderColor: '#2D3A55', color: '#64748B' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}