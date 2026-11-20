import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import { useReferees } from '@/hooks/useReferees'
import { DEGREES, JOBS, getLabel } from '@/types/constants'

export default function EditorReferees() {
  const { data, isLoading } = useReferees({ pageSize: 1000 })
  const referees = Array.isArray(data) ? data : (data?.data || [])

  const [filters, setFilters] = useState({ search: '', degree: '', status: '' })

  const filtered = useMemo(() => {
    return referees.filter((r) => {
      if (
        filters.search &&
        !r.full_name?.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false
      if (filters.degree && r.degree !== filters.degree) return false
      if (filters.status === 'active' && r.is_suspended) return false
      if (filters.status === 'suspended' && !r.is_suspended) return false
      return true
    })
  }, [referees, filters])

  return (
    <div className="space-y-6">
      <PageHeader title="الحكام - عرض فقط" subtitle={`${filtered.length} من ${referees.length}`} />

      {/* Filters */}
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

      {/* Table */}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}