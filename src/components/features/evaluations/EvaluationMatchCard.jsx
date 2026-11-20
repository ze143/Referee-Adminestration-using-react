import { memo } from 'react'
import { Star, Clock, MapPin, Trophy } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, formatTime } from '@/lib/utils'

const ROLE_LABELS = {
  main: 'رئيسي',
  assistant1: 'مساعد 1',
  assistant2: 'مساعد 2',
  fourth: 'رابع',
  var: 'VAR',
  avar: 'AVAR',
}

const ROLE_COLORS = {
  main: 'bg-blue-500/20 text-blue-300',
  assistant1: 'bg-green-500/20 text-green-300',
  assistant2: 'bg-green-500/20 text-green-300',
  fourth: 'bg-yellow-500/20 text-yellow-300',
  var: 'bg-red-500/20 text-red-300',
  avar: 'bg-red-500/20 text-red-300',
}

function EvaluationMatchCard({ match, evaluations, onEvaluate }) {
  const matchEvals = evaluations.filter((e) => e.match_id === match.id)
  const isEvaluated = matchEvals.length > 0
  const avgRating = isEvaluated
    ? (matchEvals.reduce((s, e) => s + e.rating, 0) / matchEvals.length).toFixed(1)
    : null

  const referees = [
    { role: 'main', data: match.main_referee },
    { role: 'assistant1', data: match.assistant1 },
    { role: 'assistant2', data: match.assistant2 },
    { role: 'fourth', data: match.fourth_referee },
    { role: 'var', data: match.var_referee },
    { role: 'avar', data: match.avar_referee },
  ].filter((r) => r.data)

  return (
    <div
      className={`glass-card p-4 ${
        isEvaluated ? 'border-r-4 border-r-yellow-500' : 'border-r-4 border-r-green-500'
      }`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* الفرق */}
          <div className="text-lg font-bold text-white mb-2">
            {match.home_team?.name} <span className="text-red-400 mx-2">×</span>{' '}
            {match.away_team?.name}
          </div>

          {/* المعلومات */}
          <div className="flex flex-wrap gap-3 text-xs text-white/60 mb-3">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {match.competitions?.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(match.match_time)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match.stadium}
            </span>
          </div>

          {/* الحكام */}
          <div className="flex flex-wrap gap-1">
            {referees.map((r) => (
              <span
                key={r.role}
                className={`text-xs px-2 py-1 rounded ${ROLE_COLORS[r.role]}`}
                title={ROLE_LABELS[r.role]}
              >
                {r.data.full_name}
              </span>
            ))}
          </div>
        </div>

        {/* التقييم */}
        <div className="text-center">
          {isEvaluated ? (
            <>
              <div className="text-3xl font-bold text-yellow-400">{avgRating}</div>
              <div className="text-xs text-white/40">متوسط التقييم</div>
              <div className="text-xs text-white/40">({matchEvals.length} تقييم)</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-white/20">—</div>
              <div className="text-xs text-white/40">لم يتم التقييم</div>
            </>
          )}
        </div>

        <Button
          size="sm"
          variant={isEvaluated ? 'warning' : 'primary'}
          icon={Star}
          onClick={() => onEvaluate(match)}
        >
          {isEvaluated ? 'تعديل' : 'تقييم'}
        </Button>
      </div>
    </div>
  )
}

export default memo(EvaluationMatchCard)