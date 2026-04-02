export const CHART_COLORS = [
  "#FFD700",
  "#3B82F6",
  "#22C55E",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#0D9488",
  "#F97316",
];

export const TOOLTIP_STYLE = {
  backgroundColor: "#111",
  border: "1px solid #FFD700",
  borderRadius: "6px",
  color: "#FFD700",
  fontSize: "12px",
};

export const PERIODS = [
  { label: "TODO", value: "ALL" },
  { label: "Hoy", value: "TD" },
  { label: "Ayer", value: "YD" },
  { label: "\u00DAltimos 3 d\u00EDas", value: "P3" },
  { label: "Esta semana", value: "TW" },
  { label: "Semana pasada", value: "LW" },
  { label: "\u00DAltimos 7 d\u00EDas", value: "L7" },
  { label: "\u00DAltimos 14 d\u00EDas", value: "L14" },
  { label: "Este mes", value: "TM" },
  { label: "\u00DAltimos 30 d\u00EDas", value: "L30" },
  { label: "Mes pasado", value: "LM" },
  { label: "\u00DAltimos 3 meses", value: "P3M" },
  { label: "\u00DAltimos 6 meses", value: "P6M" },
  { label: "Este a\u00F1o", value: "TY" },
  { label: "A\u00F1o pasado", value: "LY" },
  { label: "Personalizado", value: "CUSTOM" },
];

export const CLIENT_GROUPINGS = [
  "Todos",
  "Mes/A\u00F1o",
  "Closers",
  "Setters",
  "Fuentes",
  "Ofertas",
  "Pa\u00EDses",
  "M\u00E9todo Pago",
];

export const CLOSER_GROUPINGS = ["Closers", "Mes/A\u00F1o", "Fechas"];

export const SETTER_GROUPINGS = ["Setters", "Mes/A\u00F1o", "Fechas"];

export const PAYMENT_TYPE_COLORS = {
  "Sequra": "#3B82F6",
  "Auto-financiado": "#8B5CF6",
  "Transferencia": "#22C55E",
};

export const TABS = [
  { id: "clientes", label: "Clientes", icon: "\u{1F464}" },
  { id: "closers", label: "Closers", icon: "\u{1F3AF}" },
  { id: "setters", label: "Setters", icon: "\u{1F4DE}" },
  { id: "control-clientes", label: "Control Clientes", icon: "\u2630" },
  { id: "pagos-equipo", label: "Pagos Equipo", icon: "\u20AC" },
  { id: "ingesta", label: "Ingesta", icon: "\u21E7" },
  { id: "config", label: "Config", icon: "\u2699" },
];
