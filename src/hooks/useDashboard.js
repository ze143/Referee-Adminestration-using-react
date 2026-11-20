
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],

    queryFn: async () => {
      const now = new Date()

      const today = now.toISOString().split('T')[0]

      const firstOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString().split('T')[0]

      const lastOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString().split('T')[0]

      const { data, error } = await supabase.rpc(
        'get_dashboard_stats',
        {
          p_first_of_month: firstOfMonth,
          p_last_of_month: lastOfMonth,
          p_today: today,
        }
      )

      if (error) {
        throw error
      }

      return data
    },

    staleTime: 2 * 60 * 1000,
  })
}

export function useRecentMatches() {
  return useQuery({
    queryKey: ['recent-matches'],

    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          match_time,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .order('match_date', { ascending: false })
        .limit(5)

      if (error) {
        throw error
      }

      return data || []
    },

    staleTime: 2 * 60 * 1000,
  })
}
