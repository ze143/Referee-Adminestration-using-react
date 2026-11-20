import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useStages(competitionId) {
  return useQuery({
    queryKey: ['stages', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_stages')
        .select('*')
        .eq('competition_id', competitionId)
        .order('order_num')
        .order('name')
      if (error) throw error
      return data || []
    },
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('competition_stages')
        .insert([data])
        .select()
        .single()
      if (error) throw error
      return result
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stages', vars.competition_id] })
      toast.success('تم إضافة المرحلة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useUpdateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, competition_id, ...data }) => {
      const { error } = await supabase
        .from('competition_stages')
        .update(data)
        .eq('id', id)
      if (error) throw error
      return { id, competition_id }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stages', vars.competition_id] })
      toast.success('تم تحديث المرحلة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useDeleteStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, competition_id }) => {
      const { error } = await supabase.from('competition_stages').delete().eq('id', id)
      if (error) throw error
      return { id, competition_id }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stages', vars.competition_id] })
      toast.success('تم حذف المرحلة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}