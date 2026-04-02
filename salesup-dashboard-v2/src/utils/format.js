// formatNumber(n, decimals) - formats number with Spanish locale
export function formatNumber(n, d = 0) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
}

// formatPercent(n) - formats ratio as percentage (0.75 -> "75%")
export function formatPercent(n) {
  if (n == null || isNaN(n)) return '0%';
  return (Number(n) * 100).toFixed(2).replace(/\.?0+$/, '') + '%';
}

// formatEuro(n) - formats as EUR currency
export function formatEuro(n) {
  return formatNumber(n, 2) + '\u20AC';
}

// sumField(array, key) - sum values of field key in array
export function sumField(a, k) {
  return a.reduce((s, r) => s + (Number(r[k]) || 0), 0);
}

// parseNumeric(v) - parses any numeric format to number
export function parseNumeric(v) {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  const s = String(v).replace(/[^0-9.,-]/g, '');
  if (s.includes('.') && s.includes(',')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
  return parseFloat(s) || 0;
}

// safeDiv(a, b) - safe division returning 0 if b is 0
export function safeDiv(a, b) {
  return b ? a / b : 0;
}
