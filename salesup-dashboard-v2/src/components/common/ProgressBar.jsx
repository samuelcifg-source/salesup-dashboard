export default function ProgressBar({ value, max, color = '#FFD700', height = 8, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="w-full">
      {label && <div className="text-[10px] text-neutral-500 mb-1">{label}</div>}
      <div className="w-full rounded-full overflow-hidden" style={{ backgroundColor: '#1a1a1a', height }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
