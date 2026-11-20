import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useCompetitions } from '@/hooks/useCompetitions'
import { useStages } from '@/hooks/useStages'
import { DEGREES, JOBS, REGIONS } from '@/types/constants'

const ROLE_OPTIONS = [
  { value: 'main', label: 'رئيسي' },
  { value: 'assistant1', label: 'مساعد 1' },
  { value: 'assistant2', label: 'مساعد 2' },
  { value: 'fourth', label: 'رابع' },
  { value: 'var', label: 'VAR' },
  { value: 'avar', label: 'AVAR' },
]

const RATING_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: '90', label: '90+' },
  { value: '80', label: '80+' },
  { value: '70', label: '70+' },
  { value: '60', label: '60+' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'suspended', label: 'موقوف' },
]

const PAID_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'unpaid', label: 'غير مدفوع' },
]

export default function ReportsFilters({ type, filters, onChange, onRun }) {
  const { data: competitions = [] } = useCompetitions()
  const { data: stages = [] } = useStages(filters.competition_id)

  const update = (key, value) => onChange({ ...filters, [key]: value })

  const competitionOptions = competitions.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const stageOptions = stages.map((s) => ({
    value: s.id,
    label: s.name,
  }))

  const degreeOptions = DEGREES.map((d) => ({ value: d.value, label: d.label }))
  const jobOptions = JOBS.map((j) => ({ value: j.value, label: j.label }))
  const regionOptions = REGIONS.map((r) => ({ value: r.value, label: r.label }))

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* المسابقة */}
        {type !== 'competitions' && type !== 'supervisors' && (
          <Select
            label="المسابقة"
            value={filters.competition_id || ''}
            onChange={(v) => update('competition_id', v)}
            placeholder="جميع المسابقات"
            searchable
            clearable
            options={competitionOptions}
          />
        )}

        {/* المرحلة */}
        {(type === 'matches' || type === 'evaluations') && filters.competition_id && (
          <Select
            label="المرحلة"
            value={filters.stage_id || ''}
            onChange={(v) => update('stage_id', v)}
            placeholder="جميع المراحل"
            clearable
            options={stageOptions}
          />
        )}

        {/* المنطقة */}
        {type === 'referees' && (
          <Select
            label="المنطقة"
            value={filters.region || ''}
            onChange={(v) => update('region', v)}
            placeholder="جميع المناطق"
            searchable
            clearable
            options={regionOptions}
          />
        )}

        {/* الدرجة */}
        {type === 'referees' && (
          <Select
            label="الدرجة"
            value={filters.degree || ''}
            onChange={(v) => update('degree', v)}
            placeholder="جميع الدرجات"
            clearable
            options={degreeOptions}
          />
        )}

        {/* الوظيفة */}
        {type === 'referees' && (
          <Select
            label="الوظيفة"
            value={filters.job || ''}
            onChange={(v) => update('job', v)}
            placeholder="جميع الوظائف"
            clearable
            options={jobOptions}
          />
        )}

        {/* الدور */}
        {type === 'evaluations' && (
          <Select
            label="الدور"
            value={filters.role || ''}
            onChange={(v) => update('role', v)}
            placeholder="جميع الأدوار"
            clearable
            options={ROLE_OPTIONS}
          />
        )}

        {/* حد أدنى */}
        {type === 'evaluations' && (
          <Select
            label="الحد الأدنى"
            value={filters.minRating || ''}
            onChange={(v) => update('minRating', v)}
            options={RATING_OPTIONS}
          />
        )}

        {/* الحالة */}
        {type === 'referees' && (
          <Select
            label="الحالة"
            value={filters.status || ''}
            onChange={(v) => update('status', v)}
            options={STATUS_OPTIONS}
          />
        )}

        {/* مدفوع (للمالية) */}
        {type === 'finance' && (
          <Select
            label="الحالة"
            value={filters.paid || ''}
            onChange={(v) => update('paid', v)}
            options={PAID_OPTIONS}
          />
        )}

        {/* التاريخ */}
        {type !== 'competitions' && (
          <>
            <Input
              label="من تاريخ"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => update('dateFrom', e.target.value)}
            />
            <Input
              label="إلى تاريخ"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => update('dateTo', e.target.value)}
            />
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="primary" onClick={onRun}>
          🔍 إنشاء التقرير
        </Button>
      </div>
    </div>
  )
}