import { useSupabaseQuery } from './useSupabaseQuery';

export function useExpenses() {
  return useSupabaseQuery('expenses', {
    orderBy: 'date',
    ascending: false,
    realtime: true,
  });
}
