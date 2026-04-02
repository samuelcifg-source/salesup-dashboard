import { useState } from 'react';

export default function DataTable({ columns, data, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = a[sortKey] ?? '';
        const vb = b[sortKey] ?? '';
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sortAsc ? cmp : -cmp;
      })
    : data;

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-900/80">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="px-3 py-2 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest cursor-pointer hover:text-yellow-400 select-none"
              >
                {col.label} {sortKey === col.key ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-3 py-6 text-center text-neutral-600">Sin datos</td></tr>
          ) : sorted.map((row, i) => (
            <tr key={row.id || i} className={`border-t border-neutral-800/50 hover:bg-neutral-800/60 ${i % 2 === 0 ? 'bg-transparent' : 'bg-neutral-900/60'}`}>
              {columns.map(col => (
                <td key={col.key} className="px-3 py-2 text-neutral-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-3 py-2 flex gap-2">
                  {onEdit && <button onClick={() => onEdit(row)} className="text-yellow-400 hover:text-yellow-300 text-xs">Editar</button>}
                  {onDelete && <button onClick={() => onDelete(row)} className="text-red-400 hover:text-red-300 text-xs">Eliminar</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
