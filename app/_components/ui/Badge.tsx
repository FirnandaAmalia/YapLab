import { cefrColors } from '@/lib/design-tokens';

type BadgeVariant = 'emerald' | 'indigo' | 'warning' | 'error' | 'muted' | 'cefr';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  level?: string; // for cefr variant
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald: 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)]',
  indigo:  'bg-[rgba(99,102,241,0.15)] text-[#6366F1] border border-[rgba(99,102,241,0.3)]',
  warning: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border border-[rgba(245,158,11,0.3)]',
  error:   'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]',
  muted:   'bg-[rgba(100,116,139,0.15)] text-[#94A3B8] border border-[rgba(100,116,139,0.3)]',
  cefr:    '',
};

export function Badge({ label, variant = 'muted', level, className = '' }: BadgeProps) {
  let style: React.CSSProperties = {};
  let cls = variantStyles[variant];

  if (variant === 'cefr' && level) {
    const hex = cefrColors[level] ?? '#94A3B8';
    style = {
      backgroundColor: `${hex}26`,
      color: hex,
      border: `1px solid ${hex}4D`,
    };
    cls = '';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls} ${className}`}
      style={style}
    >
      {label}
    </span>
  );
}