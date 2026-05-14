-- ============================================================
-- 007_add_embudo_to_setter_kpi.sql
-- Adds the `embudo` column to setter_kpi to track which funnel
-- each KPI record belongs to.
--
-- NO DESTRUCTIVO:
--   1. Adds column (nullable initially)
--   2. Backfills existing records with 'formulario'
--   3. Sets default for future inserts
--   4. Adds index for filtering/grouping
-- ============================================================

BEGIN;

-- 1. Add column (idempotent)
ALTER TABLE setter_kpi ADD COLUMN IF NOT EXISTS embudo TEXT;

-- 2. Backfill existing records
UPDATE setter_kpi SET embudo = 'formulario' WHERE embudo IS NULL;

-- 3. Set default for new inserts
ALTER TABLE setter_kpi ALTER COLUMN embudo SET DEFAULT 'formulario';

-- 4. Index for filtering/grouping
CREATE INDEX IF NOT EXISTS idx_setter_kpi_embudo ON setter_kpi(embudo);

COMMIT;

-- ============================================================
-- VERIFICACION
-- ============================================================
-- SELECT embudo, COUNT(*) FROM setter_kpi GROUP BY embudo;
-- -- Esperado: todos los registros existentes con embudo = 'formulario'
