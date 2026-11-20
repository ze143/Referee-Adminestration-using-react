import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, age_category, payout_source, match_fee')
        .order('name')
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCompetition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('competitions')
        .insert([data])
        .select()
        .single()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('تم إضافة المسابقة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useUpdateCompetition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase.from('competitions').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('تم تحديث المسابقة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useDeleteCompetition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('competitions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('تم حذف المسابقة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}