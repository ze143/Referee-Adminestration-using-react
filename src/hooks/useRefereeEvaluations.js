import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRefereeEvaluations(refereeId) {
  return useQuery({
    queryKey: ['referee-evaluations', refereeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_evaluations')
        .select(`
          *,
          matches!inner(
            id, match_date, match_time,
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name),
            competitions!inner(name)
          )
        `)
        .eq('referee_id', refereeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!refereeId,
    staleTime: 5 * 60 * 1000,
  })
}