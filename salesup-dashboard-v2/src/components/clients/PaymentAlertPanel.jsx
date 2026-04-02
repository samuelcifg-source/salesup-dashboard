import { useState } from 'react';
import { formatEuro } from '../../utils/format';

const TABS = [
  { key: 'overdue', label: 'Vencidos', color: 'red' },
  { key: 'thisMonth', label: 'Este Mes', color: 'yellow' },
  { key: 'nextMonth', label: 'Proximo Mes', color: 'neutral' },
];

export default function PaymentAlertPanel({ alerts, onAlertClick }) {
  const [activeTab, setActiveTab] = useState('overdue');

  const total = alerts.overdue.length + alerts.thisMonth.length + alerts.nextMonth.length;
  if (total === 0) return null;

  const colorMap = {
    overdue: { bg: 'bg-red-950/30', border: 'border-red-800/40', text: 'text-red-400', badge: 'bg-red-500' },
    thisMonth: { bg: 'bg-yellow-950/30', border: 'border-yellow-800/40', text: 'text-yellow-400', badge: 'bg-yellow-500' },
    nextMonth: { bg: 'bg-neutral-800/50', border: 'border-neutral-700', text: 'text-neutral-400', badge: 'bg-neutral-500' },
  };

  const items = alerts[activeTab] || [];
  const colors = colorMap[activeTab];

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
      {/* Tab buttons */}
      <div className="flex border-b border-neutral-800">
        {TABS.map(tab => {
          const count = alerts[tab.key]?.length || 0;
          const isActive = activeTab === tab.key;
          const c = colorMap[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isActive ? `${c.text} border-b-2 ${tab.key === 'overdue' ? 'border-red-400' : tab.key === 'thisMonth' ? 'border-yellow-400' : 'border-neutral-400'}` : 'text-neutral-600 hover:text-neutral-400'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`${c.badge} text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      {items.length > 0 ? (
        <div className="max-h-[200px] overflow-y-auto">
          {items.map((alert, idx) => (
            <button
              key={`${alert.clientId}-${alert.installmentNumber}-${idx}`}
              onClick={() => onAlertClick?.(alert.clientId)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-neutral-800/50 last:border-0"
            >
              <span className="text-sm text-white font-bold truncate flex-1 text-left">{alert.clientName}</span>
              <span className="text-[10px] text-neutral-500">Cuota #{alert.installmentNumber}</span>
              <span className={`text-sm font-bold ${colors.text}`}>{formatEuro(alert.amount)}</span>
              <span className="text-[10px] text-neutral-500">{alert.dueDate}</span>
              <span className={`text-[10px] font-bold ${colors.text}`}>
                {activeTab === 'overdue'
                  ? `Hace ${Math.abs(alert.daysDiff)}d`
                  : alert.daysDiff === 0 ? 'Hoy' : `En ${alert.daysDiff}d`
                }
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-neutral-600">Sin alertas</div>
      )}
    </div>
  );
}
