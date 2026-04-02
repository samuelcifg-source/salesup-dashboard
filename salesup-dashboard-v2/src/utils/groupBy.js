const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function groupByField(data, field) {
  const groups = {};
  data.forEach(item => {
    const key = item[field] || 'Sin asignar';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export function groupByMonth(data, dateField) {
  const groups = {};
  data.forEach(item => {
    const d = item[dateField];
    if (!d) return;
    const date = new Date(d);
    const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[sortKey]) groups[sortKey] = { label, items: [] };
    groups[sortKey].items.push(item);
  });
  const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(sorted.map(([, { label, items }]) => [label, items]));
}

export function groupByDate(data, dateField) {
  const groups = {};
  data.forEach(item => {
    const d = item[dateField];
    if (!d) return;
    const key = String(d).slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)));
}

export function groupData(data, grouping, dateField = 'start_date') {
  switch (grouping) {
    case 'Todos': return { Todos: data };
    case 'Mes/A\u00F1o': return groupByMonth(data, dateField);
    case 'Closers': return groupByField(data, data[0]?.closer_name !== undefined ? 'closer_name' : 'closer');
    case 'Setters': return groupByField(data, data[0]?.setter_name !== undefined ? 'setter_name' : 'setter');
    case 'Fuentes': return groupByField(data, 'source');
    case 'Ofertas': return groupByField(data, 'offer');
    case 'Pa\u00EDses': return groupByField(data, 'country');
    case 'M\u00E9todo Pago': return groupByField(data, 'payment_type');
    case 'Fechas': return groupByDate(data, dateField);
    default: return { Todos: data };
  }
}
