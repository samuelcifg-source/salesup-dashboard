-- ============================================================
-- 007 — Make end_date trigger optional
-- Previously auto_set_end_date() unconditionally overwrote
-- clients.end_date with start_date + 6 months on every insert/update.
-- Now end_date is editable from the UI, so the trigger should only
-- fill it when the app does NOT supply a value (NEW.end_date IS NULL).
-- ============================================================

CREATE OR REPLACE FUNCTION auto_set_end_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date IS NULL THEN
        NEW.end_date := NEW.start_date + INTERVAL '6 months';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger definition stays the same (BEFORE INSERT OR UPDATE OF start_date),
-- so no DROP/CREATE TRIGGER needed — just replace the function body.
