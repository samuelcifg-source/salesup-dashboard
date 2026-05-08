import { supabase } from '../config/supabase';

const BUCKET = 'payment-receipts';

// Sube un File al bucket y devuelve { path, signedUrl } o { error }.
export async function uploadReceipt(file, memberId) {
  if (!file) return { error: new Error('No file') };
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${memberId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { error };
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
  return { path, signedUrl: data?.signedUrl ?? null };
}

// Genera una URL firmada nueva a partir del path almacenado en BD.
export async function getReceiptUrl(path, ttlSeconds = 60 * 60) {
  if (!path) return null;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, ttlSeconds);
  return data?.signedUrl ?? null;
}

// Borra el justificante del bucket.
export async function removeReceipt(path) {
  if (!path) return { error: null };
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { error };
}
