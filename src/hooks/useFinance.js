import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { DEDUCTION_RATE } from '@/lib/finance-config'

export function useFinance() {
  return useQuery({
    queryKey: ['finance'],
    queryFn: async () => {
      // 1. جلب البدلات
      const { data: roleFees, error: rfErr } = await supabase
        .from('competition_role_fees')
        .select('*')
      if (rfErr) throw rfErr

      // ✅ map: `${compId}-${role}` → fee
      const feeMap = {}
      roleFees?.forEach((f) => {
        feeMap[`${f.competition_id}-${f.role}`] = f.fee
      })

      // 2. جلب المباريات غير المدفوعة
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id, competition_id, is_paid,
          competitions!inner(id, name, match_fee, payout_source),
          main_referee:referees!matches_main_referee_id_fkey(id, full_name),
          assistant1:referees!matches_assistant1_referee_id_fkey(id, full_name),
          assistant2:referees!matches_assistant2_referee_id_fkey(id, full_name),
          fourth_referee:referees!matches_fourth_referee_id_fkey(id, full_name),
          var_referee:referees!matches_var_referee_id_fkey(id, full_name),
          avar_referee:referees!matches_avar_referee_id_fkey(id, full_name)
        `)
        .eq('is_paid', false)
        .eq('competitions.payout_source', 'federation')

      if (error) throw error

      // 3. حساب البدل لكل حكم
      const financeMap = new Map()

      matches?.forEach((match) => {
        const compId = match.competition_id
        const compName = match.competitions?.name || 'غير محدد'

        const roles = [
          { role: 'main', ref: match.main_referee },
          { role: 'assistant1', ref: match.assistant1 },
          { role: 'assistant2', ref: match.assistant2 },
          { role: 'fourth', ref: match.fourth_referee },
          { role: 'var', ref: match.var_referee },
          { role: 'avar', ref: match.avar_referee },
        ]

        roles.forEach(({ role, ref }) => {
          if (!ref) return

          // ✅ البدل من الجدول
          const roleFee = feeMap[`${compId}-${role}`] || 0

          const key = ref.id
          if (!financeMap.has(key)) {
            financeMap.set(key, {
              referee_id: ref.id,
              referee_name: ref.full_name,
              role_breakdown: {
                main: { count: 0, fee: 0 },
                assistant1: { count: 0, fee: 0 },
                assistant2: { count: 0, fee: 0 },
                fourth: { count: 0, fee: 0 },
                var: { count: 0, fee: 0 },
                avar: { count: 0, fee: 0 },
              },
              competitions: new Map(),
              total_matches: 0,
              total_fee: 0,
              total_deduction: 0,
              net_amount: 0,
              match_ids: [],
            })
          }

          const entry = financeMap.get(key)

          entry.role_breakdown[role].count += 1
          entry.role_breakdown[role].fee += roleFee

          if (!entry.competitions.has(compId)) {
            entry.competitions.set(compId, {
              id: compId,
              name: compName,
              matches: 0,
              fee: 0,
              roles: {
                main: { count: 0, fee: 0 },
                assistant1: { count: 0, fee: 0 },
                assistant2: { count: 0, fee: 0 },
                fourth: { count: 0, fee: 0 },
                var: { count: 0, fee: 0 },
                avar: { count: 0, fee: 0 },
              },
            })
          }

          const compData = entry.competitions.get(compId)
          compData.matches += 1
          compData.fee += roleFee
          compData.roles[role].count += 1
          compData.roles[role].fee += roleFee

          entry.total_matches += 1
          entry.total_fee += roleFee
          entry.match_ids.push(match.id)
        })
      })

      // حساب الخصم
      const financeData = Array.from(financeMap.values()).map((entry) => {
        const deduction = entry.total_fee * DEDUCTION_RATE
        return {
          ...entry,
          total_deduction: deduction,
          net_amount: entry.total_fee - deduction,
          competitions: Array.from(entry.competitions.values()),
        }
      })

      return financeData
    },
    staleTime: 30 * 1000,
  })
}