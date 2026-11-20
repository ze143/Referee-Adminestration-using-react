import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ============================================
// 1. تقرير الحكام
// ============================================
export function useRefereesReport(filters = {}) {
  return useQuery({
    queryKey: ['report-referees', filters],
    queryFn: async () => {
      // 1. جلب الحكام
      let refQuery = supabase.from('referees').select('*').order('full_name')
      if (filters.region) refQuery = refQuery.eq('region', filters.region)
      if (filters.degree) refQuery = refQuery.eq('degree', filters.degree)
      if (filters.job) refQuery = refQuery.eq('job', filters.job)
      if (filters.status === 'active') refQuery = refQuery.eq('is_suspended', false)
      if (filters.status === 'suspended') refQuery = refQuery.eq('is_suspended', true)
      const { data: referees, error: refErr } = await refQuery
      if (refErr) throw refErr

      // 2. جلب المباريات
      let matchQuery = supabase
        .from('matches')
        .select(`
          id, competition_id, match_date,
          main_referee_id, assistant1_referee_id, assistant2_referee_id,
          fourth_referee_id, var_referee_id, avar_referee_id,
          competitions!inner(name)
        `)
      if (filters.competition_id) matchQuery = matchQuery.eq('competition_id', filters.competition_id)
      if (filters.dateFrom) matchQuery = matchQuery.gte('match_date', filters.dateFrom)
      if (filters.dateTo) matchQuery = matchQuery.lte('match_date', filters.dateTo)
      const { data: matches, error: matchErr } = await matchQuery
      if (matchErr) throw matchErr

      // 3. جلب التقييمات
      const { data: evals, error: evErr } = await supabase
        .from('match_evaluations')
        .select('referee_id, referee_role, rating')
      if (evErr) throw evErr

      // 4. جلب الأعذار
      const { data: excuses, error: excErr } = await supabase
        .from('referee_excuses')
        .select('referee_id, status')
        .eq('status', 'accepted')
      if (excErr) throw excErr

      // 5. جلب الإيقافات
      const { data: susp, error: suspErr } = await supabase
        .from('suspensions_history')
        .select('referee_id')
      if (suspErr) throw suspErr

      // ✅ الحساب
      return referees.map((ref) => {
        const refMatches = matches.filter(
          (m) =>
            m.main_referee_id === ref.id ||
            m.assistant1_referee_id === ref.id ||
            m.assistant2_referee_id === ref.id ||
            m.fourth_referee_id === ref.id ||
            m.var_referee_id === ref.id ||
            m.avar_referee_id === ref.id
        )

        const mainCount = matches.filter((m) => m.main_referee_id === ref.id).length
        const asstCount = matches.filter(
          (m) => m.assistant1_referee_id === ref.id || m.assistant2_referee_id === ref.id
        ).length
        const fourthCount = matches.filter((m) => m.fourth_referee_id === ref.id).length
        const varCount = matches.filter(
          (m) => m.var_referee_id === ref.id || m.avar_referee_id === ref.id
        ).length

        // المباريات حسب المسابقة
        const byComp = {}
        refMatches.forEach((m) => {
          const name = m.competitions?.name || 'غير محدد'
          byComp[name] = (byComp[name] || 0) + 1
        })

        // التقييمات (بدون رابع)
        const countedEvals = evals.filter(
          (e) => e.referee_id === ref.id && e.referee_role !== 'fourth'
        )
        const avgRating =
          countedEvals.length > 0
            ? (countedEvals.reduce((s, e) => s + e.rating, 0) / countedEvals.length).toFixed(1)
            : '-'

        return {
          ...ref,
          matchCount: refMatches.length,
          mainCount,
          asstCount,
          fourthCount,
          varCount,
          byComp,
          excuseCount: excuses.filter((e) => e.referee_id === ref.id).length,
          suspensionCount: susp.filter((s) => s.referee_id === ref.id).length,
          evalCount: countedEvals.length,
          avgRating,
        }
      })
    },
    enabled: filters.run !== false,
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// 2. تقرير المباريات
// ============================================
export function useMatchesReport(filters = {}) {
  return useQuery({
    queryKey: ['report-matches', filters],
    queryFn: async () => {
      let query = supabase
        .from('matches')
        .select(`
          *,
          competitions!inner(name),
          stage:competition_stages!matches_stage_id_fkey(name),
          group:competition_groups!matches_group_id_fkey(name),
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name),
          main_referee:referees!matches_main_referee_id_fkey(full_name),
          assistant1:referees!matches_assistant1_referee_id_fkey(full_name),
          assistant2:referees!matches_assistant2_referee_id_fkey(full_name),
          fourth_referee:referees!matches_fourth_referee_id_fkey(full_name),
          supervisor:supervisors!matches_supervisor_id_fkey(full_name)
        `)
        .order('match_date', { ascending: false })

      if (filters.competition_id) query = query.eq('competition_id', filters.competition_id)
      if (filters.stage_id) query = query.eq('stage_id', filters.stage_id)
      if (filters.group_id) query = query.eq('group_id', filters.group_id)
      if (filters.dateFrom) query = query.gte('match_date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('match_date', filters.dateTo)
      if (filters.status === 'upcoming') {
        query = query.gte('match_date', new Date().toISOString().split('T')[0])
      }
      if (filters.status === 'past') {
        query = query.lt('match_date', new Date().toISOString().split('T')[0])
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    enabled: filters.run !== false,
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// 3. تقرير التقييمات
// ============================================
export function useEvaluationsReport(filters = {}) {
  return useQuery({
    queryKey: ['report-evaluations', filters],
    queryFn: async () => {
      let query = supabase
        .from('match_evaluations')
        .select(`
          *,
          matches!inner(
            id, match_date,
            competitions!inner(id, name),
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name)
          ),
          referees!inner(id, full_name, region, degree, job)
        `)
        .order('created_at', { ascending: false })

      if (filters.competition_id) {
        query = query.eq('matches.competition_id', filters.competition_id)
      }
      if (filters.dateFrom) query = query.gte('matches.match_date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('matches.match_date', filters.dateTo)

      const { data, error } = await query
      if (error) throw error

      // فلترة حسب الدور
      let filtered = data || []
      if (filters.role) {
        filtered = filtered.filter((e) => e.referee_role === filters.role)
      }

      // فلترة حسب حد أدنى
      if (filters.minRating) {
        filtered = filtered.filter((e) => e.rating >= parseInt(filters.minRating))
      }

      // ✅ حساب إحصائيات الحكام
      const refStats = {}
      filtered.forEach((e) => {
        const id = e.referee_id
        if (!refStats[id]) {
          refStats[id] = {
            referee_id: id,
            referee_name: e.referees?.full_name,
            region: e.referees?.region,
            degree: e.referees?.degree,
            job: e.referees?.job,
            count: 0,
            totalRating: 0,
            maxRating: 0,
            minRating: 100,
            byRole: {},
          }
        }
        const s = refStats[id]
        s.count++
        s.totalRating += e.rating
        s.maxRating = Math.max(s.maxRating, e.rating)
        s.minRating = Math.min(s.minRating, e.rating)
        s.byRole[e.referee_role] = (s.byRole[e.referee_role] || 0) + 1
      })

      const refereeStats = Object.values(refStats).map((s) => ({
        ...s,
        avgRating: (s.totalRating / s.count).toFixed(1),
      }))

      // ترتيب حسب المتوسط
      refereeStats.sort((a, b) => b.avgRating - a.avgRating)
      refereeStats.forEach((s, i) => (s.rank = i + 1))

      return {
        evaluations: filtered,
        refereeStats,
        totalCount: filtered.length,
        totalReferees: refereeStats.length,
      }
    },
    enabled: filters.run !== false,
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// 4. تقرير المسابقات
// ============================================
export function useCompetitionsReport(filters = {}) {
  return useQuery({
    queryKey: ['report-competitions', filters],
    queryFn: async () => {
      let query = supabase.from('competitions').select(`
        *,
        stages:competition_stages(id, name, stage_type),
        teams:teams(id),
        matches:matches(id, match_date, is_paid)
      `)

      if (filters.dateFrom || filters.dateTo) {
        // فلترة المباريات
      }

      const { data, error } = await query
      if (error) throw error

      return (data || []).map((c) => {
        let matches = c.matches || []
        if (filters.dateFrom) matches = matches.filter((m) => m.match_date >= filters.dateFrom)
        if (filters.dateTo) matches = matches.filter((m) => m.match_date <= filters.dateTo)

        return {
          ...c,
          teamsCount: c.teams?.length || 0,
          matchesCount: matches.length,
          stagesCount: c.stages?.length || 0,
          paidCount: matches.filter((m) => m.is_paid).length,
        }
      })
    },
    enabled: filters.run !== false,
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// 5. تقرير المالية
// ============================================
export function useFinanceReport(filters = {}) {
  return useQuery({
    queryKey: ['report-finance', filters],
    queryFn: async () => {
      // نفس منطق useFinance، بس مع فلترة
      const { data: roleFees, error: rfErr } = await supabase
        .from('competition_role_fees')
        .select('*')
      if (rfErr) throw rfErr

      const feeMap = {}
      roleFees?.forEach((f) => {
        feeMap[`${f.competition_id}-${f.role}`] = f.fee
      })

      let query = supabase
        .from('matches')
        .select(`
          id, competition_id, is_paid,
          competitions!inner(id, name, payout_source),
          main_referee:referees!matches_main_referee_id_fkey(id, full_name),
          assistant1:referees!matches_assistant1_referee_id_fkey(id, full_name),
          assistant2:referees!matches_assistant2_referee_id_fkey(id, full_name),
          fourth_referee:referees!matches_fourth_referee_id_fkey(id, full_name),
          var_referee:referees!matches_var_referee_id_fkey(id, full_name),
          avar_referee:referees!matches_avar_referee_id_fkey(id, full_name)
        `)
        .eq('competitions.payout_source', 'federation')

      if (filters.competition_id) query = query.eq('competition_id', filters.competition_id)
      if (filters.paid === 'paid') query = query.eq('is_paid', true)
      if (filters.paid === 'unpaid') query = query.eq('is_paid', false)
      if (filters.dateFrom) query = query.gte('match_date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('match_date', filters.dateTo)

      const { data: matches, error } = await query
      if (error) throw error

      // نفس منطق useFinance
      const financeMap = new Map()
      matches?.forEach((m) => {
        const compId = m.competition_id
        const roles = [
          { role: 'main', ref: m.main_referee },
          { role: 'assistant1', ref: m.assistant1 },
          { role: 'assistant2', ref: m.assistant2 },
          { role: 'fourth', ref: m.fourth_referee },
          { role: 'var', ref: m.var_referee },
          { role: 'avar', ref: m.avar_referee },
        ]

        roles.forEach(({ role, ref }) => {
          if (!ref) return
          const fee = feeMap[`${compId}-${role}`] || 0
          const key = ref.id
          if (!financeMap.has(key)) {
            financeMap.set(key, {
              referee_id: ref.id,
              referee_name: ref.full_name,
              matches: 0,
              total: 0,
            })
          }
          const entry = financeMap.get(key)
          entry.matches++
          entry.total += fee
        })
      })

      return Array.from(financeMap.values()).map((e) => ({
        ...e,
        deduction: e.total * 0.1,
        net: e.total * 0.9,
      }))
    },
    enabled: filters.run !== false,
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// 6. تقرير المراقبين
// ============================================
export function useSupervisorsReport(filters = {}) {
  return useQuery({
    queryKey: ['report-supervisors', filters],
    queryFn: async () => {
      const { data: sups, error: supErr } = await supabase
        .from('supervisors')
        .select('*')
        .order('full_name')
      if (supErr) throw supErr

      let query = supabase
        .from('matches')
        .select('id, supervisor_id, video_supervisor_id, match_date')
      if (filters.dateFrom) query = query.gte('match_date', filters.dateFrom)
      if (filters.dateTo) query = query.lte('match_date', filters.dateTo)

      const { data: matches, error } = await query
      if (error) throw error

      return sups.map((s) => {
        const supMatches = matches.filter((m) => m.supervisor_id === s.id)
        const vidMatches = matches.filter((m) => m.video_supervisor_id === s.id)
        return {
          ...s,
          supervisorMatches: supMatches.length,
          videoMatches: vidMatches.length,
          totalMatches: supMatches.length + vidMatches.length,
        }
      })
    },
    enabled: filters.run !== false,
    staleTime: 2 * 60 * 1000,
  })
}