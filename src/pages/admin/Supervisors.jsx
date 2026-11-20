import { useState, useMemo, lazy, Suspense } from 'react'
import { Plus, Search } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import {
  useSupervisors,
  useDeleteSupervisor,
  useSupervisorsMatchCounts,
} from '@/hooks/useSupervisors'
import SupervisorTable from '@/components/features/supervisors/SupervisorTable'
import { REGIONS } from '@/types/constants'

const SupervisorFormModal = lazy(() =>
  import('@/components/features/supervisors/SupervisorFormModal')
)
const SupervisorDetailsModal = lazy(() =>
  import('@/components/features/supervisors/SupervisorDetailsModal')
)

export default function Supervisors() {
  const { data: supervisors = [], isLoading } = useSupervisors()
  const { data: matchCounts = {} } = useSupervisorsMatchCounts()
  const deleteMutation = useDeleteSupervisor()

  const [filters, setFilters] = useState({ search: '', region: '', type: '' })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)

  const filtered = useMemo(() => {
    return supervisors.filter((s) => {
      if (
        filters.search &&
        !s.full_name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !s.phone?.includes(filters.search)
      )
        return false
      if (filters.region && s.region !== filters.region) return false
      if (filters.type && (s.supervisor_type || 'regular') !== filters.type) return false
      return true
    })
  }, [supervisors, filters])

  const handleAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (sup) => {
    setEditing(sup)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المراقبين"
        subtitle={`${filtered.length} من ${supervisors.length} مراقب`}
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            إضافة مراقب
          </Button>
        }
      />

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="ابحث بالاسم أو الهاتف..."
            icon={Search}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.region}
            onChange={(v) => setFilters({ ...filters, region: v })}
            placeholder="جميع المناطق"
            searchable
            clearable
            options={REGIONS.map((r) => ({ value: r.value, label: r.label }))}
          />
          <Select
            value={filters.type}
            onChange={(v) => setFilters({ ...filters, type: v })}
            placeholder="جميع الأنواع"
            clearable
            options={[
              { value: 'regular', label: 'مراقب حكام' },
              { value: 'video', label: 'مراقب فيديو' },
              { value: 'both', label: 'حكام + فيديو' },
            ]}
          />
          {(filters.search || filters.region || filters.type) && (
            <Button
              variant="ghost"
              onClick={() => setFilters({ search: '', region: '', type: '' })}
            >
              مسح الفلاتر
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <SupervisorTable
          supervisors={filtered}
          matchCounts={matchCounts}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onView={(sup) => setViewTarget(sup)}
        />
      </div>

      {/* Modals */}
      <Suspense fallback={<Spinner />}>
        {formOpen && (
          <SupervisorFormModal
            open
            onClose={() => setFormOpen(false)}
            supervisor={editing}
          />
        )}
      </Suspense>

      <Suspense fallback={<Spinner />}>
        {viewTarget && (
          <SupervisorDetailsModal
            open
            onClose={() => setViewTarget(null)}
            supervisorId={viewTarget.id}
          />
        )}
      </Suspense>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف المراقب"
        message={`هل أنت متأكد من حذف "${deleteTarget?.full_name}"؟${
          matchCounts[deleteTarget?.id] > 0
            ? ` سيتم إزالته من ${matchCounts[deleteTarget.id]} مباراة.`
            : ''
        }`}
        confirmText="نعم، احذف"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}