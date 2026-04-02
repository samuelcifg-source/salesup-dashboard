-- ============================================================
-- 006_rollback_legacy_installments.sql
-- Revierte la migración de 006_migrate_legacy_installments.sql
-- Restaura installments desde la columna de backup
-- ============================================================

BEGIN;

-- Restaurar datos originales desde el backup
UPDATE clients
SET installments = installments_backup
WHERE installments_backup IS NOT NULL;

COMMIT;

-- Verificar que se restauró correctamente:
-- SELECT name, installments, installments_backup
-- FROM clients
-- WHERE installments::text IS DISTINCT FROM installments_backup::text;
--
-- (Debería devolver 0 filas si el rollback fue exitoso)
--
-- OPCIONAL: Si quieres eliminar la columna de backup después:
-- ALTER TABLE clients DROP COLUMN installments_backup;
