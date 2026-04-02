-- ============================================================
-- 003_triggers.sql
-- SalesUp Dashboard v2 - Trigger Functions
-- 1. log_lead_event() - Audit trail for INSERT/UPDATE/DELETE
-- 2. auto_set_end_date() - Auto-calculate clients.end_date
-- ============================================================

-- ============================================================
-- LOG LEAD EVENT TRIGGER FUNCTION
-- Logs all changes to clients, closer_kpi, setter_kpi
-- into the lead_events table as an audit trail.
-- Uses SECURITY DEFINER to bypass RLS when inserting events.
-- ============================================================
CREATE OR REPLACE FUNCTION log_lead_event()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    v_event_type TEXT;
    v_event_data JSONB;
    v_lead_id UUID;
    v_changed_fields JSONB;
    v_key TEXT;
BEGIN
    v_event_type := TG_OP;

    IF TG_OP = 'INSERT' THEN
        v_lead_id := NEW.id;
        v_event_data := jsonb_build_object(
            'new', to_jsonb(NEW)
        );

    ELSIF TG_OP = 'UPDATE' THEN
        v_lead_id := NEW.id;

        -- Calculate changed fields
        v_changed_fields := '{}'::JSONB;
        FOR v_key IN SELECT key FROM jsonb_each(to_jsonb(NEW))
        LOOP
            IF to_jsonb(NEW) -> v_key IS DISTINCT FROM to_jsonb(OLD) -> v_key THEN
                v_changed_fields := v_changed_fields || jsonb_build_object(
                    v_key, jsonb_build_object(
                        'old', to_jsonb(OLD) -> v_key,
                        'new', to_jsonb(NEW) -> v_key
                    )
                );
            END IF;
        END LOOP;

        v_event_data := jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW),
            'changed_fields', v_changed_fields
        );

    ELSIF TG_OP = 'DELETE' THEN
        v_lead_id := OLD.id;
        v_event_data := jsonb_build_object(
            'deleted', to_jsonb(OLD)
        );
    END IF;

    INSERT INTO lead_events (lead_id, table_name, event_type, event_data, created_by)
    VALUES (
        v_lead_id,
        TG_TABLE_NAME,
        v_event_type,
        v_event_data,
        COALESCE(auth.uid(), NULL)
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ATTACH log_lead_event TO clients
-- ============================================================
CREATE TRIGGER trigger_clients_log_event
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_event();

-- ============================================================
-- ATTACH log_lead_event TO closer_kpi
-- ============================================================
CREATE TRIGGER trigger_closer_kpi_log_event
    AFTER INSERT OR UPDATE OR DELETE ON closer_kpi
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_event();

-- ============================================================
-- ATTACH log_lead_event TO setter_kpi
-- ============================================================
CREATE TRIGGER trigger_setter_kpi_log_event
    AFTER INSERT OR UPDATE OR DELETE ON setter_kpi
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_event();

-- ============================================================
-- AUTO SET END_DATE TRIGGER FUNCTION
-- Automatically calculates end_date = start_date + 6 months
-- on INSERT and UPDATE of the clients table.
-- ============================================================
CREATE OR REPLACE FUNCTION auto_set_end_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.end_date := NEW.start_date + INTERVAL '6 months';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to clients table (BEFORE INSERT OR UPDATE)
CREATE TRIGGER trigger_clients_auto_end_date
    BEFORE INSERT OR UPDATE OF start_date ON clients
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_end_date();
