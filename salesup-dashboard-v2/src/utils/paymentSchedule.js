// Payment schedule calculation engine.
// All functions are pure — no side effects, no Supabase calls.

import { parseClientData, hasNewPaymentSystem } from './parseClientData';

const ROLES = ['setter', 'trafficker', 'procesos'];

/**
 * Generate a payment schedule with equal monthly installments.
 * The last installment absorbs rounding differences.
 */
export function generatePaymentSchedule(totalAmount, numPayments, firstDueDate) {
  if (!numPayments || numPayments < 1 || totalAmount <= 0 || !firstDueDate) return [];
  const baseAmount = Math.floor((totalAmount / numPayments) * 100) / 100;
  const schedule = [];
  const date = new Date(firstDueDate + 'T00:00:00');

  for (let i = 0; i < numPayments; i++) {
    const dueDate = new Date(date);
    dueDate.setMonth(dueDate.getMonth() + i);
    const isLast = i === numPayments - 1;
    const amount = isLast
      ? Math.round((totalAmount - baseAmount * (numPayments - 1)) * 100) / 100
      : baseAmount;

    schedule.push({
      number: i + 1,
      amount,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'pending',
      paid_date: null,
      paid_amount: 0,
    });
  }
  return schedule;
}

/**
 * Returns effective status: overdue if pending and past due date.
 */
export function getInstallmentStatus(installment, today) {
  if (installment.status === 'paid') return 'paid';
  const now = today || new Date();
  const due = new Date(installment.due_date + 'T00:00:00');
  if (due < now) return 'overdue';
  return 'pending';
}

/**
 * Calculate proportional commission for a single payment.
 * Returns 0 if clientRevenue is 0.
 */
export function calcProportionalCommission(paidAmount, clientRevenue, roleTotalCommission) {
  if (!clientRevenue || clientRevenue === 0) return 0;
  return Math.round(((paidAmount / clientRevenue) * roleTotalCommission) * 100) / 100;
}

/**
 * For a single paid installment, calculate commission per role.
 * Returns { setter: X, trafficker: Y, procesos: Z }.
 * Returns zeros if installment is not paid.
 */
export function getInstallmentCommissions(installment, clientRevenue, roleCommissions) {
  const result = {};
  if (installment.status !== 'paid') {
    ROLES.forEach(r => { result[r] = 0; });
    return result;
  }
  const paid = installment.paid_amount || installment.amount || 0;
  ROLES.forEach(role => {
    // Use stored role_amounts if available, otherwise proportional
    result[role] = installment.role_amounts?.[role] !== undefined
      ? installment.role_amounts[role]
      : calcProportionalCommission(paid, clientRevenue, roleCommissions[role] || 0);
  });
  return result;
}

/**
 * Aggregate all commission data for a single client.
 * Returns { [role]: { earned, paid_to_member, pending_payment, not_yet_generated } }
 */
export function aggregateClientCommissions(client) {
  const parsed = parseClientData(client.installments);
  const { payment_schedule, role_commissions, commission_payments } = parsed;
  const revenue = Number(client.revenue) || 0;

  const result = {};
  ROLES.forEach(role => {
    result[role] = { earned: 0, paid_to_member: 0, pending_payment: 0, not_yet_generated: 0 };
  });

  if (!payment_schedule.length) return result;

  payment_schedule.forEach(inst => {
    const commissions = getInstallmentCommissions(inst, revenue, role_commissions);
    const instPayments = commission_payments[String(inst.number)] || {};

    ROLES.forEach(role => {
      const amount = commissions[role];
      if (inst.status === 'paid') {
        result[role].earned += amount;
        if (instPayments[role]?.paid_to_member) {
          result[role].paid_to_member += amount;
        } else {
          result[role].pending_payment += amount;
        }
      } else {
        // Not yet paid by client → commission not generated
        const potential = inst.role_amounts?.[role] !== undefined
          ? inst.role_amounts[role]
          : calcProportionalCommission(inst.amount || 0, revenue, role_commissions[role] || 0);
        result[role].not_yet_generated += potential;
      }
    });
  });

  // Round all values
  ROLES.forEach(role => {
    Object.keys(result[role]).forEach(k => {
      result[role][k] = Math.round(result[role][k] * 100) / 100;
    });
  });

  return result;
}

/**
 * Scan all clients and return payment alerts grouped by urgency.
 * Returns { overdue: [], thisMonth: [], nextMonth: [] }
 */
export function getPaymentAlerts(clients, today) {
  const now = today || new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const nextDate = new Date(currentYear, currentMonth + 1, 1);
  const nextMonth = nextDate.getMonth();
  const nextYear = nextDate.getFullYear();

  const overdue = [];
  const thisMonth = [];
  const nextMonthAlerts = [];

  (clients || []).forEach(client => {
    const raw = client.installments;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
    const schedule = raw.payment_schedule;
    if (!Array.isArray(schedule) || !schedule.length) return;

    schedule.forEach(inst => {
      if (inst.status === 'paid') return;
      const due = new Date(inst.due_date + 'T00:00:00');
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / 86400000);

      const alert = {
        clientId: client.id,
        clientName: client.name,
        installmentNumber: inst.number,
        amount: inst.amount,
        dueDate: inst.due_date,
        daysDiff: diffDays,
      };

      if (due < now) {
        overdue.push(alert);
      } else if (due.getMonth() === currentMonth && due.getFullYear() === currentYear) {
        thisMonth.push(alert);
      } else if (due.getMonth() === nextMonth && due.getFullYear() === nextYear) {
        nextMonthAlerts.push(alert);
      }
    });
  });

  overdue.sort((a, b) => a.daysDiff - b.daysDiff);
  thisMonth.sort((a, b) => a.daysDiff - b.daysDiff);
  nextMonthAlerts.sort((a, b) => a.daysDiff - b.daysDiff);

  return { overdue, thisMonth, nextMonth: nextMonthAlerts };
}

/**
 * Aggregate commissions across all clients, grouped by person + role.
 * Returns { [personName]: { roles: { [role]: { earned, paid, pending, remaining, clients: [...] } } } }
 */
export function aggregateTeamCommissions(clients) {
  const byPerson = {};

  (clients || []).forEach(client => {
    const parsed = parseClientData(client.installments);
    if (!hasNewPaymentSystem(parsed)) return;

    const agg = aggregateClientCommissions(client);
    const roleFieldMap = {
      setter: client.setter,
      trafficker: client.trafficker,
      procesos: client.process_manager,
    };

    ROLES.forEach(role => {
      const person = roleFieldMap[role];
      if (!person) return;
      const n = person.toLowerCase();
      if (n.startsWith('sin ') || n.startsWith('no ')) return;

      if (!byPerson[person]) byPerson[person] = { roles: {} };
      if (!byPerson[person].roles[role]) {
        byPerson[person].roles[role] = { earned: 0, paid: 0, pending: 0, remaining: 0, clients: [] };
      }

      const target = byPerson[person].roles[role];
      target.earned += agg[role].earned;
      target.paid += agg[role].paid_to_member;
      target.pending += agg[role].pending_payment;
      target.remaining += agg[role].not_yet_generated;

      const pendingInstallments = parsed.payment_schedule.filter(i => i.status !== 'paid').length;
      target.clients.push({
        clientId: client.id,
        clientName: client.name,
        earned: agg[role].earned,
        paid: agg[role].paid_to_member,
        pending: agg[role].pending_payment,
        remainingMonths: pendingInstallments,
      });
    });
  });

  return byPerson;
}
