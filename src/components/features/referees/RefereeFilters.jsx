import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Search, X } from 'lucide-react'
import { DEGREES, JOBS, REGIONS } from '@/types/constants'

const STATUS_OPTIONS = [
  { value: '', label: 'جميع الحالات' },
  { value: 'active', label: 'نشط' },
  { value: 'suspended', label: 'موقوف' },
]

export default function RefereeFilters({ filters, onChange, onReset }) {
  const update = (key, value) => onChange({ ...filters, [key]: value })
  const hasFilters = Object.values(filters).some((v) => v)

  return (
    <div className="glass-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Input
          placeholder="ابحث بالاسم أو الهاتف..."
          icon={Search}
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
        />

        <Select
          value={filters.region || ''}
          onChange={(v) => update('region', v)}
          placeholder="جميع المناطق"
          searchable
          clearable
          options={REGIONS.map((r) => ({ value: r.value, label: r.label }))}
        />

        <Select
          value={filters.degree || ''}
          onChange={(v) => update('degree', v)}
          placeholder="جميع الدرجات"
          clearable
          options={DEGREES.map((d) => ({ value: d.value, label: d.label }))}
        />

        <Select
          value={filters.job || ''}
          onChange={(v) => update('job', v)}
          placeholder="جميع الوظائف"
          clearable
          options={JOBS.map((j) => ({ value: j.value, label: j.label }))}
        />

        <Select
          value={filters.status || ''}
          onChange={(v) => update('status', v)}
          options={STATUS_OPTIONS}
        />
      </div>

      {hasFilters && (
        <div className="flex justify-end mt-3">
          <Button variant="ghost" size="sm" icon={X} onClick={onReset}>
            مسح الفلاتر
          </Button>
        </div>
      )}
    </div>
  )
}