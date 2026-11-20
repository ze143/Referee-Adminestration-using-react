import { useState, useMemo, lazy, Suspense } from 'react'
import { Search, Eye } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useReferees } from '@/hooks/useReferees'
import { DEGREES, JOBS, getLabel } from '@/types/constants'

const RefereeDetailsModal = lazy(() =>
  import('@/components/features/referees/RefereeDetailsModal')
)

export default function ViewerReferees() {
  const { data, isLoading } = useReferees({ pageSize: 1000 })
  const referees = Array.isArray(data) ? data : (data?.data || [])

  const [filters, setFilters] = useState({ search: '', degree: '', status: '' })
  const [detailsId, setDetailsId] = useState(null)

  const filtered = useMemo(() => {
    return referees.filter((r) => {
      if (filters.search && !r.full_name?.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.degree && r.degree !== filters.degree) return false
      if (filters.status === 'active' && r.is_suspended) return false
      if (filters.status === 'suspended' && !r.is_suspended) return false
      return true
    })
  }, [referees, filters])

  return (
    <div className="space-y-6">
      <PageHeader title="الحكام - عرض فقط" subtitle={`${filtered.length} من ${referees.length}`} />

      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="بحث..."
            icon={Search}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.degree}
            onChange={(v) => setFilters({ ...filters, degree: v })}
            placeholder="جميع الدرجات"
            clearable
            options={DEGREES.map((d) => ({ value: d.value, label: d.label }))}
          />
          <Select
            value={filters.status}
            onChange={(v) => setFilters({ ...filters, status: v })}
            options={[
              { value: '', label: 'جميع الحالات' },
              { value: 'active', label: 'نشط' },
              { value: 'suspended', label: 'موقوف' },
            ]}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <Spinner size="lg" className="py-16" />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>المنطقة</th>
                  <th>الدرجة</th>
                  <th>الوظيفة</th>
                  <th>الهاتف</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td><strong className="text-white">{r.full_name}</strong></td>
                    <td>{r.region || '-'}</td>
                    <td><Badge variant="info">{getLabel(DEGREES, r.degree)}</Badge></td>
                    <td>{getLabel(JOBS, r.job)}</td>
                    <td dir="ltr">{r.phone || '-'}</td>
                    <td>
                      <Badge variant={r.is_suspended ? 'danger' : 'success'}>
                        {r.is_suspended ? 'موقوف' : 'نشط'}
                      </Badge>
                    </td>
                    <td>
                      <Button size="icon" variant="ghost" onClick={() => setDetailsId(r.id)}>
                        <Eye className="w-4 h-4 text-blue-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Suspense fallback={<Spinner />}>
        {detailsId && (
          <RefereeDetailsModal
            open
            refereeId={detailsId}
            onClose={() => setDetailsId(null)}
          />
        )}
      </Suspense>
    </div>
  )
}