import { useState, Fragment } from 'react';
import { formatEuro } from '../../utils/format';

export default function ExpandableRoleTable({ title, rows, columns, clientDrillDown }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!rows || rows.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-yellow-400 mb-2 text-center">{title}</h3>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-800">
              {columns.map(col => (
                <th key={col.key} className="px-3 py-2 text-left text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                  {col.label}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isExpanded = expandedRow === idx;
              const clients = clientDrillDown?.[row.name] || [];
              const hasClients = clients.length > 0;

              return (
                <Fragment key={row.name}>
                  <tr
                    className={`border-b border-neutral-800/50 ${hasClients ? 'cursor-pointer hover:bg-neutral-800/30' : ''} transition-colors`}
                    onClick={() => hasClients && setExpandedRow(isExpanded ? null : idx)}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-3 py-2.5">
                        {col.render ? col.render(row[col.key]) : row[col.key]}
                      </td>
                    ))}
                    <td className="px-2">
                      {hasClients && (
                        <svg
                          className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </td>
                  </tr>
                  {isExpanded && clients.length > 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-3 py-2 bg-neutral-800/20">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-neutral-600">
                              <th className="text-left py-1 font-bold">Cliente</th>
                              <th className="text-left py-1 font-bold">Fecha</th>
                              <th className="text-left py-1 font-bold">Ganado</th>
                              <th className="text-left py-1 font-bold">Pagado</th>
                              <th className="text-left py-1 font-bold">Pendiente</th>
                              <th className="text-left py-1 font-bold">Meses Rest.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clients.map(c => (
                              <tr key={c.clientId} className="border-t border-neutral-800/30">
                                <td className="py-1.5 text-neutral-300 font-medium">{c.clientName}</td>
                                <td className="py-1.5 text-neutral-500">{c.startDate ? new Date(c.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}</td>
                                <td className="py-1.5 text-yellow-400 font-bold">{formatEuro(c.earned)}</td>
                                <td className="py-1.5 text-emerald-400 font-bold">{formatEuro(c.paid)}</td>
                                <td className="py-1.5 text-red-400 font-bold">{formatEuro(c.pending)}</td>
                                <td className="py-1.5 text-neutral-400">{c.remainingMonths}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
