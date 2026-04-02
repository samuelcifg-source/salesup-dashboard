import { useState, useMemo, useCallback, useRef } from 'react';
import { useClients } from '../hooks/useClients';
import ClientCard from '../components/clients/ClientCard';
import PaymentAlertPanel from '../components/clients/PaymentAlertPanel';
import { getPaymentAlerts } from '../utils/paymentSchedule';
import { supabase } from '../config/supabase';

const FILTER_OPTIONS = {
  ads: [
    { value: 'all', label: 'Todos' },
    { value: 'on', label: 'Activos' },
    { value: 'off', label: 'Inactivos' },
  ],
  payment: [
    { value: 'all', label: 'Todos' },
    { value: 'Auto-financiado', label: 'Auto-financiado' },
    { value: 'Sequra', label: 'Sequra' },
    { value: 'Transferencia', label: 'Transferencia' },
  ],
  status: [
    { value: 'all', label: 'Todos' },
    { value: 'paid', label: 'Pagado 100%' },
    { value: 'owing', label: 'Debe' },
  ],
  timeline: [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'expired', label: 'Expirado' },
  ],
};

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nombre A-Z' },
  { value: 'name-desc', label: 'Nombre Z-A' },
  { value: 'date-desc', label: 'Mas reciente' },
  { value: 'date-asc', label: 'Mas antiguo' },
  { value: 'revenue-desc', label: 'Mayor ingreso' },
  { value: 'revenue-asc', label: 'Menor ingreso' },
  { value: 'debt-desc', label: 'Mayor deuda' },
  { value: 'debt-asc', label: 'Menor deuda' },
];

function FilterChip({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">{label}</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
              value === opt.value ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50' : 'text-neutral-500 border-neutral-700 hover:border-neutral-500'
            }`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ClientControlPage() {
  const { data: clients, loading, refresh } = useClients();
  const [search, setSearch] = useState('');
  const [adsFilter, setAdsFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [forceOpenId, setForceOpenId] = useState(null);
  const clientRefs = useRef({});

  const alerts = useMemo(() => getPaymentAlerts(clients), [clients]);

  const handleAlertClick = useCallback((clientId) => {
    setForceOpenId(clientId);
    setTimeout(() => {
      clientRefs.current[clientId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setForceOpenId(null), 500);
    }, 50);
  }, []);

  const filteredClients = useMemo(() => {
    const now = new Date();
    let result = clients;

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(c => (c.name || '').toLowerCase().includes(term));
    }
    if (adsFilter === 'on') result = result.filter(c => c.ads_active);
    else if (adsFilter === 'off') result = result.filter(c => !c.ads_active);
    if (paymentFilter !== 'all') result = result.filter(c => c.payment_type === paymentFilter);
    if (statusFilter === 'paid') result = result.filter(c => (Number(c.cash) || 0) >= (Number(c.revenue) || 0));
    else if (statusFilter === 'owing') result = result.filter(c => (Number(c.cash) || 0) < (Number(c.revenue) || 0));
    if (timelineFilter !== 'all') {
      result = result.filter(c => {
        const start = new Date(c.start_date);
        const end = c.end_date ? new Date(c.end_date) : new Date(start.getTime() + 180 * 86400000);
        return timelineFilter === 'expired' ? now > end : now <= end;
      });
    }

    const [key, dir] = sortBy.split('-');
    const asc = dir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      if (key === 'name') return asc * (a.name || '').localeCompare(b.name || '');
      if (key === 'date') return asc * (new Date(a.start_date) - new Date(b.start_date));
      if (key === 'revenue') return asc * ((Number(a.revenue) || 0) - (Number(b.revenue) || 0));
      if (key === 'debt') return asc * (((Number(a.revenue) || 0) - (Number(a.cash) || 0)) - ((Number(b.revenue) || 0) - (Number(b.cash) || 0)));
      return 0;
    });
    return result;
  }, [clients, search, adsFilter, paymentFilter, statusFilter, timelineFilter, sortBy]);

  const onUpdatePaymentType = useCallback(async (id, payment_type) => {
    await supabase.from('clients').update({ payment_type }).eq('id', id);
    refresh();
  }, [refresh]);

  if (loading) return <div className="text-neutral-500 text-center py-12">Cargando clientes...</div>;

  const activeFilters = [adsFilter, paymentFilter, statusFilter, timelineFilter].filter(f => f !== 'all').length;

  return (
    <div className="space-y-4">
      <PaymentAlertPanel alerts={alerts} onAlertClick={handleAlertClick} />

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3">
        <div className="flex gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente por nombre..."
            className="flex-1 bg-black text-white border border-neutral-700 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-neutral-600" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-black text-white border border-neutral-700 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500 cursor-pointer">
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <FilterChip label="Anuncios" options={FILTER_OPTIONS.ads} value={adsFilter} onChange={setAdsFilter} />
          <FilterChip label="Pago" options={FILTER_OPTIONS.payment} value={paymentFilter} onChange={setPaymentFilter} />
          <FilterChip label="Estado" options={FILTER_OPTIONS.status} value={statusFilter} onChange={setStatusFilter} />
          <FilterChip label="Servicio" options={FILTER_OPTIONS.timeline} value={timelineFilter} onChange={setTimelineFilter} />
          {activeFilters > 0 && (
            <button onClick={() => { setAdsFilter('all'); setPaymentFilter('all'); setStatusFilter('all'); setTimelineFilter('all'); }}
              className="text-[11px] text-red-400 hover:text-red-300 font-bold px-2 py-1">
              Limpiar filtros ({activeFilters})
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-neutral-500 px-1">
        {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
        {activeFilters > 0 && ` (${activeFilters} filtro${activeFilters !== 1 ? 's' : ''} activo${activeFilters !== 1 ? 's' : ''})`}
      </div>

      <div className="flex flex-col gap-2">
        {filteredClients.length === 0 ? (
          <div className="text-center text-neutral-600 py-12">No se encontraron clientes</div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} ref={el => clientRefs.current[client.id] = el}>
              <ClientCard client={client} onUpdatePaymentType={onUpdatePaymentType} forceOpen={forceOpenId === client.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
