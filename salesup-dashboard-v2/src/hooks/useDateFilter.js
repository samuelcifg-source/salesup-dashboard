import { useState, useMemo, useCallback } from 'react';
import { getDateRange, getPreviousRange, filterByDateRange, getDefaultCustomDates } from '../utils/dates';

function loadFromStorage(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToStorage(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function useDateFilter(data, dateField = 'start_date', storageKey = null) {
  const saved = storageKey ? loadFromStorage(`dateFilter_${storageKey}`) : null;

  const [period, setPeriodRaw] = useState(saved?.period ?? 'ALL');
  const [customDates, setCustomDatesRaw] = useState(saved?.customDates ?? getDefaultCustomDates());
  const [comparisonOn, setComparisonOnRaw] = useState(saved?.comparisonOn ?? false);
  const [compareDates, setCompareDatesRaw] = useState(saved?.compareDates ?? { start: '', end: '' });

  const persist = useCallback((updates) => {
    if (!storageKey) return;
    const current = loadFromStorage(`dateFilter_${storageKey}`) || {};
    saveToStorage(`dateFilter_${storageKey}`, { ...current, ...updates });
  }, [storageKey]);

  const setPeriod = useCallback((v) => { setPeriodRaw(v); persist({ period: v }); }, [persist]);
  const setCustomDates = useCallback((v) => { setCustomDatesRaw(v); persist({ customDates: v }); }, [persist]);
  const setComparisonOn = useCallback((v) => { setComparisonOnRaw(v); persist({ comparisonOn: v }); }, [persist]);
  const setCompareDates = useCallback((v) => { setCompareDatesRaw(v); persist({ compareDates: v }); }, [persist]);

  const filtered = useMemo(() => {
    if (period === 'ALL') return data;
    if (period === 'CUSTOM') {
      const s = new Date(customDates.s1 + 'T00:00:00');
      const e = new Date(customDates.e1 + 'T00:00:00');
      return filterByDateRange(data, dateField, [s, e]);
    }
    return filterByDateRange(data, dateField, getDateRange(period));
  }, [data, period, customDates, dateField]);

  const previousFiltered = useMemo(() => {
    if (!comparisonOn) return [];
    // If custom compare dates are set, use those
    if (compareDates.start && compareDates.end) {
      const s = new Date(compareDates.start + 'T00:00:00');
      const e = new Date(compareDates.end + 'T00:00:00');
      return filterByDateRange(data, dateField, [s, e]);
    }
    // Otherwise fall back to automatic previous period
    if (period === 'ALL') return [];
    if (period === 'CUSTOM') {
      const s = new Date(customDates.s2 + 'T00:00:00');
      const e = new Date(customDates.e2 + 'T00:00:00');
      return filterByDateRange(data, dateField, [s, e]);
    }
    const range = getDateRange(period);
    const prev = getPreviousRange(range);
    return filterByDateRange(data, dateField, prev);
  }, [data, period, comparisonOn, customDates, compareDates, dateField]);

  return {
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
  };
}
