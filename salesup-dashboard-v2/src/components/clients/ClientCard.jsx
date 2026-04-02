import { useState, useEffect, useMemo } from 'react';
import ProgressBar from '../common/ProgressBar';
import { formatEuro } from '../../utils/format';
import { PAYMENT_TYPE_COLORS } from '../../config/constants';
import { supabase } from '../../config/supabase';
import { parseClientData } from '../../utils/parseClientData';
import {
  generatePaymentSchedule,
  getInstallmentStatus,
  calcProportionalCommission,
} from '../../utils/paymentSchedule';

const ROLES = ['setter', 'trafficker', 'procesos'];
const ROLE_FIELD = { setter: 'setter', trafficker: 'trafficker', procesos: 'process_manager' };

export default function ClientCard({ client, onUpdatePaymentType, forceOpen }) {
  const [open, setOpen] = useState(false);
  const revenue = Number(client.revenue) || 0;
  const rawCash = Number(client.cash) || 0;

  // For clients with payment_schedule, cash = sum of paid installments (source of truth)
  const parsedInit = parseClientData(client.installments);
  const hasPlanDePagos = client.payment_type === 'Auto-financiado' && parsedInit.payment_schedule.length > 0;
  const cashFromSchedule = hasPlanDePagos
    ? parsedInit.payment_schedule.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.paid_amount || i.amount || 0), 0)
    : rawCash;
  const cash = hasPlanDePagos ? cashFromSchedule : rawCash;
  const owing = revenue - cash;
  const pct = revenue > 0 ? (cash / revenue) * 100 : 0;

  // Timeline
  const startDate = new Date(client.start_date);
  const endDate = client.end_date ? new Date(client.end_date) : new Date(startDate.getTime() + 180 * 86400000);
  const now = new Date();
  const totalDays = (endDate - startDate) / 86400000;
  const elapsedDays = Math.max(0, Math.min((now - startDate) / 86400000, totalDays));
  const timelinePct = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

  // Month segments for timeline
  const timelineMonths = useMemo(() => {
    const months = [];
    const cursor = new Date(startDate);
    cursor.setDate(1); // Start from first of month
    cursor.setMonth(cursor.getMonth() + 1); // First boundary is next month
    while (cursor < endDate) {
      const daysSinceStart = (cursor - startDate) / 86400000;
      const pct = totalDays > 0 ? (daysSinceStart / totalDays) * 100 : 0;
      if (pct > 0 && pct < 100) {
        months.push({
          pct,
          label: cursor.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
          isCurrent: cursor.getMonth() === now.getMonth() && cursor.getFullYear() === now.getFullYear(),
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  }, [client.start_date, client.end_date]);

  useEffect(() => { if (forceOpen) setOpen(true); }, [forceOpen]);

  // Auto-fix: sync DB cash with schedule if they diverge
  useEffect(() => {
    if (hasPlanDePagos && Math.abs(rawCash - cashFromSchedule) > 0.01) {
      supabase.from('clients').update({ cash: cashFromSchedule }).eq('id', client.id);
    }
  }, [hasPlanDePagos, rawCash, cashFromSchedule, client.id]);

  // ── State from JSONB ──
  const parsed = useMemo(() => parseClientData(client.installments), [client.installments]);
  const [schedule, setSchedule] = useState(parsed.payment_schedule);
  const [roleComm, setRoleComm] = useState(parsed.role_commissions);
  const [commPaid, setCommPaid] = useState(parsed.commission_payments);

  useEffect(() => {
    const p = parseClientData(client.installments);
    setSchedule(p.payment_schedule);
    setRoleComm(p.role_commissions);
    setCommPaid(p.commission_payments);
  }, [client.installments]);

  // Quick setup
  const [numCuotas, setNumCuotas] = useState('');
  const [firstDate, setFirstDate] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [editingInst, setEditingInst] = useState(null); // installment number being edited

  // Get commission for a role in a specific installment (stored override or proportional)
  const getInstComm = (inst, role) => {
    if (inst.role_amounts?.[role] !== undefined) return inst.role_amounts[role];
    return calcProportionalCommission(inst.paid_amount || inst.amount || 0, revenue, roleComm[role] || 0);
  };

  // Role names
  const [roleNames, setRoleNames] = useState({
    setter: client.setter || '',
    trafficker: client.trafficker || '',
    procesos: client.process_manager || '',
  });
  useEffect(() => {
    setRoleNames({ setter: client.setter || '', trafficker: client.trafficker || '', procesos: client.process_manager || '' });
  }, [client.setter, client.trafficker, client.process_manager]);

  // Toggles
  const [adsActive, setAdsActive] = useState(client.ads_active || false);
  const [inactive, setInactive] = useState(client.inactive || false);
  const [extraExpenses, setExtraExpenses] = useState(client.extra_expenses || 0);
  useEffect(() => { setAdsActive(client.ads_active || false); }, [client.ads_active]);
  useEffect(() => { setInactive(client.inactive || false); }, [client.inactive]);
  useEffect(() => { setExtraExpenses(client.extra_expenses || 0); }, [client.extra_expenses]);

  // ── Save helpers ──
  const saveInstallments = async (newSchedule, newRoleComm, newCommPaid) => {
    const s = newSchedule ?? schedule;
    const r = newRoleComm ?? roleComm;
    const c = newCommPaid ?? commPaid;
    await supabase.from('clients').update({
      installments: { payment_schedule: s, role_commissions: r, commission_payments: c },
    }).eq('id', client.id);
  };

  const saveField = async (field, value) => {
    await supabase.from('clients').update({ [field]: value }).eq('id', client.id);
  };

  // ── Actions ──
  const handleGenerate = async () => {
    setGenerateError('');
    const n = Number(numCuotas);
    if (!n || n < 1) { setGenerateError('Pon el numero de cuotas'); return; }
    if (!firstDate) { setGenerateError('Pon la fecha de la primera cuota'); return; }
    const total = revenue;
    if (total <= 0) { setGenerateError('El cliente no tiene revenue'); return; }
    let newSchedule = generatePaymentSchedule(total, n, firstDate);
    if (!newSchedule.length) { setGenerateError('No se pudo generar el plan'); return; }
    // Pre-fill role_amounts on each installment
    newSchedule = prefillRoleAmounts(newSchedule, roleComm);
    setSchedule(newSchedule);
    await saveInstallments(newSchedule, roleComm, commPaid);
  };

  const updateScheduleItem = async (idx, field, value) => {
    const rev = revenue || 1;
    const updated = schedule.map((inst, i) => {
      if (i !== idx) return inst;
      const newInst = { ...inst, [field]: field === 'amount' ? (Number(value) || 0) : value };
      // Recalculate role_amounts when amount changes
      if (field === 'amount' && inst.role_amounts) {
        const newAmt = Number(value) || 0;
        newInst.role_amounts = {};
        ROLES.forEach(r => {
          newInst.role_amounts[r] = calcProportionalCommission(newAmt, rev, roleComm[r] || 0);
        });
      }
      return newInst;
    });
    setSchedule(updated);
    await saveInstallments(updated, roleComm, commPaid);
  };

  const addScheduleItem = async () => {
    const nextNum = schedule.length > 0 ? Math.max(...schedule.map(i => i.number)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    const updated = [...schedule, { number: nextNum, amount: 0, due_date: today, status: 'pending', paid_date: null, paid_amount: 0 }];
    setSchedule(updated);
    await saveInstallments(updated, roleComm, commPaid);
  };

  const removeScheduleItem = async (idx) => {
    const removedNumber = schedule[idx].number;
    const remaining = schedule.filter((_, i) => i !== idx);
    // Remap commission_payments: shift numbers above the removed one down by 1
    const newCP = {};
    remaining.forEach((inst, i) => {
      const oldNum = String(inst.number);
      const newNum = String(i + 1);
      if (commPaid[oldNum]) newCP[newNum] = commPaid[oldNum];
    });
    const updated = remaining.map((inst, i) => ({ ...inst, number: i + 1 }));
    setSchedule(updated);
    setCommPaid(newCP);
    await saveInstallments(updated, roleComm, newCP);
  };

  // Recalculate cash from all paid installments (never sum/subtract incrementally)
  const calcCashFromSchedule = (sched) => sched.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.paid_amount || i.amount || 0), 0);

  const markPaid = async (idx) => {
    const inst = schedule[idx];
    if (!inst || inst.status === 'paid') return;
    const today = new Date().toISOString().split('T')[0];
    const updated = schedule.map((item, i) => i !== idx ? item : { ...item, status: 'paid', paid_date: today, paid_amount: item.amount });
    setSchedule(updated);
    const newCash = calcCashFromSchedule(updated);
    await supabase.from('clients').update({
      cash: newCash,
      installments: { payment_schedule: updated, role_commissions: roleComm, commission_payments: commPaid },
    }).eq('id', client.id);
  };

  const markUnpaid = async (idx) => {
    const inst = schedule[idx];
    if (!inst || inst.status !== 'paid') return;
    const updated = schedule.map((item, i) => i !== idx ? item : { ...item, status: 'pending', paid_date: null, paid_amount: 0 });
    setSchedule(updated);
    const newCP = { ...commPaid };
    delete newCP[String(inst.number)];
    setCommPaid(newCP);
    const newCash = calcCashFromSchedule(updated);
    await supabase.from('clients').update({
      cash: newCash,
      installments: { payment_schedule: updated, role_commissions: roleComm, commission_payments: newCP },
    }).eq('id', client.id);
  };

  const updateInstRoleAmount = async (idx, role, value) => {
    const updated = schedule.map((inst, i) => {
      if (i !== idx) return inst;
      return { ...inst, role_amounts: { ...(inst.role_amounts || {}), [role]: Number(value) || 0 } };
    });
    setSchedule(updated);
    await saveInstallments(updated, roleComm, commPaid);
  };

  // Pre-fill role_amounts on all installments based on proportional split
  const prefillRoleAmounts = (sched, rc) => {
    const rev = revenue || 1;
    return sched.map(inst => ({
      ...inst,
      role_amounts: {
        setter: calcProportionalCommission(inst.amount || 0, rev, rc.setter || 0),
        trafficker: calcProportionalCommission(inst.amount || 0, rev, rc.trafficker || 0),
        procesos: calcProportionalCommission(inst.amount || 0, rev, rc.procesos || 0),
      },
    }));
  };

  const saveRoleName = async (role, value) => {
    setRoleNames(prev => ({ ...prev, [role]: value }));
    await saveField(ROLE_FIELD[role], value);
  };

  const saveRoleCommission = async (role, value) => {
    const newRC = { ...roleComm, [role]: Number(value) || 0 };
    setRoleComm(newRC);
    // Recalculate role_amounts on all installments for this role
    if (hasSchedule) {
      const rev = revenue || 1;
      const newSchedule = schedule.map(inst => ({
        ...inst,
        role_amounts: {
          ...(inst.role_amounts || {}),
          [role]: calcProportionalCommission(
            inst.status === 'paid' ? (inst.paid_amount || inst.amount || 0) : (inst.amount || 0),
            rev, Number(value) || 0
          ),
        },
      }));
      setSchedule(newSchedule);
      await saveInstallments(newSchedule, newRC, commPaid);
    } else {
      await saveInstallments(schedule, newRC, commPaid);
    }
  };

  const toggleCommPaid = async (instNumber, role) => {
    const key = String(instNumber);
    const cur = commPaid[key]?.[role] || {};
    const newVal = !cur.paid_to_member;
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...commPaid,
      [key]: { ...(commPaid[key] || {}), [role]: { paid_to_member: newVal, paid_date: newVal ? today : null } },
    };
    setCommPaid(updated);
    await saveInstallments(schedule, roleComm, updated);
  };

  // For non-autofinanciado: simple paid toggle per role (stored in commission_payments key "0")
  const toggleSimpleRolePaid = async (role) => {
    const cur = commPaid['0']?.[role] || {};
    const newVal = !cur.paid_to_member;
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...commPaid,
      '0': { ...(commPaid['0'] || {}), [role]: { paid_to_member: newVal, paid_date: newVal ? today : null } },
    };
    setCommPaid(updated);
    await saveInstallments(schedule, roleComm, updated);
  };

  // ── Computed commission aggregates ──
  const commAgg = useMemo(() => {
    const result = {};
    ROLES.forEach(role => {
      const total = roleComm[role] || 0;
      let earned = 0, paidToMember = 0;

      if (schedule.length > 0) {
        schedule.forEach(inst => {
          if (inst.status !== 'paid') return;
          const amount = getInstComm(inst, role);
          earned += amount;
          if (commPaid[String(inst.number)]?.[role]?.paid_to_member) paidToMember += amount;
        });
      } else {
        // No schedule (Sequra/Transferencia): full amount if cash > 0
        earned = cash > 0 ? total : 0;
        if (commPaid['0']?.[role]?.paid_to_member) paidToMember = earned;
      }

      result[role] = {
        total,
        earned: Math.round(earned * 100) / 100,
        paidToMember: Math.round(paidToMember * 100) / 100,
        pending: Math.round((earned - paidToMember) * 100) / 100,
      };
    });
    return result;
  }, [schedule, roleComm, commPaid, revenue, cash]);

  const isAutoFin = client.payment_type === 'Auto-financiado';
  const hasSchedule = schedule.length > 0;
  const fmtDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const paymentTypes = ['Auto-financiado', 'Sequra', 'Transferencia'];

  // Schedule totals
  const scheduleTotal = schedule.reduce((s, i) => s + (i.amount || 0), 0);
  const schedulePaid = schedule.filter(i => i.status === 'paid').reduce((s, i) => s + (i.paid_amount || 0), 0);
  const schedulePending = scheduleTotal - schedulePaid;
  const planExceedsRevenue = hasSchedule && scheduleTotal > revenue;

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
      {/* ── Header ── */}
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-800/30 transition-colors">
        <div className="shrink-0 text-base font-extrabold text-white w-[200px] text-left truncate flex items-center gap-2">
          <span className="truncate">{client.name}</span>
          {inactive && <span className="text-[10px] text-red-500 font-bold uppercase shrink-0">INACTIVO</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
            <span>Inicio: {fmtDate(startDate)}</span>
            <span>Fin: {fmtDate(endDate)}</span>
          </div>
          {/* Timeline bar with month segments */}
          <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
            {/* Progress fill */}
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(timelinePct, 100)}%`, background: `linear-gradient(90deg, #22C55E, ${timelinePct > 66 ? '#EF4444' : timelinePct > 33 ? '#FFD700' : '#22C55E'})` }} />
            {/* Month dividers */}
            {timelineMonths.map((m, i) => (
              <div key={i} className="absolute inset-y-0 flex flex-col items-center" style={{ left: `${m.pct}%` }}>
                <div className="w-px h-full bg-neutral-700/80" />
              </div>
            ))}
            {/* Today marker */}
            {timelinePct > 0 && timelinePct < 100 && (
              <div className="absolute top-0 w-2.5 h-3 rounded-sm bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                style={{ left: `${timelinePct}%`, transform: 'translateX(-50%)' }} />
            )}
          </div>
          {/* Month labels */}
          {timelineMonths.length > 0 && (
            <div className="relative w-full h-3 mt-0.5">
              {timelineMonths.map((m, i) => (
                <span key={i} className={`absolute text-[8px] font-bold capitalize ${m.isCurrent ? 'text-yellow-400' : 'text-neutral-600'}`}
                  style={{ left: `${m.pct}%`, transform: 'translateX(-50%)' }}>
                  {m.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2 w-[180px] justify-end">
          {planExceedsRevenue && <span className="text-yellow-500 text-sm" title={`Plan (${formatEuro(scheduleTotal)}) supera el total (${formatEuro(revenue)})`}>&#9888;</span>}
          <span className="text-sm font-bold text-yellow-400">{formatEuro(cash)}</span>
          <span className="text-xs text-neutral-600">/ {formatEuro(revenue)}</span>
        </div>
        <svg className={`w-5 h-5 text-neutral-500 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Expanded ── */}
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-neutral-800">

          {/* ─ Payment type + progress ─ */}
          <div className="flex items-start gap-6 pt-4">
            <div className="flex flex-col gap-2 shrink-0">
              {paymentTypes.map(pt => {
                const active = client.payment_type === pt;
                const color = PAYMENT_TYPE_COLORS[pt] || '#666';
                return (
                  <button key={pt} onClick={() => onUpdatePaymentType(client.id, pt)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${active ? 'text-white border-transparent' : 'text-neutral-500 border-neutral-700 hover:border-neutral-500'}`}
                    style={active ? { backgroundColor: color, boxShadow: `0 0 14px ${color}80` } : {}}>
                    {pt}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 pt-1">
              <ProgressBar value={cash} max={revenue || 1} color={pct >= 50 ? '#22C55E' : '#EF4444'} height={12} />
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-emerald-400 font-bold">Cobrado: {formatEuro(cash)}</span>
                <span><span className="text-neutral-500">Debe:</span> <span className="text-red-400 font-bold">{formatEuro(owing)}</span></span>
                <span><span className="text-neutral-500">Total:</span> <span className="text-yellow-400 font-bold">{formatEuro(revenue)}</span></span>
              </div>
            </div>
          </div>

          {/* ─ Plan de Pagos (solo Auto-financiado) ─ */}
          {isAutoFin && (
            <div className="space-y-3">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-800 pb-1">Plan de Pagos</div>

              {/* Quick setup */}
              {!hasSchedule && (
                <div className="flex items-end gap-3 p-3 rounded-lg border border-dashed border-neutral-700 bg-neutral-800/20">
                  <div>
                    <div className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Cuotas</div>
                    <input type="number" min="1" value={numCuotas} onChange={e => setNumCuotas(e.target.value)} placeholder="6"
                      className="w-16 bg-black text-white border border-neutral-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500" />
                  </div>
                  <div>
                    <div className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Primera fecha</div>
                    <input type="date" value={firstDate} onChange={e => setFirstDate(e.target.value)}
                      className="bg-black text-white border border-neutral-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500" />
                  </div>
                  <div className="text-xs text-neutral-500">
                    Total: <span className="text-yellow-400 font-bold">{formatEuro(revenue)}</span>
                  </div>
                  <button onClick={handleGenerate}
                    className="px-4 py-1.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 rounded text-xs font-bold hover:bg-yellow-400/30 transition-colors">
                    Generar
                  </button>
                  {generateError && <span className="text-[10px] text-red-400 font-bold">{generateError}</span>}
                </div>
              )}

              {/* Installment list */}
              {hasSchedule && (
                <>
                  <div className="space-y-1.5">
                    {schedule.map((inst, idx) => {
                      const status = getInstallmentStatus(inst);
                      const isPaid = status === 'paid';
                      const isOverdue = status === 'overdue';
                      const instCP = commPaid[String(inst.number)] || {};

                      return (
                        <div key={inst.number} className={`flex flex-col rounded-lg border p-2.5 transition-colors ${
                          isPaid ? 'border-emerald-800/30 bg-emerald-950/10' : isOverdue ? 'border-red-800/30 bg-red-950/10' : 'border-neutral-700/50 bg-neutral-800/20'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-neutral-600 w-5">#{inst.number}</span>
                            <input type="number" value={inst.amount || ''} onChange={e => updateScheduleItem(idx, 'amount', e.target.value)} disabled={isPaid}
                              className="w-20 bg-black/50 text-white border border-neutral-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-yellow-500 disabled:opacity-50" />
                            <span className="text-[10px] text-neutral-600">&euro;</span>
                            <input type="date" value={inst.due_date || ''} onChange={e => updateScheduleItem(idx, 'due_date', e.target.value)} disabled={isPaid}
                              className="bg-black/50 text-white border border-neutral-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-yellow-500 disabled:opacity-50" />

                            {/* Status */}
                            {isPaid && <span className="text-[10px] font-bold text-emerald-400">Pagado</span>}
                            {isOverdue && (() => { const d = Math.abs(Math.round((now - new Date(inst.due_date + 'T00:00:00')) / 86400000)); return <span className="text-[10px] font-bold text-red-400 animate-pulse">Vencido {d}d</span>; })()}
                            {status === 'pending' && !isOverdue && (() => { const d = Math.round((new Date(inst.due_date + 'T00:00:00') - now) / 86400000); return <span className="text-[10px] text-neutral-500">en {d}d</span>; })()}

                            <div className="ml-auto flex items-center gap-1.5">
                              {!isPaid ? (
                                <>
                                  <button onClick={() => markPaid(idx)} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">Pagado</button>
                                  <button onClick={() => removeScheduleItem(idx)} className="text-red-400/60 hover:text-red-400 text-xs">x</button>
                                </>
                              ) : (
                                <button onClick={() => markUnpaid(idx)} className="px-2 py-0.5 rounded text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors">Deshacer</button>
                              )}
                            </div>
                          </div>

                          {/* Commission breakdown — always visible, editable */}
                          {(isPaid || ROLES.some(r => roleComm[r])) && (
                            <div className="flex items-center gap-3 mt-1.5 ml-7">
                              {ROLES.map(role => {
                                if (!roleComm[role]) return null;
                                const amount = getInstComm(inst, role);
                                const isEditing = editingInst === inst.number;
                                const paid = instCP[role]?.paid_to_member;

                                if (isEditing) {
                                  return (
                                    <div key={role} className="flex items-center gap-1 text-[10px]">
                                      <span className="capitalize text-neutral-500">{role}:</span>
                                      <input type="number" value={inst.role_amounts?.[role] ?? Math.round(amount * 100) / 100}
                                        onChange={e => updateInstRoleAmount(idx, role, e.target.value)}
                                        className="w-14 bg-black text-yellow-400 font-bold border border-yellow-500/50 rounded px-1 py-0.5 text-[10px] focus:outline-none" />
                                    </div>
                                  );
                                }

                                return (
                                  <button key={role} onClick={isPaid ? () => toggleCommPaid(inst.number, role) : undefined}
                                    className={`flex items-center gap-1 text-[10px] transition-colors ${isPaid ? (paid ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300') : 'text-neutral-600 cursor-default'}`}>
                                    {isPaid && (
                                      <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${paid ? 'bg-emerald-500 border-emerald-400' : 'border-neutral-600'}`}>
                                        {paid && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                      </span>
                                    )}
                                    <span className="capitalize">{role}:</span>
                                    <span className="font-bold">{formatEuro(amount)}</span>
                                  </button>
                                );
                              })}

                              {/* Edit toggle */}
                              <button onClick={() => setEditingInst(editingInst === inst.number ? null : inst.number)}
                                className={`ml-1 text-[10px] transition-colors ${editingInst === inst.number ? 'text-yellow-400' : 'text-neutral-600 hover:text-neutral-400'}`}
                                title="Editar comisiones">
                                {editingInst === inst.number ? 'OK' : '✎'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add + Summary */}
                  <div className="flex items-center justify-between">
                    <button onClick={addScheduleItem} className="text-[10px] text-neutral-500 hover:text-yellow-400 font-bold transition-colors">+ Cuota</button>
                    <div className="flex items-center gap-4 text-[10px]">
                      <span className="text-neutral-500">Plan: <span className={`font-bold ${planExceedsRevenue ? 'text-yellow-500' : 'text-yellow-400'}`}>{formatEuro(scheduleTotal)}</span></span>
                      {planExceedsRevenue && <span className="text-yellow-500 font-bold" title="El plan supera el total del cliente">&#9888; Supera total</span>}
                      <span className="text-neutral-500">Cobrado: <span className="text-emerald-400 font-bold">{formatEuro(schedulePaid)}</span></span>
                      <span className="text-neutral-500">Pendiente: <span className="text-red-400 font-bold">{formatEuro(schedulePending)}</span></span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─ Comisiones Totales ─ */}
          <div className="space-y-1.5">
            <div className="border-b border-neutral-800 pb-1">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Comisiones Totales</div>
              {isAutoFin && hasSchedule && (
                <p className="text-[10px] text-neutral-600 mt-0.5">El total se reparte proporcionalmente entre las {schedule.length} cuotas</p>
              )}
            </div>
            {ROLES.map(role => {
              const simplePaid = commPaid['0']?.[role]?.paid_to_member;
              const showToggle = !isAutoFin || !hasSchedule;

              return (
                <div key={role} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-bold text-neutral-400 capitalize">{role}</span>
                  <input type="text" value={roleNames[role]} onChange={e => saveRoleName(role, e.target.value)} placeholder="—"
                    className="w-24 bg-neutral-800/50 text-neutral-300 border border-neutral-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-yellow-500 placeholder:text-neutral-600" />
                  <input type="number" value={roleComm[role] ?? ''} onChange={e => saveRoleCommission(role, e.target.value)} placeholder="0"
                    className="w-16 bg-black/50 text-yellow-400 font-bold border border-neutral-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-yellow-500" />
                  <span className="text-[10px] text-neutral-600">&euro;</span>

                  {showToggle && (
                    <button onClick={() => toggleSimpleRolePaid(role)}
                      className={`flex items-center gap-1 text-[10px] ml-2 transition-colors ${simplePaid ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'}`}>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${simplePaid ? 'bg-emerald-500 border-emerald-400' : 'border-neutral-600'}`}>
                        {simplePaid && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      {simplePaid ? 'Pagado' : 'Pendiente'}
                    </button>
                  )}

                  {/* For auto-financiado with schedule: show per-cuota amount hint */}
                  {isAutoFin && hasSchedule && roleComm[role] > 0 && (
                    <span className="text-[10px] text-neutral-500 ml-2">
                      = {formatEuro(Math.round((roleComm[role] / schedule.length) * 100) / 100)} x {schedule.length} cuotas
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─ Ajustes ─ */}
          <div className="flex items-center gap-6 pt-2 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 font-bold uppercase">Ads</span>
              <button onClick={() => { const v = !adsActive; setAdsActive(v); saveField('ads_active', v); }}
                className={`relative w-10 h-5 rounded-full transition-colors ${adsActive ? 'bg-emerald-500' : 'bg-neutral-700'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${adsActive ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 font-bold uppercase">Inactivo</span>
              <button onClick={() => { const v = !inactive; setInactive(v); saveField('inactive', v); }}
                className={`relative w-10 h-5 rounded-full transition-colors ${inactive ? 'bg-red-500' : 'bg-neutral-700'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${inactive ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[10px] text-neutral-500 font-bold uppercase">Gastos extra</span>
              <input type="number" value={extraExpenses || ''} onChange={e => { const v = Number(e.target.value) || 0; setExtraExpenses(v); saveField('extra_expenses', v); }} placeholder="0"
                className="w-20 bg-black/50 text-white border border-neutral-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-yellow-500" />
              <span className="text-[10px] text-neutral-600">&euro;</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
