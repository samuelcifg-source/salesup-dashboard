// parseDate(dateStr) - parse date string to Date object
export function parseDate(d) {
  if (!d) return null;
  if (d instanceof Date) return d;
  // Handle DD/MM/YYYY format
  if (typeof d === 'string' && d.includes('/')) {
    const parts = d.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  return new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
}

// formatDate(date) - format Date to YYYY-MM-DD
export function formatDate(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}

// getDateRange(periodCode) - returns [startDate, endDate] for given period
export function getDateRange(p) {
  const n = new Date();
  const t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const d = (x) => { const r = new Date(t); r.setDate(r.getDate() - x); return r; };

  switch (p) {
    case 'TD': return [t, t];
    case 'YD': return [d(1), d(1)];
    case 'P3': return [d(3), t];
    case 'TW': {
      const r = new Date(t);
      const dow = r.getDay();
      r.setDate(r.getDate() + (dow === 0 ? -6 : 1 - dow));
      return [r, t];
    }
    case 'LW': {
      const e = new Date(t);
      const dow = e.getDay();
      e.setDate(e.getDate() - (dow === 0 ? 0 : dow));
      const s = new Date(e);
      s.setDate(s.getDate() - 6);
      return [s, e];
    }
    case 'L7': return [d(7), t];
    case 'L14': return [d(14), t];
    case 'TM': return [new Date(t.getFullYear(), t.getMonth(), 1), t];
    case 'L30': return [d(30), t];
    case 'LM': return [new Date(t.getFullYear(), t.getMonth() - 1, 1), new Date(t.getFullYear(), t.getMonth(), 0)];
    case 'P3M': return [d(90), t];
    case 'P6M': return [d(180), t];
    case 'TY': return [new Date(t.getFullYear(), 0, 1), t];
    case 'LY': return [new Date(t.getFullYear() - 1, 0, 1), new Date(t.getFullYear() - 1, 11, 31)];
    default: return [new Date(2020, 0, 1), t];
  }
}

// getPreviousRange([start, end]) - calculates equivalent previous period
export function getPreviousRange([s, e]) {
  const df = e - s;
  const pe = new Date(s.getTime() - 86400000);
  return [new Date(pe.getTime() - df), pe];
}

// filterByDateRange(array, dateField, [start, end]) - filter array by date range
export function filterByDateRange(a, df, [s, e]) {
  return a.filter(i => {
    const d = parseDate(i[df]);
    return d && d >= s && d <= new Date(e.getTime() + 86400000 - 1);
  });
}

// getDefaultCustomDates() - returns default custom date range (this month vs last month)
export function getDefaultCustomDates() {
  const n = new Date();
  const t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const ms = new Date(t.getFullYear(), t.getMonth(), 1);
  const pms = new Date(t.getFullYear(), t.getMonth() - 1, 1);
  const pme = new Date(t.getFullYear(), t.getMonth(), 0);
  return { s1: formatDate(ms), e1: formatDate(t), s2: formatDate(pms), e2: formatDate(pme) };
}
