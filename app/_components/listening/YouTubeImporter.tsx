'use client';

import { useState } from 'react';
import { Link2, PlusCircle, X } from 'lucide-react';

interface ImportedVideo {
  youtubeId: string;
  title: string;
}

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  // Bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

const STORAGE_KEY = 'he-imported-videos';

function loadImported(): ImportedVideo[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveImported(vids: ImportedVideo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vids));
}

export function YouTubeImporter({ onImport }: { onImport?: (id: string) => void }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [imported, setImported] = useState<ImportedVideo[]>(loadImported);

  const handleImport = () => {
    const id = parseYouTubeId(url.trim());
    if (!id) {
      setError('Could not parse a YouTube video ID from that URL.');
      return;
    }
    const already = imported.find(v => v.youtubeId === id);
    if (already) {
      setError('This video is already in your library.');
      return;
    }
    const newVid: ImportedVideo = { youtubeId: id, title: `Imported: ${id}` };
    const next = [newVid, ...imported];
    setImported(next);
    saveImported(next);
    setUrl('');
    setError('');
    onImport?.(id);
  };

  const handleRemove = (id: string) => {
    const next = imported.filter(v => v.youtubeId !== id);
    setImported(next);
    saveImported(next);
  };

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
    >
      <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Import YouTube Video</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
          <input
            type="text"
            placeholder="Paste YouTube URL or video ID..."
            value={url}
            onChange={e => { setUrl(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none border"
            style={{ backgroundColor: '#0B0F19', borderColor: error ? '#EF4444' : '#2D3A55', color: '#F1F5F9' }}
            onFocus={e => (e.target.style.borderColor = '#10B981')}
            onBlur={e => (e.target.style.borderColor = error ? '#EF4444' : '#2D3A55')}
          />
        </div>
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <PlusCircle size={15} /> Add
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}

      {imported.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <p className="text-xs" style={{ color: '#64748B' }}>Your imports ({imported.length})</p>
          {imported.slice(0, 5).map(v => (
            <div
              key={v.youtubeId}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <span style={{ color: '#94A3B8' }}>youtu.be/{v.youtubeId}</span>
              <button onClick={() => handleRemove(v.youtubeId)} aria-label="Remove">
                <X size={14} style={{ color: '#64748B' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
