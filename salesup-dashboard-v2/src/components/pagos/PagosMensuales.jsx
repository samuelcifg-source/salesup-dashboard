import { useState } from 'react';
import { formatEuro } from '../../utils/format';

function Section({ label, subtitle, color, rows, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [expandedPerson, setExpandedPerson] = useState(null);

  if (!rows || rows.length === 0) return null;

  const sectionPending = rows.reduce((s, r) => s + r.pending, 0);
  const sectionExpected = rows.reduce((s, r) => s + r.expected, 0);
  const sectionTotal = sectionPending + sectionExpected;

  const colors = {
    red: { label: 'text-red-400', border: 'border-red-800/30', bg: 'bg-red-950/10', amount: 'text-red-400' },
    yellow: { label: 'text-yellow-400', border: 'border-neutral-800', bg: 'bg-neutral-900/50', amount: 'text-red-400' },
    neutral: { label: 'text-neutral-400', border: 'border-neutral-800', bg: 'bg-neutral-900/50', amount: 'text-neutral-400' },
  };
  const c = colors[color] || colors.yellow;

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl overflow-hidden`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
        <div>
          <span className={`text-sm font-bold ${c.label}`}>{label}</span>
          {subtitle && <span className="text-sm text-neutral-600 ml-2">— {subtitle}</span>}
        </div>
        <div className="flex items-center gap-3">
          {sectionPending > 0 && <span className={`text-sm font-bold ${c.amount}`}>{formatEuro(sectionPending)}</span>}
          {sectionExpected > 0 && <span className="text-[10px] text-neutral-500">({formatEuro(sectionExpected)} esperado)</span>}
          <svg className={`w-4 h-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-neutral-800/50">
          {rows.map((row, idx) => {
            const isExpanded = expandedPerson === idx;
            return (
              <div key={row.name}>
                <button onClick={() => setExpandedPerson(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-neutral-800/30">
                  <div className="flex items-center gap-2">
                    <svg className={`w-3 h-3 text-neutral-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm text-neutral-200 font-bold">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {row.pending > 0 && <span className="text-sm font-bold text-red-400">{formatEuro(row.pending)}</span>}
                    {row.expected > 0 && <span className="text-[10px] text-neutral-500">{formatEuro(row.expected)} esperado</span>}
                  </div>
                </button>
                {isExpanded && row.details.length > 0 && (
                  <div className="px-4 py-2 bg-black/20 border-b border-neutral-800/30">
                    {row.details
                      .sort((a, b) => (a.type === 'pending' ? -1 : 1) - (b.type === 'pending' ? -1 : 1) || b.amount - a.amount)
                      .map((d, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-300">{d.client}</span>
                            {d.role && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-neutral-400 capitalize">{d.role}</span>}
                          </div>
                          <span className={`text-xs font-bold ${d.type === 'pending' ? 'text-red-400' : 'text-neutral-500'}`}>
                            {formatEuro(d.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildRows(people, getData) {
  return people
    .map(p => {
      const data = getData(p);
      if (!data || (data.pending <= 0 && data.expected <= 0)) return null;
      return { name: p.name, pending: data.pending, expected: data.expected, details: data.details };
    })
    .filter(Boolean)
    .sort((a, b) => b.pending - a.pending || (b.pending + b.expected) - (a.pending + a.expected));
}

export default function PagosMensuales({ monthKeys, people, showOverdue }) {
  if (!monthKeys || monthKeys.length < 2 || !people || people.length === 0) return null;

  const overdueRows = showOverdue ? buildRows(people, p => p.overdue) : [];
  const thisMonthRows = buildRows(people, p => p.months[monthKeys[0].key]);
  const nextMonthRows = buildRows(people, p => p.months[monthKeys[1].key]);

  const thisLabel = monthKeys[0].label.charAt(0).toUpperCase() + monthKeys[0].label.slice(1);
  const nextLabel = monthKeys[1].label.charAt(0).toUpperCase() + monthKeys[1].label.slice(1);

  if (overdueRows.length === 0 && thisMonthRows.length === 0 && nextMonthRows.length === 0) return null;

  return (
    <div className="space-y-3">
      <Section label="Atrasado" subtitle="Meses anteriores" color="red" rows={overdueRows} defaultOpen={true} />
      <Section label="Este Mes" subtitle={thisLabel} color="yellow" rows={thisMonthRows} defaultOpen={true} />
      <Section label="Proximo Mes" subtitle={nextLabel} color="neutral" rows={nextMonthRows} defaultOpen={false} />
    </div>
  );
}
