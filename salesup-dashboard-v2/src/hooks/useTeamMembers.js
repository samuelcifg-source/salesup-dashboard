import { useSupabaseQuery } from './useSupabaseQuery';

export function useTeamMembers() {
  return useSupabaseQuery('team_members', {
    orderBy: 'name',
    ascending: true,
    realtime: true,
  });
}
