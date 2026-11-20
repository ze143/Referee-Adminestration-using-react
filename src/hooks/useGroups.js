import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useGroups(stageId) {
  return useQuery({
    queryKey: ['groups', stageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_groups')
        .select('id, name, stage_id')
        .eq('stage_id', stageId)
        .order('name')
      if (error) throw error
      return data || []
    },
    enabled: !!stageId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ stage_id, name }) => {
      const { data, error } = await supabase
        .from('competition_groups')
        .insert([{ stage_id, name }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['groups', vars.stage_id] })
      toast.success('تم إضافة المجموعة')
    },
    onError: (err) => {
      if (err.message?.includes('duplicate')) {
        toast.error('هذه المجموعة موجودة بالفعل')
      } else {
        toast.error(err.message || 'حدث خطأ')
      }
    },
  })
}

export function useUpdateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, stage_id }) => {
      const { error } = await supabase
        .from('competition_groups')
        .update({ name })
        .eq('id', id)
      if (error) throw error
      return { id, name, stage_id }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['groups', vars.stage_id] })
      toast.success('تم تحديث المجموعة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, stage_id }) => {
      const { error } = await supabase.from('competition_groups').delete().eq('id', id)
      if (error) throw error
      return { id, stage_id }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['groups', vars.stage_id] })
      toast.success('تم حذف المجموعة')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

// جلب مجموعات مسابقة (بدون مرحلة محددة)
export function useGroupsByCompetition(competitionId) {
  return useQuery({
    queryKey: ['groups-by-competition', competitionId],
    queryFn: async () => {
      if (!competitionId) return []
      const { data, error } = await supabase
        .from('competition_groups')
        .select(`
          id, name, stage_id,
          stage:competition_stages!competition_groups_stage_id_fkey(competition_id)
        `)
        .order('name')
      if (error) throw error
      return (data || []).filter((g) => g.stage?.competition_id === competitionId)
    },
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000,
  })
}