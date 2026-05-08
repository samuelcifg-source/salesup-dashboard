-- ============================================================
-- 010 — Storage policies for payment receipts
-- Bucket name: payment-receipts
--
-- IMPORTANT: el bucket hay que crearlo desde la UI de Supabase
-- (Storage → New bucket → name: payment-receipts) o vía CLI antes
-- de aplicar estas policies. Recomendado: bucket privado y URLs
-- firmadas; estas policies sirven para ese caso.
-- ============================================================

CREATE POLICY "payment_receipts_upload"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "payment_receipts_read"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'payment-receipts');

CREATE POLICY "payment_receipts_update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'payment-receipts')
    WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "payment_receipts_delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'payment-receipts');
