import { useState, useMemo } from 'react';
import { useCloserKpi } from '../hooks/useCloserKpi';
import { useDateFilter } from '../hooks/useDateFilter';
import { calcCloserKpis } from '../utils/kpi';
import { formatNumber, formatPercent } from '../utils/format';
import { groupData } from '../utils/groupBy';
import { CLOSER_GROUPINGS } from '../config/constants';
import KCard from '../components/common/KCard';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import BarChartCard from '../components/charts/BarChartCard';
import PieChartCard from '../components/charts/PieChartCard';

function sumN(arr, key) { return arr.reduce((s, r) => s + (Number(r[key]) || 0), 0); }

export default function CloserKpiPage() {
  const { data, loading } = useCloserKpi();
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
  } = useDateFilter(data, 'date', 'closers');

  const [grouping, setGrouping] = useState('Closers');

  const kpis = useMemo(() => calcCloserKpis(filtered), [filtered]);
  const prevKpis = useMemo(() => calcCloserKpis(previousFiltered), [previousFiltered]);

  const grouped = useMemo(() => groupData(filtered, grouping, 'date'), [filtered, grouping]);

  // Pie chart: call distribution by closer
  const pieData = useMemo(() => {
    const byCloser = {};
    filtered.forEach(r => {
      const name = r.closer_name || 'Sin Closer';
      byCloser[name] = (byCloser[name] || 0) + (Number(r.live_calls) || 0);
    });
    return Object.entries(byCloser).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Bar chart: reacts to grouping
  const barData = useMemo(() => {
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      calls_scheduled: sumN(items, 'calls_scheduled'),
      live_calls: sumN(items, 'live_calls'),
    }));
  }, [grouped]);

  // Grouped table
  const isGrouped = grouping !== 'Todos';
  const groupedTableData = useMemo(() => {
    if (!isGrouped) return filtered;
    return Object.entries(grouped).map(([name, items]) => {
      const scheduled = sumN(items, 'calls_scheduled');
      const live = sumN(items, 'live_calls');
      const offers = sumN(items, 'offers_made');
      const deposits = sumN(items, 'deposits');
      const closes = sumN(items, 'closes');
      const cancelled = sumN(items, 'calls_cancelled');
      return {
        id: name,
        group_name: name,
        records: items.length,
        calls_scheduled: scheduled,
        calls_cancelled: cancelled,
        live_calls: live,
        offers_made: offers,
        deposits,
        closes,
        show_rate: scheduled > 0 ? ((live / scheduled) * 100).toFixed(1) + '%' : '-',
        close_rate: live > 0 ? ((closes / live) * 100).toFixed(1) + '%' : '-',
      };
    });
  }, [isGrouped, filtered, grouped]);

  const defaultColumns = [
    { key: 'closer_name', label: 'Closer' },
    { key: 'date', label: 'Fecha' },
    { key: 'call_type', label: 'Tipo Llamada' },
    { key: 'calls_scheduled', label: 'Agenda' },
    { key: 'calls_cancelled', label: 'Canceladas' },
    { key: 'live_calls', label: 'En Vivo' },
    { key: 'offers_made', label: 'Ofertas' },
    { key: 'deposits', label: 'Depósitos' },
    { key: 'closes', label: 'Cierres' },
  ];

  const groupedColumns = [
    { key: 'group_name', label: grouping },
    { key: 'records', label: 'Registros' },
    { key: 'calls_scheduled', label: 'Agenda' },
    { key: 'calls_cancelled', label: 'Canceladas' },
    { key: 'live_calls', label: 'En Vivo' },
    { key: 'offers_made', label: 'Ofertas' },
    { key: 'deposits', label: 'Depósitos' },
    { key: 'closes', label: 'Cierres' },
    { key: 'show_rate', label: 'Show Rate' },
    { key: 'close_rate', label: 'Cierre %' },
  ];

  if (loading) {
    return <div className="text-neutral-500 text-center py-12">Cargando datos closer...</div>;
  }

  return (
    <div className="space-y-4">
      <FilterBar
        title="Closer KPI"
        grouping={grouping}
        setGrouping={setGrouping}
        groupOptions={CLOSER_GROUPINGS}
        period={period}
        setPeriod={setPeriod}
        customDates={customDates}
        setCustomDates={setCustomDates}
        comparisonOn={comparisonOn}
        setComparisonOn={setComparisonOn}
        compareDates={compareDates}
        setCompareDates={setCompareDates}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KCard title="Llamadas Agenda" value={formatNumber(kpis.llamadasAgenda)} previous={comparisonOn ? formatNumber(prevKpis.llamadasAgenda) : undefined} />
        <KCard title="Llamadas Hechas" value={formatNumber(kpis.llamadasHechas)} previous={comparisonOn ? formatNumber(prevKpis.llamadasHechas) : undefined} />
        <KCard title="Ofertas" value={formatNumber(kpis.ofertas)} previous={comparisonOn ? formatNumber(prevKpis.ofertas) : undefined} />
        <KCard title="Depósitos" value={formatNumber(kpis.depositos)} previous={comparisonOn ? formatNumber(prevKpis.depositos) : undefined} />
        <KCard title="Cierres" value={formatNumber(kpis.cierres)} previous={comparisonOn ? formatNumber(prevKpis.cierres) : undefined} />
        <KCard title="Canceladas" value={formatNumber(kpis.canceladas)} previous={comparisonOn ? formatNumber(prevKpis.canceladas) : undefined} variant="red" />
        <KCard title="Show Rate %" value={formatPercent(kpis.showRate)} previous={comparisonOn ? formatPercent(prevKpis.showRate) : undefined} />
        <KCard title="Oferta %" value={formatPercent(kpis.ofertaPct)} previous={comparisonOn ? formatPercent(prevKpis.ofertaPct) : undefined} />
        <KCard title="Compromiso %" value={formatPercent(kpis.compromisoPct)} previous={comparisonOn ? formatPercent(prevKpis.compromisoPct) : undefined} />
        <KCard title="Oferta/Cierre %" value={formatPercent(kpis.ofertaCierrePct)} previous={comparisonOn ? formatPercent(prevKpis.ofertaCierrePct) : undefined} />
        <KCard title="Llamada/Cierre %" value={formatPercent(kpis.llamadaCierrePct)} previous={comparisonOn ? formatPercent(prevKpis.llamadaCierrePct) : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard title="Distribución de Llamadas por Closer" data={pieData} />
        <BarChartCard
          title={`Agendadas vs En Vivo por ${grouping}`}
          data={barData}
          bars={[
            { dataKey: 'calls_scheduled', name: 'Agendadas', color: '#FFD700' },
            { dataKey: 'live_calls', name: 'En Vivo', color: '#3B82F6' },
          ]}
        />
      </div>

      <DataTable
        columns={isGrouped ? groupedColumns : defaultColumns}
        data={isGrouped ? groupedTableData : filtered}
      />
    </div>
  );
}
