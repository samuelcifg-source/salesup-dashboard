import { describe, it, expect } from 'vitest';
import {
  getSetterRate,
  calcSetterCommission,
  calcCloserCommission,
  calcRoleCommission,
  calcClientCommissions,
} from './commissions.js';

// ─── getSetterRate ──────────────────────────────────────────────────

describe('getSetterRate', () => {
  it('returns 0.10 for salesCount >= 9', () => {
    expect(getSetterRate(9)).toBe(0.10);
    expect(getSetterRate(10)).toBe(0.10);
    expect(getSetterRate(100)).toBe(0.10);
  });

  it('returns 0.08 for salesCount 6-8', () => {
    expect(getSetterRate(6)).toBe(0.08);
    expect(getSetterRate(7)).toBe(0.08);
    expect(getSetterRate(8)).toBe(0.08);
  });

  it('returns 0.06 for salesCount 4-5', () => {
    expect(getSetterRate(4)).toBe(0.06);
    expect(getSetterRate(5)).toBe(0.06);
  });

  it('returns 0.04 for salesCount 1-3', () => {
    expect(getSetterRate(1)).toBe(0.04);
    expect(getSetterRate(2)).toBe(0.04);
    expect(getSetterRate(3)).toBe(0.04);
  });

  it('returns 0 for salesCount 0', () => {
    expect(getSetterRate(0)).toBe(0);
  });

  it('returns 0 for negative salesCount', () => {
    expect(getSetterRate(-1)).toBe(0);
    expect(getSetterRate(-100)).toBe(0);
  });
});

// ─── calcSetterCommission ───────────────────────────────────────────

describe('calcSetterCommission', () => {
  it('calculates correctly at the lowest tier (1-3 sales)', () => {
    // rate = 0.04 for 1-3 sales
    expect(calcSetterCommission(1, 10000)).toBe(400);    // 10000 * 0.04
    expect(calcSetterCommission(3, 5000)).toBe(200);     // 5000 * 0.04
  });

  it('calculates correctly at the 4-5 tier', () => {
    // rate = 0.06 for 4-5 sales
    expect(calcSetterCommission(4, 10000)).toBe(600);    // 10000 * 0.06
    expect(calcSetterCommission(5, 10000)).toBe(600);    // 10000 * 0.06
  });

  it('calculates correctly at the 6-8 tier', () => {
    // rate = 0.08 for 6-8 sales
    expect(calcSetterCommission(6, 10000)).toBe(800);    // 10000 * 0.08
  });

  it('calculates correctly at the highest tier (9+ sales)', () => {
    // rate = 0.10 for 9+ sales
    expect(calcSetterCommission(9, 10000)).toBe(1000);   // 10000 * 0.10
    expect(calcSetterCommission(15, 20000)).toBe(2000);  // 20000 * 0.10
  });

  it('returns 0 when salesCount is 0', () => {
    expect(calcSetterCommission(0, 10000)).toBe(0);      // rate = 0
  });

  it('returns 0 when totalCash is 0', () => {
    expect(calcSetterCommission(5, 0)).toBe(0);
  });

  it('handles large cash amounts', () => {
    expect(calcSetterCommission(9, 1000000)).toBe(100000); // 1M * 0.10
  });
});

// ─── calcCloserCommission ───────────────────────────────────────────

describe('calcCloserCommission', () => {
  it('calculates with default rate (0.15)', () => {
    expect(calcCloserCommission(10000)).toBe(1500);      // 10000 * 0.15
    expect(calcCloserCommission(1000)).toBe(150);        // 1000 * 0.15
  });

  it('calculates with custom rate', () => {
    expect(calcCloserCommission(10000, 0.20)).toBe(2000); // 10000 * 0.20
    expect(calcCloserCommission(10000, 0.10)).toBe(1000); // 10000 * 0.10
  });

  it('returns 0 when cash is 0', () => {
    expect(calcCloserCommission(0)).toBe(0);
    expect(calcCloserCommission(0, 0.20)).toBe(0);
  });

  it('handles rate of 0', () => {
    expect(calcCloserCommission(10000, 0)).toBe(0);
  });

  it('handles rate of 1 (100%)', () => {
    expect(calcCloserCommission(5000, 1)).toBe(5000);
  });

  it('handles negative cash (edge case)', () => {
    // No guard in the function, should just multiply
    expect(calcCloserCommission(-1000, 0.15)).toBe(-150);
  });
});

// ─── calcRoleCommission ─────────────────────────────────────────────

describe('calcRoleCommission', () => {
  describe('with default parameters (threshold=4000, flat=400, percentage=0.10)', () => {
    it('returns flat 400 when revenue >= 4000', () => {
      expect(calcRoleCommission(4000)).toBe(400);
      expect(calcRoleCommission(5000)).toBe(400);
      expect(calcRoleCommission(10000)).toBe(400);
      expect(calcRoleCommission(100000)).toBe(400);
    });

    it('returns revenue * 0.10 when revenue < 4000', () => {
      expect(calcRoleCommission(3999)).toBeCloseTo(399.9);
      expect(calcRoleCommission(2000)).toBe(200);
      expect(calcRoleCommission(1000)).toBe(100);
      expect(calcRoleCommission(500)).toBe(50);
    });

    it('returns 0 when revenue is 0', () => {
      expect(calcRoleCommission(0)).toBe(0);
    });
  });

  describe('with custom parameters', () => {
    it('uses custom threshold', () => {
      // threshold=5000, flat=500, percentage=0.10
      expect(calcRoleCommission(5000, 5000, 500, 0.10)).toBe(500);
      expect(calcRoleCommission(4999, 5000, 500, 0.10)).toBeCloseTo(499.9);
    });

    it('uses custom flat amount', () => {
      expect(calcRoleCommission(4000, 4000, 600)).toBe(600);
    });

    it('uses custom percentage', () => {
      expect(calcRoleCommission(3000, 4000, 400, 0.05)).toBe(150); // 3000 * 0.05
    });

    it('works with zero threshold (always returns flat)', () => {
      expect(calcRoleCommission(0, 0, 400, 0.10)).toBe(400);
      expect(calcRoleCommission(100, 0, 400, 0.10)).toBe(400);
    });
  });

  describe('boundary values', () => {
    it('returns flat at exactly the threshold', () => {
      expect(calcRoleCommission(4000, 4000, 400, 0.10)).toBe(400);
    });

    it('returns percentage just below the threshold', () => {
      expect(calcRoleCommission(3999, 4000, 400, 0.10)).toBeCloseTo(399.9);
    });

    it('handles negative revenue (edge case)', () => {
      // revenue < threshold, so revenue * percentage
      expect(calcRoleCommission(-1000, 4000, 400, 0.10)).toBe(-100);
    });
  });
});

// ─── calcClientCommissions ──────────────────────────────────────────

describe('calcClientCommissions', () => {
  it('calculates all commissions for a client with defaults', () => {
    const client = { revenue: 5000, cash: 10000 };
    const result = calcClientCommissions(client);

    expect(result.closer).toBe(1500);       // 10000 * 0.15
    expect(result.trafficker).toBe(400);     // 5000 >= 4000 -> flat 400
    expect(result.procesos).toBe(400);       // 5000 >= 4000 -> flat 400
  });

  it('calculates closer commission with custom rate', () => {
    const client = { revenue: 5000, cash: 10000 };
    const config = { closer: 0.20 };
    const result = calcClientCommissions(client, config);

    expect(result.closer).toBe(2000);       // 10000 * 0.20
  });

  it('calculates trafficker commission with custom config', () => {
    const client = { revenue: 3000, cash: 10000 };
    const config = {
      trafficker: { threshold: 5000, flat: 500, percentage: 0.05 },
    };
    const result = calcClientCommissions(client, config);

    expect(result.trafficker).toBe(150);     // 3000 * 0.05 (below 5000 threshold)
  });

  it('calculates procesos commission with custom config', () => {
    const client = { revenue: 6000, cash: 10000 };
    const config = {
      procesos: { threshold: 5000, flat: 600, percentage: 0.10 },
    };
    const result = calcClientCommissions(client, config);

    expect(result.procesos).toBe(600);       // 6000 >= 5000 -> flat 600
  });

  it('handles client with revenue below threshold', () => {
    const client = { revenue: 2000, cash: 5000 };
    const result = calcClientCommissions(client);

    expect(result.closer).toBe(750);         // 5000 * 0.15
    expect(result.trafficker).toBe(200);     // 2000 * 0.10
    expect(result.procesos).toBe(200);       // 2000 * 0.10
  });

  it('handles null commissionConfig', () => {
    const client = { revenue: 5000, cash: 10000 };
    const result = calcClientCommissions(client, null);

    expect(result.closer).toBe(1500);
    expect(result.trafficker).toBe(400);
    expect(result.procesos).toBe(400);
  });

  it('handles undefined commissionConfig', () => {
    const client = { revenue: 5000, cash: 10000 };
    const result = calcClientCommissions(client, undefined);

    expect(result.closer).toBe(1500);
    expect(result.trafficker).toBe(400);
    expect(result.procesos).toBe(400);
  });

  it('handles zero revenue and zero cash', () => {
    const client = { revenue: 0, cash: 0 };
    const result = calcClientCommissions(client);

    expect(result.closer).toBe(0);
    expect(result.trafficker).toBe(0);       // 0 < 4000 -> 0 * 0.10 = 0
    expect(result.procesos).toBe(0);
  });

  it('does not include setter in the result', () => {
    const client = { revenue: 5000, cash: 10000 };
    const result = calcClientCommissions(client);

    expect(result).not.toHaveProperty('setter');
  });

  it('handles partial commissionConfig (only closer set)', () => {
    const client = { revenue: 5000, cash: 10000 };
    const config = { closer: 0.25 };
    const result = calcClientCommissions(client, config);

    expect(result.closer).toBe(2500);        // 10000 * 0.25
    expect(result.trafficker).toBe(400);     // defaults
    expect(result.procesos).toBe(400);       // defaults
  });

  it('returns correct shape with all three properties', () => {
    const client = { revenue: 5000, cash: 10000 };
    const result = calcClientCommissions(client);

    expect(result).toHaveProperty('closer');
    expect(result).toHaveProperty('trafficker');
    expect(result).toHaveProperty('procesos');
    expect(Object.keys(result)).toHaveLength(3);
  });
});

// ─── Integration-style: tier transitions ────────────────────────────

describe('Setter tier transitions (integration)', () => {
  it('commission increases as sales count crosses tier boundaries', () => {
    const cash = 10000;

    const comm0 = calcSetterCommission(0, cash);    // 0
    const comm1 = calcSetterCommission(1, cash);    // 400
    const comm4 = calcSetterCommission(4, cash);    // 600
    const comm6 = calcSetterCommission(6, cash);    // 800
    const comm9 = calcSetterCommission(9, cash);    // 1000

    expect(comm0).toBe(0);
    expect(comm1).toBe(400);
    expect(comm4).toBe(600);
    expect(comm6).toBe(800);
    expect(comm9).toBe(1000);

    // Monotonically increasing
    expect(comm0).toBeLessThan(comm1);
    expect(comm1).toBeLessThan(comm4);
    expect(comm4).toBeLessThan(comm6);
    expect(comm6).toBeLessThan(comm9);
  });
});

// ─── Edge cases: floating point ─────────────────────────────────────

describe('Floating point precision', () => {
  it('calcCloserCommission handles fractional cash', () => {
    const result = calcCloserCommission(333.33, 0.15);
    expect(result).toBeCloseTo(49.9995, 4);
  });

  it('calcRoleCommission handles fractional revenue below threshold', () => {
    const result = calcRoleCommission(1234.56, 4000, 400, 0.10);
    expect(result).toBeCloseTo(123.456, 3);
  });

  it('calcSetterCommission handles fractional cash', () => {
    const result = calcSetterCommission(5, 7777.77); // rate 0.06
    expect(result).toBeCloseTo(466.6662, 4);
  });
});
