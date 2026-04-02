import { useSupabaseQuery } from './useSupabaseQuery';

export function useClientRolePayments() {
  return useSupabaseQuery('client_role_payments', {
    orderBy: 'created_at',
    ascending: false,
    realtime: true,
  });
}
