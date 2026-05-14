-- ============================================================
-- 007b_fix_embudo_lowercase.sql
-- Cambia 'Formulario' (mayuscula) a 'formulario' (minuscula)
-- en setter_kpi.embudo para coincidir con lo que envia Make.
-- Ejecutar SOLO si ya se ejecuto el 007 con 'Formulario'.
-- ============================================================

BEGIN;

-- 1. Update existing records con valor incorrecto
UPDATE setter_kpi SET embudo = 'formulario' WHERE embudo = 'Formulario';

-- 2. Cambiar el default de la columna a minuscula
ALTER TABLE setter_kpi ALTER COLUMN embudo SET DEFAULT 'formulario';

COMMIT;

-- ============================================================
-- VERIFICACION
-- ============================================================
-- SELECT embudo, COUNT(*) FROM setter_kpi GROUP BY embudo;
-- -- Esperado: todos los registros con embudo = 'formulario' (minuscula)
