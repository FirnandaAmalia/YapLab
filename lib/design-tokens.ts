// ─── YapLab Design Tokens ───────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  bg:        '#0B0F19',
  surface:   '#1E293B',
  surfaceHover: '#263248',
  border:    '#2D3A55',
  borderHover: '#3D4F70',

  // Accents
  emerald:   '#10B981',
  emeraldDim: '#059669',
  emeraldGlow: 'rgba(16,185,129,0.15)',
  violet:    '#8B5CF6',
  violetDim: '#7C3AED',
  violetGlow: 'rgba(139,92,246,0.15)',

  // Text
  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error:   '#EF4444',
  info:    '#3B82F6',

  // SRS ratings
  again: '#EF4444',
  hard:  '#F59E0B',
  good:  '#10B981',
  easy:  '#8B5CF6',
} as const;

export const cefrColors: Record<string, string> = {
  A1: '#10B981',
  A2: '#34D399',
  B1: '#F59E0B',
  B2: '#F97316',
  C1: '#EF4444',
};

export const spacing = {
  xs:  '0.25rem',
  sm:  '0.5rem',
  md:  '1rem',
  lg:  '1.5rem',
  xl:  '2rem',
  '2xl': '3rem',
} as const;

export const radius = {
  sm:   '0.375rem',
  md:   '0.75rem',
  lg:   '1rem',
  xl:   '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  card:   '0 4px 24px rgba(0,0,0,0.4)',
  glow:   '0 0 20px rgba(16,185,129,0.25)',
  violetGlow: '0 0 20px rgba(139,92,246,0.25)',
} as const;

export const transitions = {
  fast:   'all 0.15s ease',
  normal: 'all 0.25s ease',
  slow:   'all 0.4s ease',
} as const;