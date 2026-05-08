-- ============================================================
-- 009 — Team members + payments
-- New tables for the "Sección de Cobros" sub-tab in Pagos Equipo.
-- team_members: ficha del trabajador (datos bancarios, contacto)
-- team_member_payments: cada pago individual al trabajador, con
--   referencia opcional a una imagen de justificante en Storage.
-- ============================================================

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    iban TEXT,
    bank TEXT,
    phone TEXT,
    email TEXT,
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_member_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE,
    paid BOOLEAN DEFAULT false,
    receipt_url TEXT,
    concept TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tmp_member ON team_member_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_tmp_date   ON team_member_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_tm_active  ON team_members(active);

-- ============================================================
-- RLS — same per-operation pattern as 002_rls_policies.sql
-- ============================================================
ALTER TABLE team_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select_policy"
    ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_members_insert_policy"
    ON team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_members_update_policy"
    ON team_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_members_delete_policy"
    ON team_members FOR DELETE TO authenticated USING (true);

CREATE POLICY "team_member_payments_select_policy"
    ON team_member_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_member_payments_insert_policy"
    ON team_member_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_member_payments_update_policy"
    ON team_member_payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_member_payments_delete_policy"
    ON team_member_payments FOR DELETE TO authenticated USING (true);
