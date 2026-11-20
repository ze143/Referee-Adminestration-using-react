import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// ============================================
// جلب المباريات المنتهية + تقييماتها
// ============================================
export function useFinishedMatches() {
  return useQuery({
    queryKey: ['finished-matches'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, match_date, match_time, stadium, competition_id,
          competitions!inner(name),
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name),
          main_referee:referees!matches_main_referee_id_fkey(id, full_name),
          assistant1:referees!matches_assistant1_referee_id_fkey(id, full_name),
          assistant2:referees!matches_assistant2_referee_id_fkey(id, full_name),
          fourth_referee:referees!matches_fourth_referee_id_fkey(id, full_name),
          var_referee:referees!matches_var_referee_id_fkey(id, full_name),
          avar_referee:referees!matches_avar_referee_id_fkey(id, full_name)
        `)
        .lt('match_date', today)
        .order('match_date', { ascending: false })

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================
// جلب كل التقييمات
// ============================================
export function useEvaluations() {
  return useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('match_evaluations').select('*')
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================
// حفظ تقييمات مباراة
// ============================================
export function useSaveEvaluations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ matchId, evaluations }) => {
      // 1. حذف التقييمات القديمة
      const { error: delErr } = await supabase
        .from('match_evaluations')
        .delete()
        .eq('match_id', matchId)
      if (delErr) throw delErr

      // 2. إضافة الجديدة
      if (evaluations.length > 0) {
        const { error: insErr } = await supabase
          .from('match_evaluations')
          .insert(evaluations)
        if (insErr) throw insErr
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['evaluations'] })
      toast.success('تم حفظ التقييمات')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}