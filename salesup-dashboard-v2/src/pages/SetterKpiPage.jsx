import { useState, useMemo } from 'react';
import { useSetterKpi } from '../hooks/useSetterKpi';
import { useDateFilter } from '../hooks/useDateFilter';
import { calcSetterKpis } from '../utils/kpi';
import { formatNumber, formatPercent } from '../utils/format';
import { groupData } from '../utils/groupBy';
import { SETTER_GROUPINGS } from '../config/constants';
import KCard from '../components/common/KCard';
import FilterBar from '../components/common/FilterBar';
import DataTable from '../components/common/DataTable';
import BarChartCard from '../components/charts/BarChartCard';
import PieChartCard from '../components/charts/PieChartCard';

function sumN(arr, key) { return arr.reduce((s, r) => s + (Number(r[key]) || 0), 0); }

export default function SetterKpiPage() {
  const { data, loading } = useSetterKpi();
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
  } = useDateFilter(data, 'date', 'setters');

  const [grouping, setGrouping] = useState('Setters');

  const kpis = useMemo(() => calcSetterKpis(filtered), [filtered]);
  const prevKpis = useMemo(() => calcSetterKpis(previousFiltered), [previousFiltered]);

  const grouped = useMemo(() => groupData(filtered, grouping, 'date'), [filtered, grouping]);

  // Pie chart: total calls distribution by setter
  const pieData = useMemo(() => {
    const bySetter = {};
    filtered.forEach(r => {
      const name = r.setter_name || 'Sin Setter';
      bySetter[name] = (bySetter[name] || 0) + (Number(r.total_calls) || 0);
    });
    return Object.entries(bySetter).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Bar chart: reacts to grouping
  const barData = useMemo(() => {
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      proposals: sumN(items, 'proposals'),
      scheduled: sumN(items, 'scheduled'),
    }));
  }, [grouped]);

  // Grouped table
  const isGrouped = grouping !== 'Todos';
  const groupedTableData = useMemo(() => {
    if (!isGrouped) return filtered;
    return Object.entries(grouped).map(([name, items]) => {
      const total = sumN(items, 'total_calls');
      const answered = sumN(items, 'answered');
      const notAnswered = sumN(items, 'not_answered');
      const notQualified = sumN(items, 'not_qualified');
      const whatsapp = sumN(items, 'whatsapp');
      const proposals = sumN(items, 'proposals');
      const scheduled = sumN(items, 'scheduled');
      const followUps = sumN(items, 'follow_ups');
      return {
        id: name,
        group_name: name,
        records: items.length,
        total_calls: total,
        answered,
        not_answered: notAnswered,
        not_qualified: notQualified,
        whatsapp,
        proposals,
        scheduled,
        follow_ups: followUps,
        response_rate: total > 0 ? ((answered / total) * 100).toFixed(1) + '%' : '-',
        agenda_rate: answered > 0 ? ((scheduled / answered) * 100).toFixed(1) + '%' : '-',
      };
    });
  }, [isGrouped, filtered, grouped]);

  const defaultColumns = [
    { key: 'setter_name', label: 'Setter' },
    { key: 'date', label: 'Fecha' },
    { key: 'total_calls', label: 'Total Llamadas' },
    { key: 'answered', label: 'Contestaron' },
    { key: 'not_answered', label: 'No Contestaron' },
    { key: 'not_qualified', label: 'No Cualifica' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'proposals', label: 'Propuestas' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'follow_ups', label: 'Seguimiento' },
  ];

  const groupedColumns = [
    { key: 'group_name', label: grouping },
    { key: 'records', label: 'Registros' },
    { key: 'total_calls', label: 'Total' },
    { key: 'answered', label: 'Contestaron' },
    { key: 'not_answered', label: 'No Contest.' },
    { key: 'not_qualified', label: 'No Cualifica' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'proposals', label: 'Propuestas' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'follow_ups', label: 'Seguimiento' },
    { key: 'response_rate', label: 'Resp. %' },
    { key: 'agenda_rate', label: 'Agenda %' },
  ];

  if (loading) {
    return <div className="text-neutral-500 text-center py-12">Cargando datos setter...</div>;
  }

  return (
    <div className="space-y-4">
      <FilterBar
        title="Setter KPI"
        grouping={grouping}
        setGrouping={setGrouping}
        groupOptions={SETTER_GROUPINGS}
        period={period}
        setPeriod={setPeriod}
        customDates={customDates}
        setCustomDates={setCustomDates}
        comparisonOn={comparisonOn}
        setComparisonOn={setComparisonOn}
        compareDates={compareDates}
        setCompareDates={setCompareDates}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KCard title="Total Llamadas" value={formatNumber(kpis.totalLlamadas)} previous={comparisonOn ? formatNumber(prevKpis.totalLlamadas) : undefined} />
        <KCard title="Contestaron" value={formatNumber(kpis.contestaron)} previous={comparisonOn ? formatNumber(prevKpis.contestaron) : undefined} />
        <KCard title="No Contestaron" value={formatNumber(kpis.noContestaron)} previous={comparisonOn ? formatNumber(prevKpis.noContestaron) : undefined} variant="red" />
        <KCard title="No Cualifica" value={formatNumber(kpis.noCualifica)} previous={comparisonOn ? formatNumber(prevKpis.noCualifica) : undefined} variant="red" />
        <KCard title="WhatsApp" value={formatNumber(kpis.whatsapp)} previous={comparisonOn ? formatNumber(prevKpis.whatsapp) : undefined} />
        <KCard title="Propuestas" value={formatNumber(kpis.propuestas)} previous={comparisonOn ? formatNumber(prevKpis.propuestas) : undefined} />
        <KCard title="Agendados" value={formatNumber(kpis.agendados)} previous={comparisonOn ? formatNumber(prevKpis.agendados) : undefined} variant="green" />
        <KCard title="Seguimiento" value={formatNumber(kpis.seguimiento)} previous={comparisonOn ? formatNumber(prevKpis.seguimiento) : undefined} />
        <KCard title="Tasa Respuesta %" value={formatPercent(kpis.tasaRespuesta)} previous={comparisonOn ? formatPercent(prevKpis.tasaRespuesta) : undefined} />
        <KCard title="Tasa Cualificación %" value={formatPercent(kpis.tasaCualificacion)} previous={comparisonOn ? formatPercent(prevKpis.tasaCualificacion) : undefined} />
        <KCard title="Propuesta %" value={formatPercent(kpis.propuestaPct)} previous={comparisonOn ? formatPercent(prevKpis.propuestaPct) : undefined} />
        <KCard title="Agenda %" value={formatPercent(kpis.agendaPct)} previous={comparisonOn ? formatPercent(prevKpis.agendaPct) : undefined} />
        <KCard title="Propuesta→Agenda %" value={formatPercent(kpis.propuestaAgendaPct)} previous={comparisonOn ? formatPercent(prevKpis.propuestaAgendaPct) : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard title="Distribución por Setter" data={pieData} />
        <BarChartCard
          title={`Propuestas vs Agendados por ${grouping}`}
          data={barData}
          bars={[
            { dataKey: 'proposals', name: 'Propuestas', color: '#FFD700' },
            { dataKey: 'scheduled', name: 'Agendados', color: '#22C55E' },
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
