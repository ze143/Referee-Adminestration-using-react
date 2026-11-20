import { useState, lazy, Suspense } from 'react'
import { Eye } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useMatches } from '@/hooks/useMatches'
import { formatDate, formatTime } from '@/lib/utils'
import { useCompetitions } from '@/hooks/useCompetitions'

const MatchDetailsModal = lazy(() =>
  import('@/components/features/matches/MatchDetailsModal')
)

const PAGE_SIZE = 20

export default function ViewerMatches() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ competition_id: '', status: '' })
  const [detailsId, setDetailsId] = useState(null)

  const { data, isLoading } = useMatches({ page, pageSize: PAGE_SIZE, filters })
  const matches = data?.data || []
  const total = data?.total || 0

  const { data: competitions = [] } = useCompetitions()
  const competitionOptions = competitions.map((c) => ({ value: c.id, label: c.name }))

  return (
    <div className="space-y-6">
      <PageHeader title="المباريات - عرض فقط" subtitle={`${total} مباراة`} />

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            value={filters.competition_id}
            onChange={(v) => { setFilters({ ...filters, competition_id: v }); setPage(0) }}
            placeholder="جميع المسابقات"
            searchable
            clearable
            options={competitionOptions}
          />
          <Select
            value={filters.status}
            onChange={(v) => { setFilters({ ...filters, status: v }); setPage(0) }}
            options={[
              { value: '', label: 'جميع المباريات' },
              { value: 'upcoming', label: 'قادمة' },
              { value: 'past', label: 'منتهية' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <Spinner size="lg" className="py-16" />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الوقت</th>
                    <th>المسابقة</th>
                    <th>المضيف</th>
                    <th>الضيف</th>
                    <th>الملعب</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDate(m.match_date)}</td>
                      <td>{formatTime(m.match_time)}</td>
                      <td className="text-xs">{m.competitions?.name}</td>
                      <td><strong className="text-white">{m.home_team?.name}</strong></td>
                      <td><strong className="text-white">{m.away_team?.name}</strong></td>
                      <td className="text-xs text-white/60">{m.stadium}</td>
                      <td>
                        <Badge variant={m.is_notified ? 'success' : 'warning'} size="sm">
                          {m.is_notified ? 'مبلغ' : 'غير مبلغ'}
                        </Badge>
                      </td>
                      <td>
                        <Button size="icon" variant="ghost" onClick={() => setDetailsId(m.id)}>
                          <Eye className="w-4 h-4 text-blue-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>

      <Suspense fallback={<Spinner />}>
        {detailsId && (
          <MatchDetailsModal
            open
            matchId={detailsId}
            onClose={() => setDetailsId(null)}
          />
        )}
      </Suspense>
    </div>
  )
}