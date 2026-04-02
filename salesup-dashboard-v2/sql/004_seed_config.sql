-- ============================================================
-- 004_seed_config.sql
-- SalesUp Dashboard v2 - Configuration Seed Data
-- Uses ON CONFLICT (key) DO UPDATE to be idempotent.
-- ============================================================

-- Business name
INSERT INTO config (key, value)
VALUES ('business_name', '"SALESUP"'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Closers list
INSERT INTO config (key, value)
VALUES ('closers', '["Pablo", "No Closer"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Setters list
INSERT INTO config (key, value)
VALUES ('setters', '["No Setter", "Sofi", "Jared", "Neus"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Traffickers list
INSERT INTO config (key, value)
VALUES ('traffickers', '["No Trafficker"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Process managers list
INSERT INTO config (key, value)
VALUES ('process_managers', '["No Process Manager"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Offers list
INSERT INTO config (key, value)
VALUES ('offers', '["Herbolario", "Cafetería", "Panadería", "Compraventa de coches", "Ecommerce"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Sources list
INSERT INTO config (key, value)
VALUES ('sources', '["Setter", "Organic", "Youtube", "Email", "Facebook", "Instagram", "Self set"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Deals list
INSERT INTO config (key, value)
VALUES ('deals', '["Pago Completo", "Sequra", "Depósito", "Pago Fraccionado", "Pago Programado", "Reembolso"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Call types list
INSERT INTO config (key, value)
VALUES ('call_types', '["Llamada de venta", "Demo + Cierre (1 Call Close)", "Demo (2 Call Close)", "Cierre (2 Call Close)"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Payment methods list
INSERT INTO config (key, value)
VALUES ('payment_methods', '["Stripe", "Transferencia", "Crypto", "Efectivo"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Payment types list
INSERT INTO config (key, value)
VALUES ('payment_types', '["Auto-financiado", "Sequra", "Transferencia"]'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Commissions configuration
INSERT INTO config (key, value)
VALUES ('commissions', '{
    "closer": 0.15,
    "setter_tiers": [
        {"min": 1, "max": 3, "rate": 0.04},
        {"min": 4, "max": 5, "rate": 0.06},
        {"min": 6, "max": 8, "rate": 0.08},
        {"min": 9, "max": 999, "rate": 0.10}
    ],
    "trafficker": {
        "threshold": 4000,
        "flat": 400,
        "percentage": 0.10
    },
    "procesos": {
        "threshold": 4000,
        "flat": 400,
        "percentage": 0.10
    }
}'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
