import { sumField, safeDiv } from './format';

// Client KPIs
export function calcClientKpis(clients) {
  const deals = clients.filter(c => c.payment_type !== 'Reembolso');
  const totalRevenue = sumField(clients, 'revenue');
  const totalCash = sumField(clients, 'cash');
  const hotmart = totalRevenue * 0.085;
  const refunds = clients.filter(c => c.payment_type === 'Reembolso').reduce((s, c) => s + (Number(c.cash) || 0), 0);
  const setterCount = clients.filter(c => c.setter && c.setter.trim() && !c.setter.toLowerCase().startsWith('sin ') && !c.setter.toLowerCase().startsWith('no ')).length;
  const pifCount = clients.filter(c => ['Pago Completo', 'Sequra'].includes(c.payment_type)).length;

  return {
    ventas: deals.length,
    cobradoPct: safeDiv(totalCash, totalRevenue),
    hotmart,
    ingresosTotales: totalRevenue - hotmart,
    reembolsos: refunds,
    setterPct: safeDiv(setterCount, clients.length),
    pifPct: safeDiv(pifCount, deals.length),
    cobroMedio: safeDiv(totalCash, deals.length),
    totalCobrado: totalCash,
  };
}

// Closer KPIs
export function calcCloserKpis(records) {
  const callsSched = sumField(records, 'calls_scheduled');
  const callsCanc = sumField(records, 'calls_cancelled');
  const live = sumField(records, 'live_calls');
  const offers = sumField(records, 'offers_made');
  const deps = sumField(records, 'deposits');
  const closes = sumField(records, 'closes');

  return {
    llamadasAgenda: callsSched,
    llamadasHechas: live,
    ofertas: offers,
    depositos: deps,
    cierres: closes,
    canceladas: callsCanc,
    showRate: safeDiv(live, callsSched),
    ofertaPct: safeDiv(offers, live),
    compromisoPct: safeDiv(deps, closes),
    ofertaCierrePct: safeDiv(closes, offers),
    llamadaCierrePct: safeDiv(closes, live),
    cancelPct: safeDiv(callsCanc, callsSched),
  };
}

// Setter KPIs
export function calcSetterKpis(records) {
  const total = sumField(records, 'total_calls');
  const answered = sumField(records, 'answered');
  const notAnswered = sumField(records, 'not_answered');
  const notQualified = sumField(records, 'not_qualified');
  const whatsapp = sumField(records, 'whatsapp');
  const proposals = sumField(records, 'proposals');
  const scheduled = sumField(records, 'scheduled');
  const followUps = sumField(records, 'follow_ups');

  return {
    totalLlamadas: total,
    contestaron: answered,
    noContestaron: notAnswered,
    noCualifica: notQualified,
    whatsapp,
    propuestas: proposals,
    agendados: scheduled,
    seguimiento: followUps,
    tasaRespuesta: safeDiv(answered, total),
    tasaCualificacion: safeDiv(answered - notQualified, answered),
    propuestaPct: safeDiv(proposals, answered),
    agendaPct: safeDiv(scheduled, answered),
    propuestaAgendaPct: safeDiv(scheduled, proposals),
  };
}
