'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import YouTube, { type YouTubeEvent, type YouTubePlayer } from 'react-youtube';
import type { ListeningVideo } from '@/lib/types';
import { DictationEngine } from './DictationEngine';
import { SegmentNote } from './SegmentNote';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const SPEEDS = [0.75, 1, 1.25] as const;

function loadProgress(videoId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`he-dictation-${videoId}`);
    return new Set(JSON.parse(raw ?? '[]'));
  } catch { return new Set(); }
}

function saveProgress(videoId: string, done: Set<string>) {
  localStorage.setItem(`he-dictation-${videoId}`, JSON.stringify(Array.from(done)));
}

interface DictationPlayerProps {
  video: ListeningVideo;
}

export function DictationPlayer({ video }: DictationPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [completedSegments, setCompletedSegments] = useState<Set<string>>(() => loadProgress(video.id));
  const [accuracyMap, setAccuracyMap] = useState<Record<string, number>>({});

  const currentSegment = video.transcript[segmentIndex];
  const totalSegments = video.transcript.length;
  const doneCount = completedSegments.size;
  const overallProgress = Math.round((doneCount / totalSegments) * 100);

  const seekToSegment = useCallback((idx: number) => {
    const seg = video.transcript[idx];
    if (playerRef.current && seg) {
      playerRef.current.seekTo(seg.startTime, true);
      playerRef.current.setPlaybackRate(speed);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [video.transcript, speed]);

  const handleReplay = useCallback(() => {
    seekToSegment(segmentIndex);
  }, [seekToSegment, segmentIndex]);

  const handleNext = useCallback(() => {
    if (segmentIndex < totalSegments - 1) {
      const next = segmentIndex + 1;
      setSegmentIndex(next);
      seekToSegment(next);
    }
  }, [segmentIndex, totalSegments, seekToSegment]);

  const handlePrev = () => {
    if (segmentIndex > 0) {
      const prev = segmentIndex - 1;
      setSegmentIndex(prev);
      seekToSegment(prev);
    }
  };

  const handleComplete = (segId: string, accuracy: number) => {
    const next = new Set(completedSegments).add(segId);
    setCompletedSegments(next);
    saveProgress(video.id, next);
    setAccuracyMap(m => ({ ...m, [segId]: accuracy }));
  };

  const onReady = (e: YouTubeEvent) => {
    playerRef.current = e.target;
    setIsReady(true);
  };

  const onStateChange = (e: YouTubeEvent) => {
    setIsPlaying(e.data === 1);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) { playerRef.current.pauseVideo(); }
    else { playerRef.current.playVideo(); }
  };

  const changeSpeed = (s: 0.75 | 1 | 1.25) => {
    setSpeed(s);
    playerRef.current?.setPlaybackRate(s);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>{video.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm" style={{ color: '#64748B' }}>{video.channel}</span>
            <Badge label={video.cefrLevel} variant="cefr" level={video.cefrLevel} />
            <Badge label={video.category} variant="muted" />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold" style={{ color: '#10B981' }}>{overallProgress}%</div>
          <div className="text-xs" style={{ color: '#64748B' }}>{doneCount}/{totalSegments} done</div>
        </div>
      </div>

      <ProgressBar value={overallProgress} color="#10B981" height={6} />

      {/* Main layout: player + dictation */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* YouTube Player */}
        <div className="lg:w-1/2 flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#2D3A55' }}>
            <YouTube
              videoId={video.youtubeId}
              opts={{ height: '280', width: '100%', playerVars: { autoplay: 0, controls: 1 } }}
              onReady={onReady}
              onStateChange={onStateChange}
            />
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={togglePlay}
              disabled={!isReady}
              className="p-2 rounded-lg border"
              style={{ borderColor: '#2D3A55', color: '#94A3B8' }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={handleReplay}
              disabled={!isReady}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: '#2D3A55', color: '#94A3B8' }}
              title="Ctrl+Space"
            >
              <RotateCcw size={15} /> Replay segment
            </button>

            {/* Speed */}
            <div className="flex items-center gap-1 ml-auto">
              {SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className="px-2 py-1 rounded text-xs font-mono"
                  style={{
                    backgroundColor: speed === s ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: speed === s ? '#10B981' : '#64748B',
                    border: speed === s ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Segment list */}
          <div
            className="flex-1 overflow-y-auto rounded-xl border p-2 flex flex-col gap-1 max-h-52"
            style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderColor: '#2D3A55' }}
          >
            {video.transcript.map((seg, i) => {
              const done = completedSegments.has(seg.id);
              const active = i === segmentIndex;
              const acc = accuracyMap[seg.id];
              return (
                <button
                  key={seg.id}
                  onClick={() => { setSegmentIndex(i); seekToSegment(i); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm w-full"
                  style={{
                    backgroundColor: active ? 'rgba(16,185,129,0.10)' : 'transparent',
                    color: active ? '#10B981' : done ? '#94A3B8' : '#64748B',
                    border: active ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                  }}
                >
                  <span className="shrink-0 w-6 text-xs text-center">{done ? '✓' : (i + 1)}</span>
                  <span className="flex-1 truncate">{seg.text}</span>
                  {acc !== undefined && (
                    <span className="text-xs" style={{ color: acc >= 80 ? '#10B981' : '#EF4444' }}>{acc}%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dictation panel */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          {/* Segment nav */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl border"
            style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
          >
            <button onClick={handlePrev} disabled={segmentIndex === 0} className="p-1 rounded" aria-label="Previous segment">
              <ChevronLeft size={18} style={{ color: segmentIndex === 0 ? '#3D4F70' : '#94A3B8' }} />
            </button>
            <div className="text-center">
              <p className="text-xs" style={{ color: '#64748B' }}>Segment {segmentIndex + 1} of {totalSegments}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {currentSegment.startTime}s – {currentSegment.endTime}s
              </p>
            </div>
            <button onClick={handleNext} disabled={segmentIndex === totalSegments - 1} className="p-1 rounded" aria-label="Next segment">
              <ChevronRight size={18} style={{ color: segmentIndex === totalSegments - 1 ? '#3D4F70' : '#94A3B8' }} />
            </button>
          </div>

          {/* Dictation engine */}
          <DictationEngine
            key={currentSegment.id}
            segment={currentSegment}
            onNext={handleNext}
            onReplay={handleReplay}
            isLast={segmentIndex === totalSegments - 1}
            completedSegments={completedSegments}
            onComplete={handleComplete}
          />

          {/* Segment note */}
          <div className="flex justify-end">
            <SegmentNote
              videoId={video.id}
              segmentId={currentSegment.id}
              segmentText={currentSegment.text}
              segmentTimestamp={currentSegment.startTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
