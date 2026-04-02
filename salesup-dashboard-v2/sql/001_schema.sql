-- ============================================================
-- 001_schema.sql
-- SalesUp Dashboard v2 - Database Schema
-- Creates all tables, indexes, and auto-update triggers
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CLIENTS TABLE
-- ============================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT DEFAULT 'España',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,  -- Auto-calculated via trigger: start_date + 6 months
    setter TEXT,
    closer TEXT,
    trafficker TEXT,
    process_manager TEXT,
    source TEXT,
    offer TEXT,
    payment_type TEXT DEFAULT 'Auto-financiado',
    revenue NUMERIC(12,2) DEFAULT 0,
    cash NUMERIC(12,2) DEFAULT 0,
    email TEXT,
    instagram TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_clients_start_date ON clients(start_date);
CREATE INDEX idx_clients_closer ON clients(closer);
CREATE INDEX idx_clients_setter ON clients(setter);
CREATE INDEX idx_clients_source ON clients(source);
CREATE INDEX idx_clients_offer ON clients(offer);
CREATE INDEX idx_clients_payment_type ON clients(payment_type);

-- ============================================================
-- 2. CLOSER_KPI TABLE
-- ============================================================
CREATE TABLE closer_kpi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    closer_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    call_type TEXT,
    calls_scheduled INTEGER DEFAULT 0,
    calls_cancelled INTEGER DEFAULT 0,
    live_calls INTEGER DEFAULT 0,
    offers_made INTEGER DEFAULT 0,
    deposits INTEGER DEFAULT 0,
    closes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_closer_kpi_date ON closer_kpi(date);
CREATE INDEX idx_closer_kpi_closer_name ON closer_kpi(closer_name);
CREATE INDEX idx_closer_kpi_call_type ON closer_kpi(call_type);

-- ============================================================
-- 3. SETTER_KPI TABLE
-- ============================================================
CREATE TABLE setter_kpi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setter_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_calls INTEGER DEFAULT 0,
    answered INTEGER DEFAULT 0,
    not_answered INTEGER DEFAULT 0,
    not_qualified INTEGER DEFAULT 0,
    whatsapp INTEGER DEFAULT 0,
    proposals INTEGER DEFAULT 0,
    scheduled INTEGER DEFAULT 0,
    follow_ups INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_setter_kpi_date ON setter_kpi(date);
CREATE INDEX idx_setter_kpi_setter_name ON setter_kpi(setter_name);

-- ============================================================
-- 4. LEAD_EVENTS TABLE
-- ============================================================
CREATE TABLE lead_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID,
    table_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_lead_events_lead_id ON lead_events(lead_id);
CREATE INDEX idx_lead_events_table_name ON lead_events(table_name);
CREATE INDEX idx_lead_events_event_type ON lead_events(event_type);
CREATE INDEX idx_lead_events_created_at ON lead_events(created_at DESC);

-- ============================================================
-- 5. CLIENT_ROLE_PAYMENTS TABLE
-- ============================================================
CREATE TABLE client_role_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    person_name TEXT,
    amount_paid NUMERIC(12,2) DEFAULT 0,
    date_paid DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_client_role_payments_client_id ON client_role_payments(client_id);
CREATE INDEX idx_client_role_payments_role ON client_role_payments(role);

-- ============================================================
-- 6. TEAM_PAYMENTS TABLE
-- ============================================================
CREATE TABLE team_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_name TEXT NOT NULL,
    role TEXT,
    amount NUMERIC(12,2) DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    concept TEXT,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_team_payments_date ON team_payments(date);
CREATE INDEX idx_team_payments_person_name ON team_payments(person_name);
CREATE INDEX idx_team_payments_role ON team_payments(role);

-- ============================================================
-- 7. EXPENSES TABLE
-- ============================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) DEFAULT 0,
    is_percentage BOOLEAN DEFAULT false,
    percentage NUMERIC(5,2) DEFAULT 0,
    category TEXT DEFAULT 'otros',
    date DATE DEFAULT CURRENT_DATE,
    recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================================
-- 8. CONFIG TABLE
-- ============================================================
CREATE TABLE config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_config_key ON config(key);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update trigger to clients
CREATE TRIGGER trigger_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply auto-update trigger to closer_kpi
CREATE TRIGGER trigger_closer_kpi_updated_at
    BEFORE UPDATE ON closer_kpi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply auto-update trigger to setter_kpi
CREATE TRIGGER trigger_setter_kpi_updated_at
    BEFORE UPDATE ON setter_kpi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply auto-update trigger to config
CREATE TRIGGER trigger_config_updated_at
    BEFORE UPDATE ON config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
