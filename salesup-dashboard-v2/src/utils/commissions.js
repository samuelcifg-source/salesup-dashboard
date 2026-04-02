// Setter tiers: monthly sales count determines rate
const SETTER_TIERS = [
  { min: 9, rate: 0.10 },
  { min: 6, rate: 0.08 },
  { min: 4, rate: 0.06 },
  { min: 1, rate: 0.04 },
];

export function getSetterRate(salesCount) {
  for (const tier of SETTER_TIERS) {
    if (salesCount >= tier.min) return tier.rate;
  }
  return 0;
}

// Calculate setter commission for a month
// salesCount = number of sales that month, totalCash = total cash collected that month
export function calcSetterCommission(salesCount, totalCash) {
  return totalCash * getSetterRate(salesCount);
}

// Closer: fixed percentage (default 15%)
export function calcCloserCommission(cash, rate = 0.15) {
  return cash * rate;
}

// Trafficker & Procesos: flat 400 if revenue >= 4000, otherwise 10%
export function calcRoleCommission(revenue, threshold = 4000, flat = 400, percentage = 0.10) {
  return revenue >= threshold ? flat : revenue * percentage;
}

// Calculate all commissions for a client
export function calcClientCommissions(client, commissionConfig) {
  const { revenue, cash } = client;
  const cc = commissionConfig || {};

  return {
    closer: calcCloserCommission(cash, cc.closer ?? 0.15),
    trafficker: calcRoleCommission(revenue, cc.trafficker?.threshold ?? 4000, cc.trafficker?.flat ?? 400, cc.trafficker?.percentage ?? 0.10),
    procesos: calcRoleCommission(revenue, cc.procesos?.threshold ?? 4000, cc.procesos?.flat ?? 400, cc.procesos?.percentage ?? 0.10),
    // Setter commission is calculated at aggregate level (monthly), not per-client
  };
}
