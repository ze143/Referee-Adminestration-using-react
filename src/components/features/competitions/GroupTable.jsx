import { memo, useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'

function GroupTable({ groups = [], loading, onEdit, onDelete }) {
  const columns = useMemo(
    () => [
      {
        header: 'اسم المجموعة',
        accessor: (row) => <strong className="text-white">{row.name}</strong>,
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
      data={groups}
      loading={loading}
      emptyMessage="لا توجد مجموعات — اضغط إضافة مجموعة للبدء"
    />
  )
}

export default memo(GroupTable)