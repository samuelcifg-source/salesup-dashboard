import { useSupabaseQuery } from './useSupabaseQuery';

export function useLeadEvents() {
  return useSupabaseQuery('lead_events', {
    orderBy: 'created_at',
    ascending: false,
  });
}
