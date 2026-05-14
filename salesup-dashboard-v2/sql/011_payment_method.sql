-- ============================================================
-- 011 — Add payment_method to team_member_payments
-- Heredamos el campo del antiguo team_payments para no perder
-- capacidad de registrar el medio de pago (transferencia, bizum, etc.)
-- ============================================================

ALTER TABLE team_member_payments
    ADD COLUMN IF NOT EXISTS payment_method TEXT;
