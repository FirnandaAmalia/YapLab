'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SegmentNoteData } from '@/lib/types';
import { listeningData } from '@/lib/listening-data';
import { StickyNote, Trash2, ExternalLink, BookOpen } from 'lucide-react';

function loadNotes(): SegmentNoteData[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('he-notes-index') ?? '[]');
  } catch { return []; }
}

function deleteNote(noteId: string) {
  const notes = loadNotes().filter(n => n.id !== noteId);
  localStorage.setItem('he-notes-index', JSON.stringify(notes));
  // Also remove single note key
  const [videoId, segmentId] = noteId.split('-').reduce(
    (acc: string[], part, i, arr) => {
      // id format is `${videoId}-${segmentId}` where videoId is like 'lv1'
      if (i === 0) return [part, arr.slice(1).join('-')];
      return acc;
    },
    []
  );
  localStorage.removeItem(`he-note-${videoId}-${segmentId}`);
}

function groupByVideo(notes: SegmentNoteData[]) {
  const groups: Record<string, SegmentNoteData[]> = {};
  notes.forEach(n => {
    if (!groups[n.videoId]) groups[n.videoId] = [];
    groups[n.videoId].push(n);
  });
  return groups;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MyNotesPage() {
  const [notes, setNotes] = useState<SegmentNoteData[]>([]);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const handleDelete = (noteId: string) => {
    deleteNote(noteId);
    setNotes(n => n.filter(x => x.id !== noteId));
  };

  const groups = groupByVideo(notes);
  const videoIds = Object.keys(groups);

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(99,102,241,0.12)' }}>
          <StickyNote size={22} color="#6366F1" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>My Notes</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>{notes.length} note{notes.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-16 rounded-2xl border text-center"
          style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
        >
          <BookOpen size={40} style={{ color: '#3D4F70' }} />
          <div>
            <p className="font-semibold" style={{ color: '#94A3B8' }}>No notes yet</p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              While watching videos, click &ldquo;Add note&rdquo; on any segment to save notes here.
            </p>
          </div>
          <Link
            href="/listening"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            Go to Listening Studio
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {videoIds.map(videoId => {
            const video = listeningData.find(v => v.id === videoId);
            const videoNotes = groups[videoId].sort((a, b) => a.timestamp - b.timestamp);
            return (
              <div
                key={videoId}
                className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
              >
                {/* Video header */}
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: '#2D3A55' }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                      {video?.title ?? videoId}
                    </p>
                    {video && (
                      <p className="text-xs" style={{ color: '#64748B' }}>{video.channel}</p>
                    )}
                  </div>
                  <Link
                    href={`/listening/${videoId}`}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
                    style={{ borderColor: '#2D3A55', color: '#94A3B8' }}
                  >
                    <ExternalLink size={12} /> Open
                  </Link>
                </div>

                {/* Notes */}
                <div className="flex flex-col divide-y" style={{ borderColor: '#2D3A55' }}>
                  {videoNotes.map(note => (
                    <div key={note.id} className="px-5 py-4 flex gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Segment text */}
                        {note.segmentText && (
                          <p className="text-xs italic mb-2 truncate" style={{ color: '#64748B' }}>
                            &ldquo;{note.segmentText}&rdquo;
                            <span className="ml-2 not-italic" style={{ color: '#3D4F70' }}>
                              @ {note.timestamp}s
                            </span>
                          </p>
                        )}
                        {/* Note content */}
                        <p className="text-sm whitespace-pre-wrap" style={{ color: '#F1F5F9' }}>{note.note}</p>
                        <p className="text-xs mt-2" style={{ color: '#3D4F70' }}>{formatDate(note.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="shrink-0 p-1.5 rounded-lg transition-colors"
                        style={{ color: '#64748B' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
                        aria-label="Delete note"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
