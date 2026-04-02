import { useSupabaseQuery } from './useSupabaseQuery';

export function useClients() {
  return useSupabaseQuery('clients', {
    orderBy: 'start_date',
    ascending: false,
    realtime: true,
  });
}
