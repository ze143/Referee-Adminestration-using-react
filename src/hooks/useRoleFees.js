import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// جلب بدلات مسابقة
export function useRoleFees(competitionId) {
  return useQuery({
    queryKey: ['role-fees', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_role_fees')
        .select('*')
        .eq('competition_id', competitionId)
      if (error) throw error
      return data || []
    },
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000,
  })
}

// جلب كل البدلات (للاستخدام في المالية)
export function useAllRoleFees() {
  return useQuery({
    queryKey: ['role-fees-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_role_fees')
        .select('*')
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// حفظ بدلات مسابقة (bulk upsert)
export function useSaveRoleFees() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ competitionId, fees }) => {
      // fees = { main: 500, assistant1: 300, ... }
      const records = Object.entries(fees).map(([role, fee]) => ({
        competition_id: competitionId,
        role,
        fee: parseFloat(fee) || 0,
      }))

      const { error } = await supabase
        .from('competition_role_fees')
        .upsert(records, { onConflict: 'competition_id,role' })

      if (error) throw error
      return records
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['role-fees', vars.competitionId] })
      qc.invalidateQueries({ queryKey: ['role-fees-all'] })
      toast.success('تم حفظ البدلات')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}