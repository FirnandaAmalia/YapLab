interface ProgressBarProps {
  value: number;        // 0-100
  max?: number;
  color?: string;       // hex or CSS color
  height?: number;      // px
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = '#10B981',
  height = 6,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[#94A3B8] mt-1">{Math.round(pct)}%</span>
      )}
    </div>
  );
}