import { useState, useMemo } from 'react';
import { useClients } from '../hooks/useClients';
import { useClientRolePayments } from '../hooks/useClientRolePayments';
import { useDateFilter } from '../hooks/useDateFilter';
import { useCommissions } from '../hooks/useCommissions';
import { calcClientKpis } from '../utils/kpi';
import { formatNumber, formatPercent, formatEuro, sumField } from '../utils/format';
import { groupData } from '../utils/groupBy';
import { CLIENT_GROUPINGS } from '../config/constants';
import KCard from '../components/common/KCard';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import BarChartCard from '../components/charts/BarChartCard';

export default function ClientesPage() {
  const { data: clients, loading } = useClients();
  const { data: rolePayments, loading: loadingRolePayments } = useClientRolePayments();
  const {
    filtered,
    previousFiltered,
    period,
    setPeriod,
    customDates,
    setCustomDates,
    comparisonOn,
    setComparisonOn,
    compareDates,
    setCompareDates,
  } = useDateFilter(clients, 'start_date', 'clientes');

  const [grouping, setGrouping] = useState('Todos');

  const kpis = useMemo(() => calcClientKpis(filtered), [filtered]);
  const prevKpis = useMemo(() => calcClientKpis(previousFiltered), [previousFiltered]);

  // Deduplicate rolePayments per client_id+role (keep latest by created_at)
  const filteredRolePayments = useMemo(() => {
    const ids = new Set(filtered.map(c => c.id));
    const inPeriod = (rolePayments || []).filter(rp => ids.has(rp.client_id));
    const latest = {};
    inPeriod.forEach(rp => {
      const key = `${rp.client_id}|${rp.role}`;
      if (!latest[key] || new Date(rp.created_at) > new Date(latest[key].created_at)) {
        latest[key] = rp;
      }
    });
    return Object.values(latest);
  }, [filtered, rolePayments]);

  const prevFilteredRolePayments = useMemo(() => {
    const ids = new Set(previousFiltered.map(c => c.id));
    const inPeriod = (rolePayments || []).filter(rp => ids.has(rp.client_id));
    const latest = {};
    inPeriod.forEach(rp => {
      const key = `${rp.client_id}|${rp.role}`;
      if (!latest[key] || new Date(rp.created_at) > new Date(latest[key].created_at)) {
        latest[key] = rp;
      }
    });
    return Object.values(latest);
  }, [previousFiltered, rolePayments]);

  const commissions = useCommissions(filtered, filteredRolePayments);
  const prevCommissions = useCommissions(previousFiltered, prevFilteredRolePayments);

  const grouped = useMemo(() => groupData(filtered, grouping, 'start_date'), [filtered, grouping]);

  const chartData = useMemo(() => {
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      revenue: sumField(items, 'revenue'),
      cash: sumField(items, 'cash'),
      count: items.length,
    }));
  }, [grouped]);

  const isGrouped = grouping !== 'Todos';

  const groupedTableData = useMemo(() => {
    if (!isGrouped) return filtered;
    return Object.entries(grouped).map(([name, items]) => ({
      id: name,
      group_name: name,
      count: items.length,
      revenue: sumField(items, 'revenue'),
      cash: sumField(items, 'cash'),
      cobrado_pct: sumField(items, 'revenue') > 0 ? (sumField(items, 'cash') / sumField(items, 'revenue')) * 100 : 0,
    }));
  }, [isGrouped, filtered, grouped]);

  const defaultColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'country', label: 'País' },
    { key: 'start_date', label: 'Fecha Inicio' },
    { key: 'closer', label: 'Closer' },
    { key: 'setter', label: 'Setter' },
    { key: 'source', label: 'Fuente' },
    { key: 'offer', label: 'Oferta' },
    { key: 'payment_type', label: 'Tipo Pago' },
    { key: 'revenue', label: 'Ingreso', render: (v) => formatEuro(v) },
    { key: 'cash', label: 'Cobrado', render: (v) => formatEuro(v) },
  ];

  const groupedColumns = [
    { key: 'group_name', label: grouping },
    { key: 'count', label: 'Clientes' },
    { key: 'revenue', label: 'Ingresos', render: (v) => formatEuro(v) },
    { key: 'cash', label: 'Cobrado', render: (v) => formatEuro(v) },
    { key: 'cobrado_pct', label: 'Cobrado %', render: (v) => formatPercent(v / 100) },
  ];

  if (loading || loadingRolePayments) {
    return <div className="text-neutral-500 text-center py-12">Cargando clientes...</div>;
  }

  return (
    <div className="space-y-4">
      <FilterBar
        title="Clientes"
        grouping={grouping}
        setGrouping={setGrouping}
        groupOptions={CLIENT_GROUPINGS}
        period={period}
        setPeriod={setPeriod}
        customDates={customDates}
        setCustomDates={setCustomDates}
        comparisonOn={comparisonOn}
        setComparisonOn={setComparisonOn}
        compareDates={compareDates}
        setCompareDates={setCompareDates}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KCard title="Ventas" value={formatNumber(kpis.ventas)} previous={comparisonOn ? formatNumber(prevKpis.ventas) : undefined} />
        <KCard title="Cobrado %" value={formatPercent(kpis.cobradoPct)} previous={comparisonOn ? formatPercent(prevKpis.cobradoPct) : undefined} />
        <KCard title="Hotmart" subtitle="8.5%" value={formatEuro(kpis.hotmart)} previous={comparisonOn ? formatEuro(prevKpis.hotmart) : undefined} variant="red" />
        <KCard title="Ingresos Totales" subtitle="- Hotmart" value={formatEuro(kpis.ingresosTotales)} previous={comparisonOn ? formatEuro(prevKpis.ingresosTotales) : undefined} />
        <KCard title="Reembolsos" value={formatEuro(kpis.reembolsos)} previous={comparisonOn ? formatEuro(prevKpis.reembolsos) : undefined} variant="red" />
        <KCard title="Setter %" subtitle="con setter" value={formatPercent(kpis.setterPct)} previous={comparisonOn ? formatPercent(prevKpis.setterPct) : undefined} />
        <KCard title="PIF %" subtitle="Pago Íntegro" value={formatPercent(kpis.pifPct)} previous={comparisonOn ? formatPercent(prevKpis.pifPct) : undefined} />
        <KCard title="Cobro Medio" value={formatEuro(kpis.cobroMedio)} previous={comparisonOn ? formatEuro(prevKpis.cobroMedio) : undefined} />
        <KCard title="Total Cobrado" value={formatEuro(kpis.totalCobrado)} previous={comparisonOn ? formatEuro(prevKpis.totalCobrado) : undefined} variant="green" />
        <KCard title="Com. Reps" subtitle="todos roles" value={formatEuro(commissions.totalOwed)} previous={comparisonOn ? formatEuro(prevCommissions.totalOwed) : undefined} />
      </div>

      <BarChartCard
        title={`Ingresos por ${grouping}`}
        data={chartData}
        bars={[
          { dataKey: 'revenue', name: 'Ingresos', color: '#FFD700' },
          { dataKey: 'cash', name: 'Cobrado', color: '#22C55E' },
        ]}
      />

      <DataTable
        columns={isGrouped ? groupedColumns : defaultColumns}
        data={isGrouped ? groupedTableData : filtered}
      />
    </div>
  );
}
