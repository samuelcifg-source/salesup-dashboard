export default function KCard({ title, subtitle, value, previous, variant }) {
  const base = 'border rounded-xl p-3 flex flex-col justify-between min-w-[140px]';
  const cls = variant === 'red'
    ? `${base} bg-red-950/30 border-red-800/40`
    : variant === 'green'
    ? `${base} bg-emerald-950/30 border-emerald-800/40`
    : `${base} bg-neutral-900/50 border-neutral-800`;

  const vc = variant === 'red'
    ? 'text-red-400'
    : variant === 'green'
    ? 'text-emerald-400'
    : 'text-yellow-400';

  let delta = null;
  if (previous != null) {
    const parseVal = (val) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.,%-]/g, '').replace(',', '.');
        if (val.includes('%')) return parseFloat(cleaned) / 100;
        return parseFloat(cleaned);
      }
      return 0;
    };
    const curr = parseVal(value);
    const prev = parseVal(previous);
    const up = curr >= prev;
    delta = (
      <div className={`text-[11px] mt-1 font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
        {up ? '↑' : '↓'} {previous}
      </div>
    );
  }

  return (
    <div className={cls}>
      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
        {title}
        {subtitle && <span className="ml-1 normal-case tracking-normal text-neutral-600 font-normal">({subtitle})</span>}
      </div>
      <div className={`text-2xl font-extrabold tracking-tight leading-none mt-1 ${vc}`}>{value}</div>
      {delta}
    </div>
  );
}
