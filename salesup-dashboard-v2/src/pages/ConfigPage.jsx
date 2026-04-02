import { useState, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';

const LIST_SECTIONS = [
  { key: 'closers', label: 'Closers' },
  { key: 'setters', label: 'Setters' },
  { key: 'traffickers', label: 'Traffickers' },
  { key: 'process_managers', label: 'Process Managers' },
  { key: 'offers', label: 'Ofertas' },
  { key: 'sources', label: 'Fuentes' },
  { key: 'deals', label: 'Tipos de Deal' },
  { key: 'call_types', label: 'Tipos de Llamada' },
  { key: 'payment_methods', label: 'Métodos de Pago' },
  { key: 'payment_types', label: 'Tipos de Pago' },
];

function TagListSection({ label, items, onAdd, onRemove }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const val = input.trim();
    if (val && !items.includes(val)) {
      onAdd(val);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3">
      <div className="text-sm font-bold text-yellow-400">{label}</div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-xs text-neutral-300"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="text-red-400 hover:text-red-300 font-bold text-sm leading-none"
            >
              x
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-neutral-600">Sin elementos</span>
        )}
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nuevo elemento..."
          className="flex-1 bg-black text-white border border-neutral-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-neutral-600"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1.5 bg-yellow-400 text-black rounded-md text-sm font-bold hover:bg-yellow-300 transition-colors"
        >
          Anadir
        </button>
      </div>
    </div>
  );
}

export default function ConfigPage() {
  const { config, updateConfig, loading } = useConfig();

  const handleAddItem = useCallback(async (key, item) => {
    const current = config[key] || [];
    await updateConfig(key, [...current, item]);
  }, [config, updateConfig]);

  const handleRemoveItem = useCallback(async (key, item) => {
    const current = config[key] || [];
    await updateConfig(key, current.filter(i => i !== item));
  }, [config, updateConfig]);

  const handleCommissionChange = useCallback(async (field, value) => {
    const commissions = { ...config.commissions };
    if (field === 'closer') {
      commissions.closer = Number(value) / 100;
    } else if (field.startsWith('trafficker.')) {
      const subField = field.split('.')[1];
      commissions.trafficker = { ...commissions.trafficker, [subField]: Number(value) };
    } else if (field.startsWith('procesos.')) {
      const subField = field.split('.')[1];
      commissions.procesos = { ...commissions.procesos, [subField]: Number(value) };
    }
    await updateConfig('commissions', commissions);
  }, [config, updateConfig]);

  const handleBusinessNameChange = useCallback(async (value) => {
    await updateConfig('business_name', value);
  }, [updateConfig]);

  if (loading) {
    return <div className="text-neutral-500 text-center py-12">Cargando configuracion...</div>;
  }

  const comm = config.commissions || {};
  const traffConfig = comm.trafficker || { threshold: 4000, flat: 400, percentage: 0.10 };
  const procConfig = comm.procesos || { threshold: 4000, flat: 400, percentage: 0.10 };
  const setterTiers = comm.setter_tiers || [];

  const labelClass = 'text-[10px] text-yellow-400 font-bold uppercase tracking-widest mb-1 block';
  const inputClass = 'w-full bg-black text-white border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors';

  return (
    <div className="space-y-4">
      {/* Business Name */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
        <div className="text-sm font-bold text-yellow-400 mb-3">Nombre del Negocio</div>
        <input
          type="text"
          value={config.business_name || ''}
          onChange={e => handleBusinessNameChange(e.target.value)}
          className={inputClass}
          placeholder="Nombre del negocio"
        />
      </div>

      {/* Editable Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIST_SECTIONS.map(section => (
          <TagListSection
            key={section.key}
            label={section.label}
            items={config[section.key] || []}
            onAdd={(item) => handleAddItem(section.key, item)}
            onRemove={(item) => handleRemoveItem(section.key, item)}
          />
        ))}
      </div>

      {/* Commission Config */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-5">
        <div className="text-sm font-bold text-yellow-400">Configuracion de Comisiones</div>

        {/* Closer Rate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Closer Rate (%)</label>
            <input
              type="number"
              value={(comm.closer || 0) * 100}
              onChange={e => handleCommissionChange('closer', e.target.value)}
              min={0}
              max={100}
              step={0.5}
              className={inputClass}
            />
          </div>
        </div>

        {/* Setter Tiers (read-only) */}
        <div>
          <div className={labelClass}>Setter Tiers (solo lectura)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {setterTiers.map((tier, i) => (
              <div
                key={i}
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-center"
              >
                <div className="text-xs text-neutral-400">
                  {tier.min}-{tier.max >= 999 ? '+' : tier.max} ventas
                </div>
                <div className="text-lg font-bold text-yellow-400">
                  {(tier.rate * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trafficker Config */}
        <div>
          <div className={labelClass}>Trafficker</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 block">Threshold</label>
              <input
                type="number"
                value={traffConfig.threshold}
                onChange={e => handleCommissionChange('trafficker.threshold', e.target.value)}
                min={0}
                step={100}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 block">Flat</label>
              <input
                type="number"
                value={traffConfig.flat}
                onChange={e => handleCommissionChange('trafficker.flat', e.target.value)}
                min={0}
                step={50}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 block">Percentage (%)</label>
              <input
                type="number"
                value={traffConfig.percentage * 100}
                onChange={e => handleCommissionChange('trafficker.percentage', Number(e.target.value) / 100)}
                min={0}
                max={100}
                step={0.5}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Procesos Config */}
        <div>
          <div className={labelClass}>Procesos</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 block">Threshold</label>
              <input
                type="number"
                value={procConfig.threshold}
                onChange={e => handleCommissionChange('procesos.threshold', e.target.value)}
                min={0}
                step={100}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 block">Flat</label>
              <input
                type="number"
                value={procConfig.flat}
                onChange={e => handleCommissionChange('procesos.flat', e.target.value)}
                min={0}
                step={50}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1 block">Percentage (%)</label>
              <input
                type="number"
                value={procConfig.percentage * 100}
                onChange={e => handleCommissionChange('procesos.percentage', Number(e.target.value) / 100)}
                min={0}
                max={100}
                step={0.5}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
