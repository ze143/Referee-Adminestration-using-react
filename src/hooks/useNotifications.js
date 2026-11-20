import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export function useNotifications() {
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const role = profile?.role || 'viewer'

  return useQuery({
    queryKey: ['notifications', role, user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const notifications = []

      // ✅ جلب صلاحيات المحرر (لو editor)
      let editorScope = null
      if (role === 'editor' && user) {
        const { data } = await supabase
          .from('editor_permissions')
          .select(`
            *,
            competitions(id, name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        editorScope = data
      }

      // ✅ رابط المباريات حسب الدور
      const matchesLink =
        role === 'editor'
          ? '/editor/matches'
          : role === 'viewer'
          ? '/viewer/matches'
          : '/admin/matches'

      // ✅ رابط الحكام حسب الدور
      const refereesLink =
        role === 'editor'
          ? '/editor/referees'
          : role === 'viewer'
          ? '/viewer/referees'
          : '/admin/referees'

      // ============================================
      // 1. مباريات اليوم (لكل الأدوار)
      // ============================================
      let matchQuery = supabase
        .from('matches')
        .select(`
          id, match_date, match_time, stadium,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .eq('match_date', today)
        .order('match_time')
        .limit(10)

      // ✅ فلترة المحرر حسب صلاحياته
      if (role === 'editor' && editorScope?.competition_id) {
        matchQuery = matchQuery.eq('competition_id', editorScope.competition_id)
      }

      const { data: todayMatches } = await matchQuery

      todayMatches?.forEach((m) => {
        notifications.push({
          id: `today-${m.id}`,
          type: 'info',
          title: '⚽ مباراة اليوم',
          message: `${m.home_team?.name} × ${m.away_team?.name} — ${formatTime(m.match_time)}`,
          time: new Date(),
          date: m.match_date,
          read: false,
          link: matchesLink,
          category: 'matches',
        })
      })

      // ============================================
      // 2. مباريات بدون تعيين (أدمن + محرر)
      // ============================================
      if (role === 'admin' || role === 'editor') {
        let pendingQuery = supabase
          .from('matches')
          .select(`
            id, match_date, match_time,
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name)
          `)
          .gte('match_date', today)

        if (role === 'admin') {
          pendingQuery = pendingQuery.is('main_referee_id', null)
        } else if (role === 'editor') {
          // ✅ المحرر: مباريات ناقصة مساعدين
          pendingQuery = pendingQuery.or(
            'assistant1_referee_id.is.null,assistant2_referee_id.is.null'
          )
          if (editorScope?.competition_id) {
            pendingQuery = pendingQuery.eq('competition_id', editorScope.competition_id)
          }
        }

        const { data: pendingMatches } = await pendingQuery.limit(10)

        pendingMatches?.forEach((m) => {
          notifications.push({
            id: `pending-${m.id}`,
            type: 'warning',
            title:
              role === 'admin'
                ? '⚠️ مباراة بدون حكم رئيسي'
                : '⚠️ مباراة بحاجة لتعيين مساعدين',
            message: `${m.home_team?.name} × ${m.away_team?.name} — ${m.match_date}`,
            time: new Date(),
            date: m.match_date,
            read: false,
            link: matchesLink,
            category: 'matches',
          })
        })
      }

      // ============================================
      // 3. حكام موقوفين (أدمن فقط)
      // ============================================
      if (role === 'admin') {
        const { data: suspended } = await supabase
          .from('referees')
          .select('id, full_name, suspension_until')
          .eq('is_suspended', true)
          .limit(10)

        suspended?.forEach((r) => {
          notifications.push({
            id: `suspended-${r.id}`,
            type: 'danger',
            title: '🚫 حكم موقوف',
            message: `${r.full_name}${
              r.suspension_until ? ` — حتى ${r.suspension_until}` : ''
            }`,
            time: new Date(),
            read: false,
            link: refereesLink,
            category: 'referees',
          })
        })
      }

      // ============================================
      // 4. أعذار جديدة (أدمن فقط)
      // ============================================
      if (role === 'admin') {
        const { data: excuses } = await supabase
          .from('referee_excuses')
          .select(`
            id, reason, excuse_date,
            referees!inner(full_name)
          `)
          .eq('status', 'pending')
          .gte('excuse_date', today)
          .limit(10)

        excuses?.forEach((e) => {
          notifications.push({
            id: `excuse-${e.id}`,
            type: 'warning',
            title: '📝 عذر جديد',
            message: `${e.referees?.full_name} — ${e.reason}`,
            time: new Date(),
            date: e.excuse_date,
            read: false,
            link: refereesLink,
            category: 'referees',
          })
        })
      }

      // ============================================
      // 5. تعارضات (كل الأدوار)
      // ============================================
      let conflictQuery = supabase
        .from('matches')
        .select(`
          id, match_date,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .eq('has_conflict', true)
        .gte('match_date', today)
        .limit(10)

      if (role === 'editor' && editorScope?.competition_id) {
        conflictQuery = conflictQuery.eq('competition_id', editorScope.competition_id)
      }

      const { data: conflicts } = await conflictQuery

      conflicts?.forEach((m) => {
        notifications.push({
          id: `conflict-${m.id}`,
          type: 'danger',
          title: '⚠️ تعارض في التوقيت',
          message: `${m.home_team?.name} × ${m.away_team?.name} — ${m.match_date}`,
          time: new Date(),
          date: m.match_date,
          read: false,
          link: matchesLink,
          category: 'matches',
        })
      })

      // ============================================
      // 6. (Viewer فقط) تقارير جديدة
      // ============================================
      if (role === 'viewer') {
        const { data: recentMatches } = await supabase
          .from('matches')
          .select('id, match_date')
          .lt('match_date', today)
          .order('match_date', { ascending: false })
          .limit(3)

        if (recentMatches && recentMatches.length > 0) {
          notifications.push({
            id: 'new-reports',
            type: 'info',
            title: '📊 تقارير جديدة متاحة',
            message: `${recentMatches.length} مباراة منتهية جديدة`,
            time: new Date(),
            read: false,
            link: '/viewer/reports',
            category: 'reports',
          })
        }
      }

      // لو مفيش
      if (notifications.length === 0) {
        notifications.push({
          id: 'no-notifications',
          type: 'success',
          title: '✅ كل شيء على ما يرام',
          message:
            role === 'viewer' ? 'لا توجد تقارير جديدة' : 'لا توجد إشعارات جديدة',
          time: new Date(),
          read: true,
          link: null,
          category: 'system',
        })
      }

      // ترتيب حسب التاريخ
      notifications.sort((a, b) => {
        if (a.date && b.date) return new Date(b.date) - new Date(a.date)
        return 0
      })

      return notifications
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: !!role,
  })
}