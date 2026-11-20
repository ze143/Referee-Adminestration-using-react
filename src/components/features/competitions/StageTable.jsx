import { memo, useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const STAGE_TYPES = {
  league: { label: 'دوري', variant: 'primary' },
  group: { label: 'مجموعات', variant: 'success' },
  knockout: { label: 'خروج المغلوب', variant: 'warning' },
}

function StageTable({ stages = [], loading, onEdit, onDelete }) {
  const columns = useMemo(
    () => [
      {
        header: '#',
        width: '60px',
        accessor: (row) => <span className="text-white/60">{row.order_num}</span>,
      },
      {
        header: 'اسم المرحلة',
        accessor: (row) => <strong className="text-white">{row.name}</strong>,
      },
      {
        header: 'النوع',
        accessor: (row) => {
          const type = STAGE_TYPES[row.stage_type] || STAGE_TYPES.league
          return <Badge variant={type.variant}>{type.label}</Badge>
        },
      },
      {
        header: 'الإجراءات',
        width: '120px',
        accessor: (row) => (
          <div className="flex gap-1">
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
    [onEdit, onDelete]
  )

  return (
    <Table
      columns={columns}
      data={stages}
      loading={loading}
      emptyMessage="لا توجد مراحل — اضغط إضافة مرحلة للبدء"
    />
  )
}

export default memo(StageTable)