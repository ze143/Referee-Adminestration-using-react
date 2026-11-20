import { useState, useMemo, lazy, Suspense } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Pagination from '@/components/ui/Pagination'
import { useReferees, useDeleteReferee } from '@/hooks/useReferees'
import RefereeFilters from '@/components/features/referees/RefereeFilters'
import RefereeTable from '@/components/features/referees/RefereeTable'

const RefereeFormModal = lazy(() => import('@/components/features/referees/RefereeFormModal'))
const SuspensionModal = lazy(() => import('@/components/features/referees/SuspensionModal'))
const RefereeDetailsModal = lazy(() => import('@/components/features/referees/RefereeDetailsModal'))
const ConfirmDialog = lazy(() => import('@/components/ui/ConfirmDialog'))

const PAGE_SIZE = 30

export default function Referees() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    region: '',
    degree: '',
    job: '',
    status: '',
  })

  // ✅ الفلترة على السيرفر (أسرع بكتير)
  const { data, isLoading } = useReferees({ page, pageSize: PAGE_SIZE, filters })
  const referees = data?.data || []
  const total = data?.total || 0

  // Reset page لما الفلاتر تتغير
  const updateFilters = (newFilters) => {
    setFilters(newFilters)
    setPage(0)
  }

  const deleteMutation = useDeleteReferee()

  const [formOpen, setFormOpen] = useState(false)
  const [editingReferee, setEditingReferee] = useState(null)
  const [suspensionOpen, setSuspensionOpen] = useState(false)
  const [suspendingReferee, setSuspendingReferee] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewRefereeId, setViewRefereeId] = useState(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الحكام"
        subtitle={`${total} حكم`}
        actions={<Button icon={Plus} onClick={() => { setEditingReferee(null); setFormOpen(true) }}>إضافة حكم</Button>}
      />

      <RefereeFilters
        filters={filters}
        onChange={updateFilters}
        onReset={() => { setFilters({ search: '', region: '', degree: '', job: '', status: '' }); setPage(0) }}
      />

      <div className="glass-card overflow-hidden">
        <RefereeTable
          referees={referees}
          loading={isLoading}
          onView={(r) => setViewRefereeId(r.id)}
          onEdit={(r) => { setEditingReferee(r); setFormOpen(true) }}
          onSuspend={(r) => { setSuspendingReferee(r); setSuspensionOpen(true) }}
          onDelete={(r) => setDeleteTarget(r)}
        />
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      <Suspense fallback={<Spinner size="md" />}>
        {formOpen && <RefereeFormModal open={formOpen} onClose={() => setFormOpen(false)} referee={editingReferee} />}
        {suspensionOpen && <SuspensionModal open={suspensionOpen} onClose={() => setSuspensionOpen(false)} referee={suspendingReferee} />}
        {viewRefereeId && <RefereeDetailsModal open={!!viewRefereeId} onClose={() => setViewRefereeId(null)} refereeId={viewRefereeId} />}
        {deleteTarget && (
          <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={async () => { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null) }}
            title="حذف الحكم"
            message={`هل أنت متأكد من حذف "${deleteTarget?.full_name}"؟`}
            confirmText="نعم، احذف"
            loading={deleteMutation.isPending}
          />
        )}
      </Suspense>
    </div>
  )
}