'use client';

import { use } from 'react';
import Link from 'next/link';
import { listeningData } from '@/lib/listening-data';
import { DictationPlayer } from '../../_components/listening/DictationPlayer';
import { ArrowLeft } from 'lucide-react';

export default function VideoPage({ params }: PageProps<'/listening/[videoId]'>) {
  const { videoId } = use(params);
  const video = listeningData.find(v => v.id === videoId);

  if (!video) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full gap-4">
        <p className="text-lg" style={{ color: '#94A3B8' }}>Video not found.</p>
        <Link href="/listening" className="flex items-center gap-2 text-sm" style={{ color: '#10B981' }}>
          <ArrowLeft size={16} /> Back to Listening Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-4 h-full">
      <Link href="/listening" className="flex items-center gap-2 text-sm w-fit" style={{ color: '#64748B' }}>
        <ArrowLeft size={16} /> Back to Listening Studio
      </Link>
      <DictationPlayer video={video} />
    </div>
  );
}
