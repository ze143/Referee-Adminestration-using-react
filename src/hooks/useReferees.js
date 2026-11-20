import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const PAGE_SIZE = 30

// ============================================
// جلب الحكام (مع Pagination)
// ============================================
export function useReferees({ page = 0, pageSize = PAGE_SIZE, filters = {} } = {}) {
  return useQuery({
    queryKey: ['referees', page, pageSize, filters],
    queryFn: async () => {
      let query = supabase
        .from('referees')
        .select('*', { count: 'exact' })
        .order('full_name')
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }
      if (filters.region) query = query.eq('region', filters.region)
      if (filters.degree) query = query.eq('degree', filters.degree)
      if (filters.job) query = query.eq('job', filters.job)
      if (filters.status === 'active') query = query.eq('is_suspended', false)
      if (filters.status === 'suspended') query = query.eq('is_suspended', true)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data || [], total: count || 0 }
    },
    staleTime: 1000 * 60,
    keepPreviousData: true,
  })
}

// ============================================
// جلب سجل إيقافات حكم
// ============================================
export function useSuspensions(refereeId) {
  return useQuery({
    queryKey: ['suspensions', refereeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suspensions_history')
        .select('*')
        .eq('referee_id', refereeId)
        .order('start_date', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!refereeId,
    staleTime: 30_000,
  })
}

// ============================================
// باقي الـ mutations
// ============================================
export function useCreateReferee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('referees')
        .insert([data])
        .select()
        .single()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referees'] })
      toast.success('تم إضافة الحكم بنجاح')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useUpdateReferee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { data: result, error } = await supabase
        .from('referees')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referees'] })
      toast.success('تم تحديث بيانات الحكم')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

export function useDeleteReferee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('referees').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referees'] })
      toast.success('تم حذف الحكم')
    },
    onError: (err) => toast.error(err.message || 'حدث خطأ'),
  })
}

// ============================================
// ✅ إيقاف / إلغاء إيقاف حكم — مع تسجيل في suspensions_history
// ============================================
export function useToggleSuspension() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_suspended, reason, startDate, endDate }) => {
      // 1. حدّث referees
      const updateData = is_suspended
        ? {
            is_suspended: true,
            suspension_reason: reason,
            suspension_until: endDate,
          }
        : {
            is_suspended: false,
            suspension_reason: null,
            suspension_until: null,
          }

      const { error: updateError } = await supabase
        .from('referees')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      // 2. لو إيقاف جديد → سجّل في suspensions_history
      if (is_suspended) {
        const { error: insertError } = await supabase
          .from('suspensions_history')
          .insert([
            {
              referee_id: id,
              reason,
              start_date: startDate,
              end_date: endDate,   // NOT NULL
            },
          ])

        if (insertError) throw insertError
      }

      return { id, is_suspended }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['referees'] })
      qc.invalidateQueries({ queryKey: ['suspensions', vars.id] })
      toast.success(
        vars.is_suspended ? 'تم إيقاف الحكم' : 'تم إلغاء الإيقاف'
      )
    },
    onError: (err) => {
      toast.error(err.message || 'حدث خطأ')
    },
  })
}

// ✅ عدد مباريات كل حكم في مسابقة معينة
export function useRefereeMatchCounts(competitionId) {
  return useQuery({
    queryKey: ['referee-match-counts', competitionId],
    queryFn: async () => {
      if (!competitionId) return {}

      const { data, error } = await supabase
        .from('matches')
        .select(`
          main_referee_id,
          assistant1_referee_id,
          assistant2_referee_id,
          fourth_referee_id,
          var_referee_id,
          avar_referee_id
        `)
        .eq('competition_id', competitionId)

      if (error) throw error

      // ✅ احسب عدد المباريات لكل حكم
      const counts = {}
      data?.forEach((m) => {
        const ids = [
          m.main_referee_id,
          m.assistant1_referee_id,
          m.assistant2_referee_id,
          m.fourth_referee_id,
          m.var_referee_id,
          m.avar_referee_id,
        ].filter(Boolean)

        ids.forEach((id) => {
          counts[id] = (counts[id] || 0) + 1
        })
      })

      return counts
    },
    enabled: !!competitionId,
    staleTime: 30_000,
  })
}