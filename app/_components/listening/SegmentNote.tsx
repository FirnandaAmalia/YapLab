'use client';

import { useState, useEffect } from 'react';
import { StickyNote, X, Save, Plus } from 'lucide-react';
import type { SegmentNoteData } from '@/lib/types';

function getKey(videoId: string, segmentId: string) {
  return `he-note-${videoId}-${segmentId}`;
}

function loadNote(videoId: string, segmentId: string): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(getKey(videoId, segmentId)) ?? '';
}

function saveNote(videoId: string, segmentId: string, note: string) {
  localStorage.setItem(getKey(videoId, segmentId), note);
  // Also update the global notes index
  const indexKey = 'he-notes-index';
  const existing: SegmentNoteData[] = JSON.parse(localStorage.getItem(indexKey) ?? '[]');
  const filtered = existing.filter(n => !(n.videoId === videoId && n.segmentId === segmentId));
  if (note.trim()) {
    filtered.push({
      id: `${videoId}-${segmentId}`,
      videoId,
      segmentId,
      segmentText: '',
      note,
      timestamp: 0,
      createdAt: Date.now(),
    });
  }
  localStorage.setItem(indexKey, JSON.stringify(filtered));
}

interface SegmentNoteProps {
  videoId: string;
  segmentId: string;
  segmentText: string;
  segmentTimestamp: number;
}

export function SegmentNote({ videoId, segmentId, segmentText, segmentTimestamp }: SegmentNoteProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNote(loadNote(videoId, segmentId));
  }, [videoId, segmentId]);

  const handleSave = () => {
    // Update segment text in index
    const indexKey = 'he-notes-index';
    const existing: SegmentNoteData[] = JSON.parse(localStorage.getItem(indexKey) ?? '[]');
    const filtered = existing.filter(n => !(n.videoId === videoId && n.segmentId === segmentId));
    if (note.trim()) {
      filtered.push({
        id: `${videoId}-${segmentId}`,
        videoId,
        segmentId,
        segmentText,
        note,
        timestamp: segmentTimestamp,
        createdAt: Date.now(),
      });
    }
    localStorage.setItem('he-notes-index', JSON.stringify(filtered));
    localStorage.setItem(getKey(videoId, segmentId), note);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const hasNote = loadNote(videoId, segmentId).trim().length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-colors"
        style={{
          borderColor: hasNote ? 'rgba(99,102,241,0.4)' : '#2D3A55',
          color: hasNote ? '#6366F1' : '#64748B',
          backgroundColor: hasNote ? 'rgba(99,102,241,0.08)' : 'transparent',
        }}
        aria-label="Add note"
      >
        <StickyNote size={12} />
        {hasNote ? 'View note' : 'Add note'}
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 w-72 rounded-xl border shadow-xl z-50 p-4 flex flex-col gap-3"
          style={{ backgroundColor: '#1E293B', borderColor: '#3D4F70', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Note</span>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X size={15} style={{ color: '#64748B' }} />
            </button>
          </div>
          <p className="text-xs italic" style={{ color: '#64748B' }}>
            &ldquo;{segmentText.slice(0, 60)}{segmentText.length > 60 ? '...' : ''}&rdquo;
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Write your note here..."
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none border"
            style={{ backgroundColor: '#0B0F19', borderColor: '#2D3A55', color: '#F1F5F9' }}
            onFocus={e => (e.target.style.borderColor = '#6366F1')}
            onBlur={e => (e.target.style.borderColor = '#2D3A55')}
          />
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: saved ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)', color: saved ? '#10B981' : '#6366F1', border: `1px solid ${saved ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}` }}
          >
            <Save size={14} />
            {saved ? 'Saved!' : 'Save note'}
          </button>
        </div>
      )}
    </div>
  );
}
