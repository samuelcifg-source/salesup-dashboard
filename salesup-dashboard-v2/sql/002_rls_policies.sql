-- ============================================================
-- 002_rls_policies.sql
-- SalesUp Dashboard v2 - Row Level Security Policies
-- Enables RLS on all 8 tables and creates CRUD policies
-- for authenticated users.
-- ============================================================

-- ============================================================
-- 1. CLIENTS - Full CRUD for authenticated users
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_policy"
    ON clients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "clients_insert_policy"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "clients_update_policy"
    ON clients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "clients_delete_policy"
    ON clients FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 2. CLOSER_KPI - Full CRUD for authenticated users
-- ============================================================
ALTER TABLE closer_kpi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "closer_kpi_select_policy"
    ON closer_kpi FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "closer_kpi_insert_policy"
    ON closer_kpi FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "closer_kpi_update_policy"
    ON closer_kpi FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "closer_kpi_delete_policy"
    ON closer_kpi FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 3. SETTER_KPI - Full CRUD for authenticated users
-- ============================================================
ALTER TABLE setter_kpi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "setter_kpi_select_policy"
    ON setter_kpi FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "setter_kpi_insert_policy"
    ON setter_kpi FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "setter_kpi_update_policy"
    ON setter_kpi FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "setter_kpi_delete_policy"
    ON setter_kpi FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 4. LEAD_EVENTS - SELECT and INSERT only for authenticated users
-- ============================================================
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_events_select_policy"
    ON lead_events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "lead_events_insert_policy"
    ON lead_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================
-- 5. CLIENT_ROLE_PAYMENTS - Full CRUD for authenticated users
-- ============================================================
ALTER TABLE client_role_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_role_payments_select_policy"
    ON client_role_payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "client_role_payments_insert_policy"
    ON client_role_payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "client_role_payments_update_policy"
    ON client_role_payments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "client_role_payments_delete_policy"
    ON client_role_payments FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 6. TEAM_PAYMENTS - Full CRUD for authenticated users
-- ============================================================
ALTER TABLE team_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_payments_select_policy"
    ON team_payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "team_payments_insert_policy"
    ON team_payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "team_payments_update_policy"
    ON team_payments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "team_payments_delete_policy"
    ON team_payments FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 7. EXPENSES - Full CRUD for authenticated users
-- ============================================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select_policy"
    ON expenses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "expenses_insert_policy"
    ON expenses FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "expenses_update_policy"
    ON expenses FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "expenses_delete_policy"
    ON expenses FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================
-- 8. CONFIG - Full CRUD for authenticated users
-- ============================================================
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_select_policy"
    ON config FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "config_insert_policy"
    ON config FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "config_update_policy"
    ON config FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "config_delete_policy"
    ON config FOR DELETE
    TO authenticated
    USING (true);
