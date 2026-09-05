import Link from 'next/link';
import Image from 'next/image';
import type { ListeningVideo } from '@/lib/types';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { cefrColors } from '@/lib/design-tokens';
import { Clock } from 'lucide-react';

interface VideoCardProps {
  video: ListeningVideo;
  progress?: number; // 0-100 dictation completion
}

export function VideoCard({ video, progress = 0 }: VideoCardProps) {
  return (
    <Link href={`/listening/${video.id}`} className="block group">
      <div
        className="rounded-xl border overflow-hidden transition-all duration-200"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#3D4F70')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2D3A55')}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          {/* Duration badge */}
          <div
            className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-mono font-semibold"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#F1F5F9' }}
          >
            {video.duration}
          </div>
          {/* CEFR badge */}
          <div className="absolute top-2 left-2">
            <Badge label={video.cefrLevel} variant="cefr" level={video.cefrLevel} />
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-2">
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: '#F1F5F9' }}>
            {video.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#64748B' }}>{video.channel}</span>
            <span className="text-xs" style={{ color: '#2D3A55' }}>·</span>
            <Badge label={video.category} variant="muted" />
          </div>
          {progress > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: '#64748B' }}>
                <span>Dictation</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} color="#10B981" height={4} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
