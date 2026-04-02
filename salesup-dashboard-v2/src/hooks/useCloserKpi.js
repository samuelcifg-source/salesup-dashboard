import { useSupabaseQuery } from './useSupabaseQuery';

export function useCloserKpi() {
  return useSupabaseQuery('closer_kpi', {
    orderBy: 'date',
    ascending: false,
    realtime: true,
  });
}
