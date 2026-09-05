interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  className?: string;
}

export function StatCard({ icon, label, value, sub, accent = '#10B981', className = '' }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-4 border flex flex-col gap-2 ${className}`}
      style={{
        backgroundColor: '#1E293B',
        borderColor: '#2D3A55',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-[#94A3B8]">{label}</span>
      </div>
      <div
        className="text-3xl font-bold tracking-tight"
        style={{ color: accent }}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-[#64748B]">{sub}</div>}
    </div>
  );
}