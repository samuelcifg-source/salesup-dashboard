-- ============================================================
-- 008 — Expense subcategory
-- Adds a free-form subcategory column to expenses for cases like
-- herramientas → claude / chatgpt / n8n / otro (custom text).
-- ============================================================

ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS subcategory TEXT;

COMMENT ON COLUMN expenses.subcategory IS
    'Sub-tipo libre. Usado p.ej. cuando category = ''herramientas'' (claude, chatgpt, n8n…).';
