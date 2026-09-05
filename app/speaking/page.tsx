'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, RotateCcw, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

const SENTENCES = [
  { id: 's1', text: 'The quick brown fox jumps over the lazy dog.', level: 'A1', tip: 'Focus on clear pronunciation of each word.' },
  { id: 's2', text: 'She sells seashells by the seashore.', level: 'A2', tip: 'A classic tongue twister — take it slowly at first.' },
  { id: 's3', text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?', level: 'A2', tip: 'Pay attention to the "w" and "ch" sounds.' },
  { id: 's4', text: 'I would like to schedule a meeting to discuss our quarterly results.', level: 'B1', tip: 'Business English — stress the key content words.' },
  { id: 's5', text: 'The implementation of artificial intelligence is revolutionizing various industries.', level: 'B2', tip: 'Multi-syllable words — break them into syllables first.' },
  { id: 's6', text: 'Despite the unprecedented challenges, the organization maintained its commitment to sustainability.', level: 'C1', tip: 'Academic register — aim for a natural, flowing delivery.' },
  { id: 's7', text: 'Could you please clarify the terms and conditions of this agreement?', level: 'B1', tip: 'Polite request form — keep your intonation rising at the end.' },
  { id: 's8', text: 'The research methodology employed in this study ensures reproducible results.', level: 'C1', tip: 'Focus on word stress in "methodology" and "reproducible".' },
];

type RecordState = 'idle' | 'recording' | 'done';

export default function SpeakingPage() {
  const [index, setIndex] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sentence = SENTENCES[index];

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(sentence.text);
    utter.lang = 'en-US';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  }, [sentence.text]);

  const startRecord = async () => {
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
      setRecordState('recording');
    } catch {
      alert('Microphone access needed. Please allow it in your browser settings.');
    }
  };

  const stopRecord = () => {
    mediaRecorderRef.current?.stop();
    setRecordState('done');
  };

  const reset = () => {
    setRecordState('idle');
    setAudioUrl(null);
  };

  const goNext = () => { setIndex(i => (i + 1) % SENTENCES.length); reset(); };
  const goPrev = () => { setIndex(i => (i - 1 + SENTENCES.length) % SENTENCES.length); reset(); };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(99,102,241,0.12)' }}>
          <Mic size={22} color="#6366F1" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>Speaking</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Shadowing practice — listen, repeat, record</p>
        </div>
      </div>

      {/* Sentence card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sentence.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border p-8 flex flex-col gap-4 text-center"
          style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
        >
          <div className="flex justify-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              {sentence.level}
            </span>
            <span className="text-sm" style={{ color: '#64748B' }}>Sentence {index + 1} of {SENTENCES.length}</span>
          </div>
          <p className="text-2xl font-medium leading-relaxed" style={{ color: '#F1F5F9' }}>
            {sentence.text}
          </p>
          <p className="text-sm italic" style={{ color: '#64748B' }}>
            💡 {sentence.tip}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div
        className="rounded-xl border p-5 flex flex-col gap-5"
        style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
      >
        {/* Step 1: Listen */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>Step 1 – Listen</p>
          <button
            onClick={speak}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium"
            style={{ borderColor: '#10B981', color: '#10B981', backgroundColor: 'rgba(16,185,129,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.16)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)')}
          >
            <Volume2 size={16} /> Play pronunciation
          </button>
        </div>

        {/* Step 2: Record */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>Step 2 – Record yourself</p>

          {/* Waveform visualizer (CSS animation) */}
          {recordState === 'recording' && (
            <div className="flex items-center justify-center gap-1 mb-4 h-10">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.07, ease: 'easeInOut' }}
                  className="rounded-full"
                  style={{ width: 4, height: 32, backgroundColor: '#EF4444', transformOrigin: 'center' }}
                />
              ))}
            </div>
          )}

          <div className="flex gap-3 items-center flex-wrap">
            {recordState === 'idle' && (
              <button
                onClick={startRecord}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border"
                style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.08)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.16)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
              >
                <Mic size={16} /> Start Recording
              </button>
            )}
            {recordState === 'recording' && (
              <motion.button
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                onClick={stopRecord}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border"
                style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)' }}
              >
                <Square size={16} /> Stop Recording
              </motion.button>
            )}
            {recordState === 'done' && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border"
                style={{ borderColor: '#2D3A55', color: '#94A3B8' }}
              >
                <RotateCcw size={15} /> Re-record
              </button>
            )}
          </div>

          {/* Playback */}
          {audioUrl && (
            <div className="mt-4">
              <p className="text-xs mb-2" style={{ color: '#64748B' }}>Your recording:</p>
              <audio controls src={audioUrl} className="w-full" style={{ height: 40 }} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={goPrev}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm"
          style={{ borderColor: '#2D3A55', color: '#94A3B8' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-sm" style={{ color: '#64748B' }}>{index + 1} / {SENTENCES.length}</span>
        <button
          onClick={goNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm"
          style={{ borderColor: '#2D3A55', color: '#94A3B8' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
