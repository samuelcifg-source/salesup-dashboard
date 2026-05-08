import { useSupabaseQuery } from './useSupabaseQuery';

export function useTeamMemberPayments() {
  return useSupabaseQuery('team_member_payments', {
    orderBy: 'payment_date',
    ascending: false,
    realtime: true,
  });
}
