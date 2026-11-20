import { useRecentMatches } from '@/hooks/useDashboard'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { formatDate, formatTime } from '@/lib/utils'

export default function RecentMatches() {
  const { data: matches = [], isLoading } = useRecentMatches()
  const today = new Date().toISOString().split('T')[0]

  if (isLoading) {
    return <Spinner size="md" className="py-8" />
  }

  if (matches.length === 0) {
    return (
      <div className="p-6 text-center text-white/40 text-sm">
        لا توجد مباريات حديثة
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>المضيف</th>
            <th>الضيف</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => {
            const isPast = m.match_date < today
            return (
              <tr key={m.id}>
                <td>
                  <div className="text-xs">
                    {formatDate(m.match_date)}
                    <span className="text-white/40 mr-1">
                      {formatTime(m.match_time)}
                    </span>
                  </div>
                </td>
                <td>
                  <strong className="text-white text-sm">{m.home_team?.name}</strong>
                </td>
                <td>
                  <strong className="text-white text-sm">{m.away_team?.name}</strong>
                </td>
                <td>
                  <Badge variant={isPast ? 'gray' : 'success'} size="sm">
                    {isPast ? 'منتهية' : 'قادمة'}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}