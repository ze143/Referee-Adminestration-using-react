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
    if (filter === 'all') return matches
    const evaluatedIds = new Set(evaluations.map((e) => e.match_id))
    if (filter === 'evaluated') return matches.filter((m) => evaluatedIds.has(m.id))
    if (filter === 'pending') return matches.filter((m) => !evaluatedIds.has(m.id))
    return matches
  }, [matches, evaluations, filter])

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

// تجميع حسب التاريخ
function EvaluationsGrouped({ matches, evaluations, onEvaluate }) {
  const grouped = useMemo(() => {
    const groups = {}
    matches.forEach((m) => {
      if (!groups[m.match_date]) groups[m.match_date] = []
      groups[m.match_date].push(m)
    })
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
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