'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Mic, StopCircle, Volume2 } from 'lucide-react';
import type { VocabWord } from '@/lib/vocabulary-data';
import { Badge } from '../ui/Badge';

interface ShadowingCardProps {
  word: VocabWord;
}

type RecordingState = 'idle' | 'recording' | 'done';

export function ShadowingCard({ word }: ShadowingCardProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const speak = useCallback((locale: 'en-US' | 'en-GB') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word.word);
    utter.lang = locale;
    utter.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(locale === 'en-US' ? 'en-US' : 'en-GB'));
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  }, [word.word]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecordingState('recording');
    } catch {
      alert('Microphone access denied. Please allow microphone access to use this feature.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecordingState('done');
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
      {/* Word display */}
      <div
        className="rounded-2xl border p-6 flex flex-col items-center gap-3"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <span className="text-5xl">{word.emoji}</span>
        <h2 className="text-3xl font-bold" style={{ color: '#F1F5F9' }}>{word.word}</h2>
        <div className="flex gap-4 text-sm font-mono" style={{ color: '#94A3B8' }}>
          <span>US: {word.ipa_us}</span>
          <span>UK: {word.ipa_uk}</span>
        </div>
        <p className="text-center text-sm" style={{ color: '#94A3B8' }}>{word.definition_en}</p>
        <p className="text-center text-xs" style={{ color: '#64748B' }}>{word.definition_id}</p>
        <div className="flex gap-2">
          <Badge label={word.level} variant="cefr" level={word.level} />
          <Badge label={word.category} variant="muted" />
        </div>
      </div>

      {/* TTS Controls */}
      <div
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>1. Listen to pronunciation</p>
        <div className="flex gap-3">
          <button
            onClick={() => speak('en-US')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: '#10B981', color: '#10B981', backgroundColor: 'rgba(16,185,129,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.16)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)')}
          >
            <Volume2 size={16} /> 🇺🇸 US
          </button>
          <button
            onClick={() => speak('en-GB')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: '#6366F1', color: '#6366F1', backgroundColor: 'rgba(99,102,241,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.16)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)')}
          >
            <Volume2 size={16} /> 🇬🇧 UK
          </button>
        </div>
      </div>

      {/* Recording */}
      <div
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>2. Record yourself</p>
        <div className="flex gap-3 items-center">
          {recordingState !== 'recording' ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)')}
            >
              <Mic size={16} /> Start Recording
            </button>
          ) : (
            <motion.button
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.5)' }}
            >
              <StopCircle size={16} /> Stop
            </motion.button>
          )}
          {recordingState === 'recording' && (
            <span className="text-xs" style={{ color: '#EF4444' }}>● Recording...</span>
          )}
        </div>

        {audioUrl && (
          <div className="mt-1">
            <p className="text-xs mb-1" style={{ color: '#64748B' }}>Your recording:</p>
            <audio controls src={audioUrl} className="w-full" style={{ height: 36 }} />
          </div>
        )}
      </div>
    </div>
  );
}