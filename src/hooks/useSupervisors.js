import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useSupervisors({ onlyVideo = false } = {}) {
  return useQuery({
    queryKey: ['supervisors', { onlyVideo }],
    queryFn: async () => {
      let query = supabase.from('supervisors').select('*').order('full_name')
      if (onlyVideo) {
        query = query.in('supervisor_type', ['video', 'both'])
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ✅ عدد مباريات كل مراقب
export function useSupervisorsMatchCounts() {
  return useQuery({
    queryKey: ['supervisor-match-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('supervisor_id, video_supervisor_id')
      if (error) throw error

      const counts = {}
      data?.forEach((m) => {
        if (m.supervisor_id) counts[m.supervisor_id] = (counts[m.supervisor_id] || 0) + 1
        if (m.video_supervisor_id) counts[m.video_supervisor_id] = (counts[m.video_supervisor_id] || 0) + 1
      })
      return counts
    },
    staleTime: 30_000,
  })
}

// ✅ تفاصيل مراقب + مبارياته
export function useSupervisorDetails(id) {
  return useQuery({
    queryKey: ['supervisor-details', id],
    queryFn: async () => {
      if (!id) return null

      // 1. بيانات المراقب
      const { data: supervisor, error: sErr } = await supabase
        .from('supervisors')
        .select('*')
        .eq('id', id)
        .single()
      if (sErr) throw sErr

      // 2. مبارياته (كمراقب حكام أو فيديو)
      const { data: matches, error: mErr } = await supabase
        .from('matches')
        .select(`
          *,
          competitions(name),
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .or(`supervisor_id.eq.${id},video_supervisor_id.eq.${id}`)
        .order('match_date', { ascending: false })
      if (mErr) throw mErr

      const asRegular = matches?.filter((m) => m.supervisor_id === id).length || 0
      const asVideo = matches?.filter((m) => m.video_supervisor_id === id).length || 0

      return {
        supervisor,
        matches: matches || [],
        stats: {
          total: matches?.length || 0,
          asRegular,
          asVideo,
        },
      }
    },
    enabled: !!id,
  })
}

export function useCreateSupervisor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ full_name, region, phone, supervisor_type }) => {
      const { data, error } = await supabase
        .from('supervisors')
        .insert([{ full_name, region, phone, supervisor_type }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervisors'] })
      toast.success('تم إضافة المراقب')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useUpdateSupervisor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase.from('supervisors').update(data).eq('id', id)
      if (error) throw error
      return { id, ...data }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervisors'] })
      qc.invalidateQueries({ queryKey: ['supervisor-details'] })
      toast.success('تم تحديث المراقب')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useDeleteSupervisor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('supervisors').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervisors'] })
      toast.success('تم حذف المراقب')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}