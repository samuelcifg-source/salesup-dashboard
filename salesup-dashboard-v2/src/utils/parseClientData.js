// Shared utility: parse the `installments` JSONB from the clients table.
// Supports legacy array format and new object format with payment_schedule.

export function parseClientData(raw) {
  if (Array.isArray(raw)) {
    return {
      cuotas: raw,
      custom_owed: {},
      role_cuotas: {},
      payment_schedule: [],
      role_commissions: {},
      commission_payments: {},
    };
  }
  if (raw && typeof raw === 'object') {
    return {
      cuotas: raw.cuotas || [],
      custom_owed: raw.custom_owed || {},
      role_cuotas: raw.role_cuotas || {},
      payment_schedule: raw.payment_schedule || [],
      role_commissions: raw.role_commissions || {},
      commission_payments: raw.commission_payments || {},
    };
  }
  return {
    cuotas: [],
    custom_owed: {},
    role_cuotas: {},
    payment_schedule: [],
    role_commissions: {},
    commission_payments: {},
  };
}

export function hasNewPaymentSystem(parsedData) {
  return Array.isArray(parsedData.payment_schedule) && parsedData.payment_schedule.length > 0;
}
