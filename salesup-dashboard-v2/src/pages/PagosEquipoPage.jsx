import { useMemo, useState } from 'react';
import { useClients } from '../hooks/useClients';
import { useExpenses } from '../hooks/useExpenses';
import { useDateFilter } from '../hooks/useDateFilter';
import { useCommissions } from '../hooks/useCommissions';
import { formatEuro, formatNumber, sumField } from '../utils/format';
import { getDateRange, filterByDateRange } from '../utils/dates';
import { parseClientData } from '../utils/parseClientData';
import KCard from '../components/common/KCard';
import FilterBar from '../components/common/FilterBar';
import Select from '../components/common/Select';
import BarChartCard from '../components/charts/BarChartCard';
import ExpandableRoleTable from '../components/pagos/ExpandableRoleTable';
import PagosMensuales from '../components/pagos/PagosMensuales';

const MONTHS = [
  { value: '', label: 'Todos' },
  { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' }, { value: '2', label: 'Marzo' },
  { value: '3', label: 'Abril' }, { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' },
  { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' }, { value: '8', label: 'Septiembre' },
  { value: '9', label: 'Octubre' }, { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const YEARS = [
  { value: '', label: 'Todos' },
  ...Array.from({ length: 5 }, (_, i) => ({ value: String(currentYear - 2 + i), label: String(currentYear - 2 + i) })),
];

function filterPlaceholders(rows) {
  return rows.filter(r => {
    const n = (r.name || '').toLowerCase();
    return n && !n.startsWith('sin ') && !n.startsWith('no ');
  });
}

export default function PagosEquipoPage() {
  const { data: clients, loading: loadingClients } = useClients();
  const { data: expenses, loading: loadingExpenses } = useExpenses();

  const { filtered: periodFiltered, period, setPeriod, customDates, setCustomDates } = useDateFilter(clients, 'start_date', 'pagos-equipo');

  const [monthYearOn, setMonthYearOn] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const handleToggleMonthYear = (on) => {
    setMonthYearOn(on);
    if (on) setPeriod('ALL');
    else { setFilterMonth(''); setFilterYear(''); }
  };

  const filtered = useMemo(() => {
    if (!monthYearOn) return periodFiltered;
    return clients.filter(c => {
      const d = new Date(c.start_date);
      if (filterMonth !== '' && d.getMonth() !== Number(filterMonth)) return false;
      if (filterYear !== '' && d.getFullYear() !== Number(filterYear)) return false;
      return true;
    });
  }, [monthYearOn, periodFiltered, clients, filterMonth, filterYear]);

  const commissions = useCommissions(filtered);

  const filteredExpenses = useMemo(() => {
    if (monthYearOn) {
      return expenses.filter(ex => {
        const d = new Date(ex.date);
        if (filterMonth !== '' && d.getMonth() !== Number(filterMonth)) return false;
        if (filterYear !== '' && d.getFullYear() !== Number(filterYear)) return false;
        return true;
      });
    }
    if (period === 'CUSTOM') {
      const s = new Date(customDates.s1 + 'T00:00:00');
      const e = new Date(customDates.e1 + 'T00:00:00');
      return filterByDateRange(expenses, 'date', [s, e]);
    }
    if (period !== 'ALL') return filterByDateRange(expenses, 'date', getDateRange(period));
    return expenses;
  }, [expenses, monthYearOn, filterMonth, filterYear, period, customDates]);

  const tableExpenses = useMemo(() => sumField(filteredExpenses, 'amount'), [filteredExpenses]);
  const clientExtraExpenses = useMemo(() => sumField(filtered, 'extra_expenses'), [filtered]);
  const totalExpenses = tableExpenses + clientExtraExpenses;
  const totalCash = useMemo(() => sumField(filtered, 'cash'), [filtered]);
  const totalRevenue = useMemo(() => sumField(filtered, 'revenue'), [filtered]);
  const netRevenue = totalCash - commissions.totalPending - commissions.totalPaid - totalExpenses;

  const buildRows = (totals) => filterPlaceholders(Object.entries(totals).map(([name, d]) => ({
    name, owed: d.owed, pending: d.pending, paid: d.paid, not_yet_generated: d.not_yet_generated || 0,
  })));

  const setterRows = useMemo(() => buildRows(commissions.setterTotals), [commissions]);
  const traffRows = useMemo(() => buildRows(commissions.traffTotals), [commissions]);
  const procesosRows = useMemo(() => buildRows(commissions.procesosTotals), [commissions]);

  const summaryRows = useMemo(() => {
    const byPerson = {};
    const add = (totals) => {
      Object.entries(totals).forEach(([name, d]) => {
        const n = (name || '').toLowerCase();
        if (!n || n.startsWith('sin ') || n.startsWith('no ')) return;
        if (!byPerson[name]) byPerson[name] = { pending: 0, owed: 0, future: 0 };
        byPerson[name].pending += d.pending;
        byPerson[name].owed += d.owed;
        byPerson[name].future += (d.not_yet_generated || 0);
      });
    };
    add(commissions.setterTotals);
    add(commissions.traffTotals);
    add(commissions.procesosTotals);
    return Object.entries(byPerson)
      .map(([name, v]) => ({ name, ...v }))
      .filter(r => r.pending || r.owed || r.future)
      .sort((a, b) => b.pending - a.pending);
  }, [commissions]);

  const chartData = useMemo(() => [
    { name: 'Setter', amount: Object.values(commissions.setterTotals).reduce((s, d) => s + d.pending, 0) },
    { name: 'Trafficker', amount: Object.values(commissions.traffTotals).reduce((s, d) => s + d.pending, 0) },
    { name: 'Procesos', amount: Object.values(commissions.procesosTotals).reduce((s, d) => s + d.pending, 0) },
  ], [commissions]);

  // Timeline: expected commissions next 6 months
  const timelineData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      return { name: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }), month: d.getMonth(), year: d.getFullYear(), amount: 0 };
    });
    filtered.forEach(client => {
      const { payment_schedule, role_commissions } = parseClientData(client.installments);
      if (client.payment_type !== 'Auto-financiado' || !payment_schedule.length) return;
      const rev = Number(client.revenue) || 0;
      if (!rev) return;
      const totalComm = (role_commissions.setter || 0) + (role_commissions.trafficker || 0) + (role_commissions.procesos || 0);
      payment_schedule.forEach(inst => {
        if (inst.status === 'paid') return;
        const due = new Date(inst.due_date + 'T00:00:00');
        const bucket = months.find(m => m.month === due.getMonth() && m.year === due.getFullYear());
        if (bucket) bucket.amount += Math.round(((inst.amount || 0) / rev) * totalComm * 100) / 100;
      });
    });
    return months;
  }, [filtered]);

  // ── Calendario de comisiones por persona/mes ──
  const calendarData = useMemo(() => {
    const now = new Date();
    const ROLES_MAP = { setter: 'setter', trafficker: 'trafficker', procesos: 'process_manager' };
    // Generate 6 month keys
    const monthKeys = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''), month: d.getMonth(), year: d.getFullYear() };
    });

    // byPerson: { name: { months: { "2026-2": { pending: X, expected: Y, clients: [...] } }, totalPending: N } }
    const byPerson = {};

    const ensurePerson = (name) => {
      if (!byPerson[name]) {
        byPerson[name] = { months: {}, totalPending: 0, overdue: { pending: 0, expected: 0, details: [] } };
        monthKeys.forEach(m => { byPerson[name].months[m.key] = { pending: 0, expected: 0, details: [] }; });
      }
    };

    const isPlaceholder = (n) => { const l = (n || '').toLowerCase(); return !l || l.startsWith('sin ') || l.startsWith('no '); };

    filtered.forEach(client => {
      const { payment_schedule, role_commissions, commission_payments } = parseClientData(client.installments);
      const rev = Number(client.revenue) || 0;
      if (!rev) return;
      if (client.payment_type !== 'Auto-financiado' && payment_schedule.length > 0) return; // ignore orphan schedules

      const roles = ['setter', 'trafficker', 'procesos'];

      payment_schedule.forEach(inst => {
        const due = new Date(inst.due_date + 'T00:00:00');
        const mKey = `${due.getFullYear()}-${due.getMonth()}`;
        const instCP = commission_payments[String(inst.number)] || {};

        roles.forEach(role => {
          const total = role_commissions[role] || 0;
          if (!total) return;
          const person = client[ROLES_MAP[role]];
          if (isPlaceholder(person)) return;
          ensurePerson(person);

          // Use stored role_amounts if available, otherwise proportional
          const amount = inst.role_amounts?.[role] !== undefined
            ? inst.role_amounts[role]
            : Math.round(((inst.amount || 0) / rev) * total * 100) / 100;

          if (inst.status === 'paid') {
            // Commission generated — check if paid to member
            if (!instCP[role]?.paid_to_member) {
              // Pending payment to member: bucket by paid_date month
              const paidDate = inst.paid_date ? new Date(inst.paid_date + 'T00:00:00') : due;
              const pKey = `${paidDate.getFullYear()}-${paidDate.getMonth()}`;
              if (byPerson[person].months[pKey]) {
                // Current or future month
                byPerson[person].months[pKey].pending += amount;
                byPerson[person].months[pKey].details.push({ client: client.name, role, amount, type: 'pending' });
              } else {
                // Past month → overdue
                byPerson[person].overdue.pending += amount;
                byPerson[person].overdue.details.push({ client: client.name, role, amount, type: 'pending' });
              }
              byPerson[person].totalPending += amount;
            }
            // If paid to member, it disappears from calendar
          } else {
            // Not yet paid by client — expected commission
            if (byPerson[person].months[mKey]) {
              byPerson[person].months[mKey].expected += amount;
              byPerson[person].months[mKey].details.push({ client: client.name, role, amount, type: 'expected' });
            }
          }
        });
      });

      // For clients without schedule (Sequra/Transferencia) with unpaid commissions
      if (!payment_schedule.length) {
        const cash = Number(client.cash) || 0;
        roles.forEach(role => {
          const total = role_commissions[role] || 0;
          if (!total || cash <= 0) return;
          const person = client[ROLES_MAP[role]];
          if (isPlaceholder(person)) return;
          ensurePerson(person);
          const cp = commission_payments['0']?.[role];
          if (!cp?.paid_to_member) {
            // Put in current month
            const curKey = monthKeys[0].key;
            byPerson[person].months[curKey].pending += total;
            byPerson[person].months[curKey].details.push({ client: client.name, role, amount: total, type: 'pending' });
            byPerson[person].totalPending += total;
          }
        });
      }
    });

    // Convert to sorted array, only people with data
    const people = Object.entries(byPerson)
      .map(([name, data]) => ({ name, ...data }))
      .filter(p => {
        return p.totalPending > 0 || Object.values(p.months).some(m => m.expected > 0);
      })
      .sort((a, b) => b.totalPending - a.totalPending);

    return { monthKeys, people };
  }, [filtered]);

  const roleColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'owed', label: 'Total', render: v => <span className="text-yellow-400 font-bold">{formatEuro(v)}</span> },
    { key: 'pending', label: 'A Deber', render: v => <span className={`font-bold ${v > 0 ? 'text-red-400' : 'text-neutral-500'}`}>{formatEuro(v)}</span> },
    { key: 'paid', label: 'Pagado', render: v => <span className="text-emerald-400 font-bold">{formatEuro(v)}</span> },
    { key: 'not_yet_generated', label: 'Futuro', render: v => <span className="text-neutral-500">{formatEuro(v)}</span> },
  ];

  if (loadingClients || loadingExpenses) return <div className="text-neutral-500 text-center py-12">Cargando datos...</div>;

  return (
    <div className="space-y-4">
      <FilterBar title="Pagos Equipo" period={period} setPeriod={setPeriod} customDates={customDates} setCustomDates={setCustomDates} periodDisabled={monthYearOn}
        extraFilters={
          <>
            <div className="flex items-center gap-2 pb-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={monthYearOn} onChange={e => handleToggleMonthYear(e.target.checked)} className="accent-yellow-400 w-3.5 h-3.5 cursor-pointer" />
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Mes/Ano</span>
              </label>
            </div>
            {monthYearOn && (
              <>
                <div>
                  <div className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest mb-1">Mes</div>
                  <Select value={filterMonth} onChange={setFilterMonth} options={MONTHS} />
                </div>
                <div>
                  <div className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest mb-1">Ano</div>
                  <Select value={filterYear} onChange={setFilterYear} options={YEARS} />
                </div>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KCard title="Facturado" value={formatEuro(totalRevenue)} />
        <KCard title="Cash" value={formatEuro(totalCash)} />
        <KCard title="A Deber" value={formatEuro(commissions.totalPending)} variant="red" />
        <KCard title="Pagado" value={formatEuro(commissions.totalPaid)} variant="green" />
        <KCard title="Futuro" value={formatEuro(commissions.totalNotYetGenerated)} />
        <KCard title="Neto" value={formatEuro(netRevenue)} />
        <KCard title="Gastos" value={formatEuro(totalExpenses)} />
        <KCard title="Clientes" value={formatNumber(filtered.length)} />
      </div>

      {/* Pagos Mensuales: Este Mes / Proximo Mes */}
      <PagosMensuales monthKeys={calendarData.monthKeys} people={calendarData.people} showOverdue />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarChartCard title="A Deber por Rol" data={chartData} dataKey="amount" color="#FFD700" />
        {timelineData.some(m => m.amount > 0) && (
          <BarChartCard title="Comisiones Esperadas (6 meses)" data={timelineData} dataKey="amount" color="#0D9488" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {traffRows.length > 0 && <ExpandableRoleTable title="Traffickers" rows={traffRows} columns={roleColumns} clientDrillDown={commissions.clientDrillDown?.trafficker} />}
        {procesosRows.length > 0 && <ExpandableRoleTable title="Procesos" rows={procesosRows} columns={roleColumns} clientDrillDown={commissions.clientDrillDown?.procesos} />}
        {setterRows.length > 0 && <ExpandableRoleTable title="Setters" rows={setterRows} columns={roleColumns} clientDrillDown={commissions.clientDrillDown?.setter} />}
      </div>

      {summaryRows.length > 0 && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-yellow-400 mb-3">Resumen</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {summaryRows.map(r => (
              <div key={r.name} className="flex flex-col bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300 font-medium">{r.name}</span>
                  <span className={`text-sm font-bold ${r.pending > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatEuro(r.pending)}</span>
                </div>
                {r.future > 0 && <span className="text-[10px] text-neutral-500 mt-0.5">Futuro: {formatEuro(r.future)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
