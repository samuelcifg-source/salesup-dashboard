import { useSupabaseQuery } from './useSupabaseQuery';

export function useTeamPayments() {
  return useSupabaseQuery('team_payments', {
    orderBy: 'date',
    ascending: false,
    realtime: true,
  });
}
