import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

const ConfigContext = createContext(null);

const DEFAULTS = {
  business_name: 'SALESUP',
  closers: ['Pablo', 'No Closer'],
  setters: ['No Setter', 'Sofi', 'Jared', 'Neus'],
  traffickers: ['No Trafficker'],
  process_managers: ['No Process Manager'],
  offers: ['Herbolario', 'Cafetería', 'Panadería', 'Compraventa de coches', 'Ecommerce'],
  sources: ['Setter', 'Organic', 'Youtube', 'Email', 'Facebook', 'Instagram', 'Self set'],
  deals: ['Pago Completo', 'Sequra', 'Depósito', 'Pago Fraccionado', 'Pago Programado', 'Reembolso'],
  call_types: ['Llamada de venta', 'Demo + Cierre (1 Call Close)', 'Demo (2 Call Close)', 'Cierre (2 Call Close)'],
  payment_methods: ['Stripe', 'Transferencia', 'Crypto', 'Efectivo'],
  payment_types: ['Auto-financiado', 'Sequra', 'Transferencia'],
  commissions: {
    closer: 0.15,
    setter_tiers: [
      { min: 1, max: 3, rate: 0.04 },
      { min: 4, max: 5, rate: 0.06 },
      { min: 6, max: 8, rate: 0.08 },
      { min: 9, max: 999, rate: 0.10 },
    ],
    trafficker: { threshold: 4000, flat: 400, percentage: 0.10 },
    procesos: { threshold: 4000, flat: 400, percentage: 0.10 },
  },
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    const { data, error } = await supabase.from('config').select('key, value');
    if (!error && data) {
      const cfg = { ...DEFAULTS };
      data.forEach(row => { cfg[row.key] = row.value; });
      setConfig(cfg);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const updateConfig = useCallback(async (key, value) => {
    const { error } = await supabase.from('config').upsert(
      { key, value },
      { onConflict: 'key' }
    );
    if (!error) {
      setConfig(prev => ({ ...prev, [key]: value }));
    }
    return { error };
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, updateConfig, reload: loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
