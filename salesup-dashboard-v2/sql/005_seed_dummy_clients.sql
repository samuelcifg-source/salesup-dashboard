-- ============================================================
-- 005_seed_dummy_clients.sql
-- SalesUp Dashboard v2 - Dummy Seed Data
-- Inserts 8 clients, client_role_payments, closer_kpi,
-- and setter_kpi records for testing.
-- ============================================================

-- ============================================================
-- DUMMY CLIENTS (8 records, Sep 2025 - Mar 2026)
-- end_date is auto-calculated by the trigger
-- ============================================================
INSERT INTO clients (id, name, country, start_date, setter, closer, trafficker, process_manager, source, offer, payment_type, revenue, cash, email, instagram)
VALUES
    -- Client 1: Juan Garcia - fully paid, Sep 2025
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000001',
        'Juan García',
        'España',
        '2025-09-15',
        'Jared',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Facebook',
        'Ecommerce',
        'Auto-financiado',
        5000.00,
        5000.00,
        'juan.garcia@email.com',
        '@juangarcia_shop'
    ),
    -- Client 2: Maria Lopez - partially paid, Oct 2025
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000002',
        'María López',
        'México',
        '2025-10-01',
        'Sofi',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Instagram',
        'Cafetería',
        'Sequra',
        6500.00,
        3200.00,
        'maria.lopez@email.com',
        '@marialopez_cafe'
    ),
    -- Client 3: Carlos Rodriguez - fully paid, Nov 2025
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000003',
        'Carlos Rodríguez',
        'Argentina',
        '2025-11-10',
        'Neus',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Organic',
        'Herbolario',
        'Auto-financiado',
        3500.00,
        3500.00,
        'carlos.rodriguez@email.com',
        '@carlosrod_herbal'
    ),
    -- Client 4: Ana Martinez - partially paid, Dec 2025
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000004',
        'Ana Martínez',
        'Colombia',
        '2025-12-05',
        'Jared',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Youtube',
        'Panadería',
        'Transferencia',
        4200.00,
        2100.00,
        'ana.martinez@email.com',
        '@anamartinez_pan'
    ),
    -- Client 5: Pedro Sanchez - fully paid, Jan 2026
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000005',
        'Pedro Sánchez',
        'España',
        '2026-01-08',
        'Sofi',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Facebook',
        'Ecommerce',
        'Auto-financiado',
        7500.00,
        7500.00,
        'pedro.sanchez@email.com',
        '@pedrosanchez_ecom'
    ),
    -- Client 6: Laura Fernandez - partially paid, Jan 2026
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000006',
        'Laura Fernández',
        'España',
        '2026-01-20',
        'Neus',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Instagram',
        'Cafetería',
        'Sequra',
        8000.00,
        4000.00,
        'laura.fernandez@email.com',
        '@laurafernandez_cafe'
    ),
    -- Client 7: Diego Torres - fully paid, Feb 2026
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000007',
        'Diego Torres',
        'México',
        '2026-02-14',
        'Jared',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Organic',
        'Herbolario',
        'Auto-financiado',
        2500.00,
        2500.00,
        'diego.torres@email.com',
        '@diegotorres_herbal'
    ),
    -- Client 8: Carmen Ruiz - partially paid, Mar 2026
    (
        'a1b2c3d4-e5f6-7890-abcd-100000000008',
        'Carmen Ruiz',
        'Argentina',
        '2026-03-01',
        'Sofi',
        'Pablo',
        'No Trafficker',
        'No Process Manager',
        'Youtube',
        'Panadería',
        'Transferencia',
        3800.00,
        1900.00,
        'carmen.ruiz@email.com',
        '@carmenruiz_pan'
    );

-- ============================================================
-- DUMMY CLIENT_ROLE_PAYMENTS
-- Setter, trafficker, and procesos payments for some clients
-- ============================================================
INSERT INTO client_role_payments (client_id, role, person_name, amount_paid, date_paid)
VALUES
    -- Juan Garcia - setter commission (Jared)
    ('a1b2c3d4-e5f6-7890-abcd-100000000001', 'setter', 'Jared', 200.00, '2025-09-20'),
    -- Juan Garcia - closer commission (Pablo)
    ('a1b2c3d4-e5f6-7890-abcd-100000000001', 'closer', 'Pablo', 750.00, '2025-09-20'),

    -- Maria Lopez - setter commission (Sofi)
    ('a1b2c3d4-e5f6-7890-abcd-100000000002', 'setter', 'Sofi', 260.00, '2025-10-05'),
    -- Maria Lopez - closer commission (Pablo)
    ('a1b2c3d4-e5f6-7890-abcd-100000000002', 'closer', 'Pablo', 975.00, '2025-10-05'),

    -- Pedro Sanchez - setter commission (Sofi)
    ('a1b2c3d4-e5f6-7890-abcd-100000000005', 'setter', 'Sofi', 450.00, '2026-01-12'),
    -- Pedro Sanchez - closer commission (Pablo)
    ('a1b2c3d4-e5f6-7890-abcd-100000000005', 'closer', 'Pablo', 1125.00, '2026-01-12'),
    -- Pedro Sanchez - trafficker payment
    ('a1b2c3d4-e5f6-7890-abcd-100000000005', 'trafficker', 'No Trafficker', 400.00, '2026-01-15'),
    -- Pedro Sanchez - procesos payment
    ('a1b2c3d4-e5f6-7890-abcd-100000000005', 'procesos', 'No Process Manager', 400.00, '2026-01-15'),

    -- Laura Fernandez - setter commission (Neus)
    ('a1b2c3d4-e5f6-7890-abcd-100000000006', 'setter', 'Neus', 480.00, '2026-01-25'),
    -- Laura Fernandez - closer commission (Pablo)
    ('a1b2c3d4-e5f6-7890-abcd-100000000006', 'closer', 'Pablo', 1200.00, '2026-01-25'),

    -- Diego Torres - setter commission (Jared)
    ('a1b2c3d4-e5f6-7890-abcd-100000000007', 'setter', 'Jared', 100.00, '2026-02-18'),
    -- Diego Torres - closer commission (Pablo)
    ('a1b2c3d4-e5f6-7890-abcd-100000000007', 'closer', 'Pablo', 375.00, '2026-02-18');

-- ============================================================
-- DUMMY CLOSER_KPI RECORDS (Feb & Mar 2026)
-- ============================================================
INSERT INTO closer_kpi (closer_name, date, call_type, calls_scheduled, calls_cancelled, live_calls, offers_made, deposits, closes)
VALUES
    -- Pablo - February 2026, week 1
    ('Pablo', '2026-02-02', 'Llamada de venta', 8, 1, 7, 5, 2, 2),
    ('Pablo', '2026-02-03', 'Demo + Cierre (1 Call Close)', 5, 0, 5, 4, 1, 1),
    -- Pablo - February 2026, week 2
    ('Pablo', '2026-02-09', 'Llamada de venta', 10, 2, 8, 6, 3, 2),
    ('Pablo', '2026-02-10', 'Demo (2 Call Close)', 6, 1, 5, 3, 1, 0),
    ('Pablo', '2026-02-11', 'Cierre (2 Call Close)', 4, 0, 4, 3, 2, 2),
    -- Pablo - February 2026, week 3
    ('Pablo', '2026-02-16', 'Llamada de venta', 9, 1, 8, 7, 3, 3),
    ('Pablo', '2026-02-17', 'Demo + Cierre (1 Call Close)', 7, 2, 5, 4, 2, 1),
    -- Pablo - February 2026, week 4
    ('Pablo', '2026-02-23', 'Llamada de venta', 11, 3, 8, 6, 2, 2),
    ('Pablo', '2026-02-24', 'Demo + Cierre (1 Call Close)', 6, 1, 5, 5, 3, 2),

    -- Pablo - March 2026, week 1
    ('Pablo', '2026-03-02', 'Llamada de venta', 12, 2, 10, 8, 4, 3),
    ('Pablo', '2026-03-03', 'Demo + Cierre (1 Call Close)', 5, 0, 5, 4, 2, 2);

-- ============================================================
-- DUMMY SETTER_KPI RECORDS (Feb & Mar 2026)
-- ============================================================
INSERT INTO setter_kpi (setter_name, date, total_calls, answered, not_answered, not_qualified, whatsapp, proposals, scheduled, follow_ups)
VALUES
    -- Jared - February 2026
    ('Jared', '2026-02-03', 45, 28, 17, 5, 12, 8, 4, 6),
    ('Jared', '2026-02-10', 52, 35, 17, 7, 15, 10, 5, 8),
    ('Jared', '2026-02-17', 38, 22, 16, 4, 10, 7, 3, 5),
    ('Jared', '2026-02-24', 48, 30, 18, 6, 14, 9, 5, 7),

    -- Sofi - February 2026
    ('Sofi', '2026-02-03', 40, 25, 15, 4, 10, 7, 3, 5),
    ('Sofi', '2026-02-10', 55, 38, 17, 8, 16, 12, 6, 9),
    ('Sofi', '2026-02-17', 42, 27, 15, 5, 11, 8, 4, 6),
    ('Sofi', '2026-02-24', 50, 33, 17, 6, 13, 10, 5, 8),

    -- Neus - February 2026
    ('Neus', '2026-02-03', 35, 20, 15, 3, 8, 6, 2, 4),
    ('Neus', '2026-02-10', 43, 28, 15, 5, 12, 9, 4, 6),
    ('Neus', '2026-02-17', 39, 24, 15, 4, 10, 7, 3, 5),
    ('Neus', '2026-02-24', 47, 31, 16, 6, 13, 8, 4, 7),

    -- Jared - March 2026
    ('Jared', '2026-03-02', 50, 32, 18, 6, 14, 10, 5, 7),
    ('Jared', '2026-03-03', 46, 30, 16, 5, 12, 9, 4, 6),

    -- Sofi - March 2026
    ('Sofi', '2026-03-02', 53, 36, 17, 7, 15, 11, 6, 8),
    ('Sofi', '2026-03-03', 48, 31, 17, 5, 13, 10, 5, 7),

    -- Neus - March 2026
    ('Neus', '2026-03-02', 41, 26, 15, 4, 11, 8, 3, 5),
    ('Neus', '2026-03-03', 44, 29, 15, 5, 12, 9, 4, 6);
