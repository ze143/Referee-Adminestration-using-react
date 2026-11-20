import { memo, useMemo } from 'react'
import { Edit, Trash2, Eye, Video } from 'lucide-react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { REGIONS } from '@/types/constants'

const TYPE_LABELS = {
  regular: { label: 'مراقب حكام', icon: Eye, variant: 'info' },
  video: { label: 'مراقب فيديو', icon: Video, variant: 'danger' },
  both: { label: 'حكام + فيديو', icon: Eye, variant: 'gold' },
}

function SupervisorTable({
  supervisors = [],
  matchCounts = {},
  loading,
  onEdit,
  onDelete,
  onView,
}) {
  const columns = useMemo(
    () => [
      {
        header: 'الاسم',
        accessor: (row) => <strong className="text-white">{row.full_name}</strong>,
      },
      {
        header: 'النوع',
        accessor: (row) => {
          const type = TYPE_LABELS[row.supervisor_type || 'regular']
          const Icon = type.icon
          return (
            <Badge variant={type.variant}>
              <Icon className="w-3 h-3 inline mr-1" />
              {type.label}
            </Badge>
          )
        },
      },
      {
        header: 'المنطقة',
        accessor: (row) => {
          const label = REGIONS.find((r) => r.value === row.region)?.label || row.region || '—'
          return <span className="text-white/70">{label}</span>
        },
      },
      {
        header: 'الهاتف',
        accessor: (row) => <span className="text-white/60" dir="ltr">{row.phone || '—'}</span>,
      },
      {
        header: 'المباريات',
        accessor: (row) => (
          <Badge variant={matchCounts[row.id] > 0 ? 'success' : 'gray'}>
            {matchCounts[row.id] || 0}
          </Badge>
        ),
      },
      {
        header: 'الإجراءات',
        width: '160px',
        accessor: (row) => (
          <div className="flex gap-1">
            {onView && (
              <Button size="icon" variant="ghost" onClick={() => onView(row)} title="ملف المراقب">
                <Eye className="w-4 h-4 text-blue-400" />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => onEdit?.(row)}>
              <Edit className="w-4 h-4 text-yellow-400" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete?.(row)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onView, matchCounts]
  )

  return (
    <Table
      columns={columns}
      data={supervisors}
      loading={loading}
      emptyMessage="لا يوجد مراقبين — اضغط إضافة مراقب للبدء"
    />
  )
}

export default memo(SupervisorTable)