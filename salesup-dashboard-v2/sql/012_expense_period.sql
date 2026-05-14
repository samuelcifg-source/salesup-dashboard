-- ============================================================
-- 012 — Period start/end on expenses
-- El campo `date` pasa a interpretarse como "fecha de pago".
-- Period_start / Period_end indican el periodo al que aplica
-- el gasto (ej. edición del 1-30 abril, pagada el 7 mayo).
-- ============================================================

ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS period_start DATE,
    ADD COLUMN IF NOT EXISTS period_end DATE;

COMMENT ON COLUMN expenses.date         IS 'Fecha de pago efectivo (reinterpretada). Antes era genérica.';
COMMENT ON COLUMN expenses.period_start IS 'Inicio del período al que aplica el gasto (opcional).';
COMMENT ON COLUMN expenses.period_end   IS 'Fin del período al que aplica el gasto (opcional).';
