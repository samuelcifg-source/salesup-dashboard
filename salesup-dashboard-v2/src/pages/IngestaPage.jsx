import { useState, useMemo, useCallback } from 'react';
import { useClients } from '../hooks/useClients';
import { useCloserKpi } from '../hooks/useCloserKpi';
import { useSetterKpi } from '../hooks/useSetterKpi';
import { useExpenses } from '../hooks/useExpenses';
import { useConfig } from '../context/ConfigContext';
import { formatEuro } from '../utils/format';
import ClientForm from '../components/forms/ClientForm';
import CloserKpiForm from '../components/forms/CloserKpiForm';
import SetterKpiForm from '../components/forms/SetterKpiForm';
import ExpenseForm from '../components/forms/ExpenseForm';
import DataTable from '../components/common/DataTable';

const SUB_TABS = [
  { id: 'clientes', label: 'Clientes' },
  { id: 'closer_kpi', label: 'Closer KPI' },
  { id: 'setter_kpi', label: 'Setter KPI' },
  { id: 'gastos', label: 'Gastos' },
];

// Default range: últimos 30 días
const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export default function IngestaPage() {
  const [activeSubTab, setActiveSubTab] = useState('clientes');
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState(null);
  const [expenseRange, setExpenseRange] = useState({ from: daysAgo(30), to: today() });

  const { config } = useConfig();
  const { data: clients, insert: insertClient, update: updateClient, remove: removeClient } = useClients();
  const { data: closerKpiData, insert: insertCloserKpi, update: updateCloserKpi, remove: removeCloserKpi } = useCloserKpi();
  const { data: setterKpiData, insert: insertSetterKpi, update: updateSetterKpi, remove: removeSetterKpi } = useSetterKpi();
  const { data: expenses, insert: insertExpense, update: updateExpense, remove: removeExpense } = useExpenses();

  const showMessage = useCallback((text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleSubmit = useCallback(async (table, insertFn, updateFn, data) => {
    try {
      if (editData?.id) {
        const { error } = await updateFn(editData.id, data);
        if (error) throw error;
        showMessage('Registro actualizado correctamente');
      } else {
        const { error } = await insertFn(data);
        if (error) throw error;
        showMessage('Registro creado correctamente');
      }
      setEditData(null);
    } catch (err) {
      showMessage('Error: ' + (err.message || 'No se pudo guardar'), 'error');
    }
  }, [editData, showMessage]);

  const handleEdit = useCallback((row) => {
    setEditData(row);
  }, []);

  const handleDelete = useCallback(async (removeFn, row) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      const { error } = await removeFn(row.id);
      if (error) throw error;
      showMessage('Registro eliminado');
    } catch (err) {
      showMessage('Error al eliminar: ' + (err.message || ''), 'error');
    }
  }, [showMessage]);

  // Column definitions per sub-tab
  const clientColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'country', label: 'País' },
    { key: 'start_date', label: 'Inicio' },
    { key: 'end_date', label: 'Fin' },
    { key: 'closer', label: 'Closer' },
    { key: 'setter', label: 'Setter' },
    { key: 'source', label: 'Fuente' },
    { key: 'offer', label: 'Oferta' },
    { key: 'payment_type', label: 'Tipo Pago' },
    { key: 'revenue', label: 'Ingreso', render: (v) => formatEuro(v) },
    { key: 'cash', label: 'Cobrado', render: (v) => formatEuro(v) },
  ];

  const closerColumns = [
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

  const setterColumns = [
    { key: 'embudo', label: 'Embudo', render: (v) => v || 'formulario' },
    { key: 'setter_name', label: 'Setter' },
    { key: 'date', label: 'Fecha' },
    { key: 'total_calls', label: 'Total' },
    { key: 'answered', label: 'Contestaron' },
    { key: 'not_answered', label: 'No Contest.' },
    { key: 'not_qualified', label: 'No Cualifica' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'proposals', label: 'Propuestas' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'follow_ups', label: 'Seguimiento' },
  ];

  const expenseColumns = [
    { key: 'description', label: 'Descripción' },
    { key: 'category', label: 'Categoría' },
    { key: 'subcategory', label: 'Sub-tipo', render: (v) => v || '—' },
    { key: 'amount', label: 'Monto', render: (v) => formatEuro(v) },
    { key: 'date', label: 'Pagado' },
    { key: 'period', label: 'Período', render: (_, row) =>
        (row.period_start && row.period_end)
          ? `${row.period_start} → ${row.period_end}`
          : '—'
    },
    { key: 'recurring', label: 'Recurrente', render: (v) => v ? 'Sí' : 'No' },
  ];

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter((e) => {
      if (!e.date) return false;
      return e.date >= expenseRange.from && e.date <= expenseRange.to;
    });
  }, [expenses, expenseRange]);

  const expenseTotal = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [filteredExpenses]
  );

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex gap-1 bg-neutral-900/50 border border-neutral-800 rounded-xl p-1">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id); setEditData(null); }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSubTab === tab.id
                ? 'bg-yellow-400 text-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          message.type === 'error'
            ? 'bg-red-950/50 border border-red-800 text-red-400'
            : 'bg-emerald-950/50 border border-emerald-800 text-emerald-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form + Table for each sub-tab */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        {activeSubTab === 'clientes' && (
          <>
            <h3 className="text-sm font-bold text-yellow-400 mb-4">
              {editData ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            <ClientForm
              onSubmit={(data) => handleSubmit('clients', insertClient, updateClient, data)}
              initialData={editData}
              config={config}
            />
          </>
        )}

        {activeSubTab === 'closer_kpi' && (
          <>
            <h3 className="text-sm font-bold text-yellow-400 mb-4">
              {editData ? 'Editar Closer KPI' : 'Nuevo Closer KPI'}
            </h3>
            <CloserKpiForm
              onSubmit={(data) => handleSubmit('closer_kpi', insertCloserKpi, updateCloserKpi, data)}
              initialData={editData}
              config={config}
            />
          </>
        )}

        {activeSubTab === 'setter_kpi' && (
          <>
            <h3 className="text-sm font-bold text-yellow-400 mb-4">
              {editData ? 'Editar Setter KPI' : 'Nuevo Setter KPI'}
            </h3>
            <SetterKpiForm
              onSubmit={(data) => handleSubmit('setter_kpi', insertSetterKpi, updateSetterKpi, data)}
              initialData={editData}
              config={config}
            />
          </>
        )}

        {activeSubTab === 'gastos' && (
          <>
            <h3 className="text-sm font-bold text-yellow-400 mb-4">
              {editData ? 'Editar Gasto' : 'Nuevo Gasto'}
            </h3>
            <ExpenseForm
              onSubmit={(data) => handleSubmit('expenses', insertExpense, updateExpense, data)}
              initialData={editData}
              config={config}
            />
          </>
        )}
      </div>

      {/* Data Tables */}
      {activeSubTab === 'clientes' && (
        <DataTable
          columns={clientColumns}
          data={clients}
          onEdit={handleEdit}
          onDelete={(row) => handleDelete(removeClient, row)}
        />
      )}

      {activeSubTab === 'closer_kpi' && (
        <DataTable
          columns={closerColumns}
          data={closerKpiData}
          onEdit={handleEdit}
          onDelete={(row) => handleDelete(removeCloserKpi, row)}
        />
      )}

      {activeSubTab === 'setter_kpi' && (
        <DataTable
          columns={setterColumns}
          data={setterKpiData}
          onEdit={handleEdit}
          onDelete={(row) => handleDelete(removeSetterKpi, row)}
        />
      )}

      {activeSubTab === 'gastos' && (
        <>
          <div className="flex flex-wrap items-center gap-3 bg-neutral-900/50 border border-neutral-800 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Desde</label>
              <input
                type="date"
                value={expenseRange.from}
                onChange={(e) => setExpenseRange((r) => ({ ...r, from: e.target.value }))}
                className="bg-black text-white border border-neutral-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Hasta</label>
              <input
                type="date"
                value={expenseRange.to}
                onChange={(e) => setExpenseRange((r) => ({ ...r, to: e.target.value }))}
                className="bg-black text-white border border-neutral-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="ml-auto text-sm">
              <span className="text-neutral-400">Total rango:</span>{' '}
              <span className="font-bold text-yellow-400">{formatEuro(expenseTotal)}</span>
              <span className="text-neutral-500 text-xs ml-2">({filteredExpenses.length} reg.)</span>
            </div>
          </div>
          <DataTable
            columns={expenseColumns}
            data={filteredExpenses}
            onEdit={handleEdit}
            onDelete={(row) => handleDelete(removeExpense, row)}
          />
        </>
      )}
    </div>
  );
}
