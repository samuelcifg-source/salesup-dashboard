import { useMemo } from 'react';
import { parseClientData } from '../utils/parseClientData';
import { calcProportionalCommission } from '../utils/paymentSchedule';

const ROLES = ['setter', 'trafficker', 'procesos'];
const ROLE_FIELD = { setter: 'setter', trafficker: 'trafficker', procesos: 'process_manager' };

export function useCommissions(clients) {
  return useMemo(() => {
    const byRole = { closer: {}, setter: {}, trafficker: {}, procesos: {} };
    const clientDrillDown = { setter: {}, trafficker: {}, procesos: {} };

    (clients || []).forEach(client => {
      const parsed = parseClientData(client.installments);
      const { payment_schedule, role_commissions, commission_payments } = parsed;
      const revenue = Number(client.revenue) || 0;
      const cash = Number(client.cash) || 0;
      const hasSchedule = client.payment_type === 'Auto-financiado' && payment_schedule.length > 0;

      ROLES.forEach(role => {
        const name = client[ROLE_FIELD[role]] || 'Sin asignar';
        const total = role_commissions[role] || 0;
        if (!total) return;

        let earned = 0, paidToMember = 0, notYetGenerated = 0;

        if (hasSchedule) {
          payment_schedule.forEach(inst => {
            // Use stored role_amounts if available, otherwise proportional
            const getAmount = (i) => i.role_amounts?.[role] !== undefined
              ? i.role_amounts[role]
              : calcProportionalCommission(i.amount || 0, revenue, total);
            const amount = getAmount(inst);
            if (inst.status === 'paid') {
              earned += amount;
              if (commission_payments[String(inst.number)]?.[role]?.paid_to_member) {
                paidToMember += amount;
              }
            } else {
              notYetGenerated += amount;
            }
          });
        } else {
          // No schedule (Sequra/Transferencia): full amount earned if cash > 0
          earned = cash > 0 ? total : 0;
          notYetGenerated = cash > 0 ? 0 : total;
          if (commission_payments['0']?.[role]?.paid_to_member) paidToMember = earned;
        }

        earned = Math.round(earned * 100) / 100;
        paidToMember = Math.round(paidToMember * 100) / 100;
        notYetGenerated = Math.round(notYetGenerated * 100) / 100;
        const pending = Math.round((earned - paidToMember) * 100) / 100;

        if (!byRole[role][name]) byRole[role][name] = { owed: 0, paid: 0, pending: 0, not_yet_generated: 0 };
        byRole[role][name].paid += paidToMember;
        byRole[role][name].pending += pending;
        byRole[role][name].not_yet_generated += notYetGenerated;
        byRole[role][name].owed = byRole[role][name].paid + byRole[role][name].pending + byRole[role][name].not_yet_generated;

        // Drill-down
        if (!clientDrillDown[role][name]) clientDrillDown[role][name] = [];
        const pendingInst = hasSchedule ? payment_schedule.filter(i => i.status !== 'paid').length : (cash > 0 ? 0 : 1);
        clientDrillDown[role][name].push({
          clientId: client.id,
          clientName: client.name,
          startDate: client.start_date,
          earned, paid: paidToMember, pending, remainingMonths: pendingInst,
        });
      });
    });

    const sumField = (totals, field) => Object.values(totals).reduce((s, d) => s + (d[field] || 0), 0);

    return {
      closerTotals: byRole.closer,
      setterTotals: byRole.setter,
      traffTotals: byRole.trafficker,
      procesosTotals: byRole.procesos,
      clientDrillDown,
      totalPaid: sumField(byRole.setter, 'paid') + sumField(byRole.trafficker, 'paid') + sumField(byRole.procesos, 'paid'),
      totalPending: sumField(byRole.setter, 'pending') + sumField(byRole.trafficker, 'pending') + sumField(byRole.procesos, 'pending'),
      totalOwed: sumField(byRole.setter, 'owed') + sumField(byRole.trafficker, 'owed') + sumField(byRole.procesos, 'owed'),
      totalNotYetGenerated: sumField(byRole.setter, 'not_yet_generated') + sumField(byRole.trafficker, 'not_yet_generated') + sumField(byRole.procesos, 'not_yet_generated'),
    };
  }, [clients]);
}
