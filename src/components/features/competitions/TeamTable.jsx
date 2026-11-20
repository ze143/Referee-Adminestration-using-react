import { memo, useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

function TeamTable({ teams = [], loading, onEdit, onDelete }) {
  const columns = useMemo(
    () => [
      {
        header: 'اسم الفريق',
        accessor: (row) => <strong className="text-white">{row.name}</strong>,
      },
      {
        header: 'المرحلة',
        accessor: (row) =>
          row.stage?.name ? (
            <Badge variant="gold">{row.stage.name}</Badge>
          ) : (
            <span className="text-white/40">بدون مرحلة</span>
          ),
      },
      {
        header: 'المجموعة',
        accessor: (row) =>
          row.group?.name ? (
            <Badge variant="info">{row.group.name}</Badge>
          ) : (
            <span className="text-white/40">بدون مجموعة</span>
          ),
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
      data={teams}
      loading={loading}
      emptyMessage="لا توجد فرق — اضغط إضافة فريق للبدء"
    />
  )
}

export default memo(TeamTable)