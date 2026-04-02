import { useSupabaseQuery } from './useSupabaseQuery';

export function useSetterKpi() {
  return useSupabaseQuery('setter_kpi', {
    orderBy: 'date',
    ascending: false,
    realtime: true,
  });
}
