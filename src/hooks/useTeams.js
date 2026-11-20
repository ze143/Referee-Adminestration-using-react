import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useTeams(competitionId, { stageId, groupId } = {}) {
  return useQuery({
    queryKey: ['teams', competitionId, stageId, groupId],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select(`
          id, name, competition_id, stage_id, group_id,
          stage:competition_stages!teams_stage_id_fkey(id, name),
          group:competition_groups!teams_group_id_fkey(id, name)
        `)
        .eq('competition_id', competitionId)
        .order('name')

      if (stageId) query = query.eq('stage_id', stageId)
      if (groupId) query = query.eq('group_id', groupId)

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ competition_id, name, stage_id = null, group_id = null }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ competition_id, name, stage_id, group_id }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] })
      toast.success('تم إضافة الفريق')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useUpdateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase.from('teams').update(data).eq('id', id)
      if (error) throw error
      return { id, ...data }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] })
      toast.success('تم تحديث الفريق')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useDeleteTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('teams').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] })
      toast.success('تم حذف الفريق')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}