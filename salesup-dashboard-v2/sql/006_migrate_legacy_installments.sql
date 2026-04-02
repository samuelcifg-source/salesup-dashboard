-- ============================================================
-- 006_migrate_legacy_installments.sql
-- Migra clientes legacy (formato cuotas/custom_owed) al formato
-- nuevo (payment_schedule/role_commissions/commission_payments)
--
-- NO DESTRUCTIVO:
--   1. Crea columna installments_backup con copia exacta
--   2. Conserva TODOS los campos legacy dentro del JSONB
--   3. Para revertir: ejecutar 006_rollback_legacy_installments.sql
-- ============================================================

BEGIN;

-- ============================================================
-- PASO 1: Backup
-- ============================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS installments_backup JSONB;

UPDATE clients
SET installments_backup = installments;

-- ============================================================
-- PASO 2: Clientes con installments = [] (array vacío)
-- Convertir a objeto con formato nuevo vacío
-- ============================================================
UPDATE clients
SET installments = jsonb_build_object(
  'payment_schedule', '[]'::jsonb,
  'role_commissions', '{}'::jsonb,
  'commission_payments', '{}'::jsonb,
  'cuotas', '[]'::jsonb,
  'custom_owed', '{}'::jsonb
)
WHERE installments IS NOT NULL
  AND jsonb_typeof(installments) = 'array';

-- ============================================================
-- PASO 3: Clientes legacy con custom_owed pero SIN formato nuevo
-- (tienen custom_owed pero no tienen role_commissions o está vacío)
-- ============================================================

-- 3a. Añadir role_commissions desde custom_owed (solo valores > 0)
UPDATE clients
SET installments = installments
  || jsonb_build_object(
    'role_commissions', (
      SELECT jsonb_object_agg(key, value)
      FROM jsonb_each(installments -> 'custom_owed')
      WHERE (value::text)::numeric > 0
    )
  )
WHERE installments IS NOT NULL
  AND jsonb_typeof(installments) = 'object'
  AND installments ? 'custom_owed'
  AND (
    NOT (installments ? 'role_commissions')
    OR installments -> 'role_commissions' = '{}'::jsonb
  )
  AND EXISTS (
    SELECT 1
    FROM jsonb_each(installments -> 'custom_owed')
    WHERE (value::text)::numeric > 0
  );

-- 3b. Para los que custom_owed tiene todos los valores en 0,
--     poner role_commissions vacío
UPDATE clients
SET installments = installments
  || jsonb_build_object('role_commissions', '{}'::jsonb)
WHERE installments IS NOT NULL
  AND jsonb_typeof(installments) = 'object'
  AND installments ? 'custom_owed'
  AND (
    NOT (installments ? 'role_commissions')
    OR installments -> 'role_commissions' = '{}'::jsonb
  )
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_each(installments -> 'custom_owed')
    WHERE (value::text)::numeric > 0
  );

-- ============================================================
-- PASO 4: Convertir cuotas → payment_schedule
-- Solo para clientes que tienen cuotas con datos pero no tienen
-- payment_schedule (o está vacío)
-- ============================================================
UPDATE clients
SET installments = installments
  || jsonb_build_object(
    'payment_schedule', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'number', rn,
          'amount', (elem -> 'amount')::numeric,
          'due_date', elem ->> 'date',
          'status', CASE
            WHEN (elem ->> 'date')::date <= CURRENT_DATE AND cash >= (elem -> 'amount')::numeric
            THEN 'paid'
            ELSE 'pending'
          END,
          'paid_date', CASE
            WHEN (elem ->> 'date')::date <= CURRENT_DATE AND cash >= (elem -> 'amount')::numeric
            THEN (elem ->> 'date')
            ELSE null
          END,
          'paid_amount', CASE
            WHEN (elem ->> 'date')::date <= CURRENT_DATE AND cash >= (elem -> 'amount')::numeric
            THEN (elem -> 'amount')::numeric
            ELSE 0
          END
        )
        ORDER BY rn
      )
      FROM jsonb_array_elements(installments -> 'cuotas') WITH ORDINALITY AS t(elem, rn)
    )
  )
WHERE installments IS NOT NULL
  AND jsonb_typeof(installments) = 'object'
  AND installments ? 'cuotas'
  AND jsonb_array_length(installments -> 'cuotas') > 0
  AND (
    NOT (installments ? 'payment_schedule')
    OR installments -> 'payment_schedule' = '[]'::jsonb
  );

-- ============================================================
-- PASO 5: Asegurar que commission_payments existe en todos
-- los clientes legacy (inicializar vacío si no existe)
-- ============================================================
UPDATE clients
SET installments = installments
  || jsonb_build_object('commission_payments', '{}'::jsonb)
WHERE installments IS NOT NULL
  AND jsonb_typeof(installments) = 'object'
  AND NOT (installments ? 'commission_payments');

-- ============================================================
-- PASO 6: Asegurar que payment_schedule existe en todos
-- los clientes legacy (inicializar vacío si no existe)
-- ============================================================
UPDATE clients
SET installments = installments
  || jsonb_build_object('payment_schedule', '[]'::jsonb)
WHERE installments IS NOT NULL
  AND jsonb_typeof(installments) = 'object'
  AND NOT (installments ? 'payment_schedule');

-- ============================================================
-- PASO 7: Asegurar que role_commissions existe en todos
-- (para los que no tenían ni custom_owed ni role_commissions)
-- ============================================================
UPDATE clients
SET installments = installments
  || jsonb_build_object('role_commissions', '{}'::jsonb)
WHERE installments IS NOT NULL
  AND jsonb_typeof(installments) = 'object'
  AND NOT (installments ? 'role_commissions');

COMMIT;

-- ============================================================
-- VERIFICACION: Ejecutar después para comprobar la migración
-- ============================================================
-- SELECT name, payment_type,
--   installments -> 'role_commissions' AS role_commissions,
--   installments -> 'payment_schedule' AS payment_schedule,
--   installments -> 'commission_payments' AS commission_payments,
--   installments -> 'custom_owed' AS custom_owed_backup
-- FROM clients
-- WHERE installments IS NOT NULL
-- ORDER BY created_at DESC;
