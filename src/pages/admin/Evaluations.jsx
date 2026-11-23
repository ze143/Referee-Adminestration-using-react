import { useState, useMemo, lazy, Suspense } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { useFinishedMatches, useEvaluations } from '@/hooks/useEvaluations'
import EvaluationStats from '@/components/features/evaluations/EvaluationStats'
import EvaluationMatchCard from '@/components/features/evaluations/EvaluationMatchCard'
import { formatDate } from '@/lib/utils'

const EvaluationModal = lazy(() => import('@/components/features/evaluations/EvaluationModal'))

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'evaluated', label: '⭐ مُقيَّمة' },
  { id: 'pending', label: '⏳ في انتظار' },
]

export default function Evaluations() {
  const { data: matches = [], isLoading } = useFinishedMatches()
  const { data: evaluations = [] } = useEvaluations()
  const [filter, setFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)

  // إحصائيات
  const stats = useMemo(() => {
    const evaluatedIds = new Set(evaluations.map((e) => e.match_id))
    const total = matches.length
    const evaluated = matches.filter((m) => evaluatedIds.has(m.id)).length
    const pending = total - evaluated
    const avg = evaluations.length > 0
      ? (evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length).toFixed(1)
      : '-'
    return { total, evaluated, pending, avg }
  }, [matches, evaluations])

  // فلترة
  const filtered = useMemo(() => {
    let result = [...matches]

    // فلتر التابات
    if (filter !== 'all') {
      const evaluatedIds = new Set(evaluations.map((e) => e.match_id))
      if (filter === 'evaluated') {
        result = result.filter((m) => evaluatedIds.has(m.id))
      } else if (filter === 'pending') {
        result = result.filter((m) => !evaluatedIds.has(m.id))
      }
    }

    // فلتر التاريخ
    if (dateFrom) result = result.filter((m) => m.match_date >= dateFrom)
    if (dateTo) result = result.filter((m) => m.match_date <= dateTo)

    // الترتيب: من الأقدم للأحدث
    result.sort((a, b) => new Date(a.match_date) - new Date(b.match_date))

    return result
  }, [matches, evaluations, filter, dateFrom, dateTo])

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقييمات الحكام"
        subtitle={`${stats.total} مباراة منتهية`}
      />

      {/* Stats */}
      <EvaluationStats
        total={stats.total}
        evaluated={stats.evaluated}
        pending={stats.pending}
        avgRating={stats.avg}
      />

      {/* Filter tabs */}
      <div className="glass-card p-2 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-gradient-brand text-white'
                : 'text-white/60 hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* فلتر التاريخ */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">من تاريخ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">إلى تاريخ</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Matches list */}
      <div className="space-y-4">
        {isLoading ? (
          <Spinner size="lg" className="py-16" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="لا توجد مباريات"
            description="لا توجد مباريات منتهية مطابقة للفلتر"
          />
        ) : (
          <EvaluationsGrouped
            matches={filtered}
            evaluations={evaluations}
            onEvaluate={setSelectedMatch}
          />
        )}
      </div>

      {/* Modal */}
      <Suspense fallback={<Spinner />}>
        {selectedMatch && (
          <EvaluationModal
            open
            match={selectedMatch}
            evaluations={evaluations}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </Suspense>
    </div>
  )
}

// تجميع حسب التاريخ — الترتيب من الأقدم للأحدث
function EvaluationsGrouped({ matches, evaluations, onEvaluate }) {
  const grouped = useMemo(() => {
    const groups = {}
    matches.forEach((m) => {
      if (!groups[m.match_date]) groups[m.match_date] = []
      groups[m.match_date].push(m)
    })
    // ترتيب تصاعدي (الأقدم أولاً)
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]))
  }, [matches])

  return (
    <>
      {grouped.map(([date, dateMatches]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-sm font-bold text-gold-500 flex items-center gap-2">
            📅 {formatDate(date)}
            <span className="text-xs text-white/40">({dateMatches.length} مباراة)</span>
          </h3>
          {dateMatches.map((m) => (
            <EvaluationMatchCard
              key={m.id}
              match={m}
              evaluations={evaluations}
              onEvaluate={onEvaluate}
            />
          ))}
        </div>
      ))}
    </>
  )
}