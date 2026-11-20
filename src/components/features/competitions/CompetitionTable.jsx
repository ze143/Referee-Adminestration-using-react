import { memo, useMemo } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

function CompetitionTable({ competitions = [], loading, onEdit, onDelete }) {
  const columns = useMemo(
    () => [
      {
        header: 'اسم المسابقة',
        accessor: (row) => <strong className="text-white">{row.name}</strong>,
      },
      {
        header: 'الفئة العمرية',
        accessor: (row) => <span className="text-white/80">{row.age_category}</span>,
      },
      {
        header: 'مصدر المكافأة',
        accessor: (row) => (
          <Badge variant={row.payout_source === 'federation' ? 'primary' : 'warning'}>
            {row.payout_source === 'federation' ? 'الاتحاد' : 'النادي'}
          </Badge>
        ),
      },
      {
        header: 'مكافأة المباراة',
        accessor: (row) => (
          <span className="text-gold-500">{formatCurrency(row.match_fee)}</span>
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
      data={competitions}
      loading={loading}
      emptyMessage="لا توجد مسابقات — اضغط إضافة مسابقة للبدء"
    />
  )
}

export default memo(CompetitionTable)