import { useMemo } from 'react'
import { Star, TrendingUp, AlertTriangle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { useRefereeEvaluations } from '@/hooks/useRefereeEvaluations'
import { formatDate } from '@/lib/utils'

const ROLE_LABELS = {
  main: 'رئيسي',
  assistant1: 'مساعد 1',
  assistant2: 'مساعد 2',
  fourth: 'رابع',
  var: 'VAR',
  avar: 'AVAR',
}

const ROLE_VARIANTS = {
  main: 'primary',
  assistant1: 'success',
  assistant2: 'success',
  fourth: 'warning',
  var: 'danger',
  avar: 'danger',
}

export default function RefereeEvaluationsSection({ refereeId }) {
  const { data: evaluations = [], isLoading } = useRefereeEvaluations(refereeId)

  const stats = useMemo(() => {
    // ✅ التقييمات المحسوبة (بدون رابع)
    const counted = evaluations.filter((e) => e.referee_role !== 'fourth')
    // ✅ تقييمات الرابع
    const fourth = evaluations.filter((e) => e.referee_role === 'fourth')

    const avgRating = counted.length > 0
      ? (counted.reduce((s, e) => s + e.rating, 0) / counted.length).toFixed(1)
      : '-'

    const maxRating = counted.length > 0
      ? Math.max(...counted.map((e) => e.rating))
      : '-'

    const minRating = counted.length > 0
      ? Math.min(...counted.map((e) => e.rating))
      : '-'

    return {
      counted,
      fourth,
      avgRating,
      maxRating,
      minRating,
      total: evaluations.length,
    }
  }, [evaluations])

  if (isLoading) {
    return <Spinner className="py-8" />
  }

  if (evaluations.length === 0) {
    return <EmptyState title="لا توجد تقييمات لهذا الحكم" />
  }

  return (
    <div className="space-y-4">
      {/* ============ إحصائيات التقييم ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* التقييم العام */}
        <div className="glass-card p-4 text-center border-2 border-yellow-500/30">
          <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-yellow-400">{stats.avgRating}</div>
          <div className="text-xs text-white/60 mt-1">التقييم العام</div>
          <div className="text-xs text-white/40 mt-1">
            ({stats.counted.length} تقييم محسوب)
          </div>
        </div>

        {/* أعلى تقييم */}
        <div className="glass-card p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-green-400">{stats.maxRating}</div>
          <div className="text-xs text-white/60 mt-1">أعلى تقييم</div>
        </div>

        {/* أقل تقييم */}
        <div className="glass-card p-4 text-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <div className="text-3xl font-bold text-red-400">{stats.minRating}</div>
          <div className="text-xs text-white/60 mt-1">أقل تقييم</div>
        </div>

        {/* إجمالي */}
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-white/60">{stats.total}</div>
          <div className="text-xs text-white/60 mt-1">إجمالي التقييمات</div>
          {stats.fourth.length > 0 && (
            <div className="text-xs text-white/40 mt-1">
              (منها {stats.fourth.length} كرابع)
            </div>
          )}
        </div>
      </div>

      {/* ============ ملاحظة عن الحكم الرابع ============ */}
      {stats.fourth.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-300">
            <strong>ملاحظة:</strong> الحكم لديه <strong>{stats.fourth.length}</strong> تقييم كحكم رابع،
            لكنها <strong>غير محسوبة</strong> في التقييم العام لأنه دور ثانوي.
          </div>
        </div>
      )}

      {/* ============ سجل التقييمات ============ */}
      <div>
        <h4 className="text-sm font-bold text-gold-500 mb-3">
          سجل التقييمات ({evaluations.length})
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-2 px-3 text-gold-500 text-xs">التاريخ</th>
                <th className="text-right py-2 px-3 text-gold-500 text-xs">المباراة</th>
                <th className="text-right py-2 px-3 text-gold-500 text-xs">المسابقة</th>
                <th className="text-right py-2 px-3 text-gold-500 text-xs">الدور</th>
                <th className="text-right py-2 px-3 text-gold-500 text-xs">التقييم</th>
                <th className="text-right py-2 px-3 text-gold-500 text-xs">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((e) => {
                const isFourth = e.referee_role === 'fourth'
                const rating = e.rating

                // لون التقييم
                let ratingColor = 'text-green-400'
                if (rating < 60) ratingColor = 'text-red-400'
                else if (rating < 70) ratingColor = 'text-orange-400'
                else if (rating < 80) ratingColor = 'text-yellow-400'
                else if (rating < 90) ratingColor = 'text-blue-400'

                return (
                  <tr
                    key={e.id}
                    className={`border-b border-white/5 ${
                      isFourth ? 'bg-white/[0.02] opacity-70' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-white/70 text-xs">
                      {formatDate(e.matches?.match_date)}
                    </td>
                    <td className="py-2 px-3 text-white/80">
                      {e.matches?.home_team?.name} × {e.matches?.away_team?.name}
                    </td>
                    <td className="py-2 px-3 text-white/60 text-xs">
                      {e.matches?.competitions?.name}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant={ROLE_VARIANTS[e.referee_role]} size="sm">
                        {ROLE_LABELS[e.referee_role]}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`font-bold text-lg ${ratingColor}`}>
                        {rating}
                      </span>
                      <span className="text-white/40 text-xs mr-1">/ 100</span>
                      {isFourth && (
                        <div className="text-xs text-yellow-400/60 mt-0.5">
                          غير محسوب
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-white/50 text-xs max-w-xs truncate" title={e.notes}>
                      {e.notes || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}