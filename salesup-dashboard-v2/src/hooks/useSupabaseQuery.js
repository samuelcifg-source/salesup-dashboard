import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export function useSupabaseQuery(table, { columns = '*', orderBy = 'created_at', ascending = false, realtime = false } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from(table)
      .select(columns)
      .order(orderBy, { ascending });
    if (err) setError(err);
    else setData(rows || []);
    setLoading(false);
  }, [table, columns, orderBy, ascending]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!realtime) return;
    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [table, realtime, fetch]);

  const insert = useCallback(async (row) => {
    const { data: d, error: e } = await supabase.from(table).insert(row).select();
    if (!e) await fetch();
    return { data: d, error: e };
  }, [table, fetch]);

  const update = useCallback(async (id, changes) => {
    const { data: d, error: e } = await supabase.from(table).update(changes).eq('id', id).select();
    if (!e) await fetch();
    return { data: d, error: e };
  }, [table, fetch]);

  const remove = useCallback(async (id) => {
    const { error: e } = await supabase.from(table).delete().eq('id', id);
    if (!e) await fetch();
    return { error: e };
  }, [table, fetch]);

  return { data, loading, error, refresh: fetch, insert, update, remove };
}
