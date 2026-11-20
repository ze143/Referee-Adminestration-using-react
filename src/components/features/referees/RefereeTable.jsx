import { memo, useMemo } from 'react'
import { Eye, Edit, Ban, CheckCircle, Trash2 } from 'lucide-react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { DEGREES, JOBS, getLabel } from '@/types/constants'

// ============================================
// variants ثابتة (خارج المكون — تتحسب مرة واحدة)
// ============================================
const DEGREE_VARIANTS = {
  '1st': 'success',
  '2nd': 'info',
  '3rd': 'warning',
  International: 'gold',
  New: 'gray',
}

// ============================================
// RefereeTable
// ============================================
function RefereeTable({
  referees = [],
  loading = false,
  onView,
  onEdit,
  onSuspend,
  onDelete,
}) {
  // ✅ useMemo — الأعمدة تتحسب بس لما الـ callbacks تتغير
  const columns = useMemo(
    () => [
      {
        header: 'الاسم',
        accessor: (row) => (
          <div className="flex items-center gap-2">
            <strong className="text-white">{row.full_name}</strong>
            {row.is_suspended && (
              <Badge variant="danger" size="sm">
                موقوف
              </Badge>
            )}
          </div>
        ),
      },
      {
        header: 'المنطقة',
        accessor: (row) => (
          <span className="text-white/80">{row.region || '-'}</span>
        ),
      },
      {
        header: 'الدرجة',
        accessor: (row) => (
          <Badge variant={DEGREE_VARIANTS[row.degree] || 'gray'}>
            {getLabel(DEGREES, row.degree)}
          </Badge>
        ),
      },
      {
        header: 'الوظيفة',
        accessor: (row) => (
          <span className="text-white/80">{getLabel(JOBS, row.job)}</span>
        ),
      },
      {
        header: 'VAR',
        accessor: (row) => {
          const hasAny = row.has_var_license || row.has_avar_license
          if (!hasAny) return <span className="text-white/30">-</span>
          return (
            <div className="flex gap-1">
              {row.has_var_license && (
                <Badge variant="danger" size="sm">
                  VAR
                </Badge>
              )}
              {row.has_avar_license && (
                <Badge variant="warning" size="sm">
                  AVAR
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        header: 'الهاتف',
        accessor: (row) => (
          <span dir="ltr" className="text-white/80">
            {row.phone || '-'}
          </span>
        ),
      },
      {
        header: 'الحالة',
        accessor: (row) => (
          <Badge variant={row.is_suspended ? 'danger' : 'success'}>
            {row.is_suspended ? 'موقوف' : 'نشط'}
          </Badge>
        ),
      },
      {
        header: 'الإجراءات',
        width: '180px',
        accessor: (row) => (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onView?.(row)}
              title="عرض التفاصيل"
            >
              <Eye className="w-4 h-4 text-blue-400" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit?.(row)}
              title="تعديل"
            >
              <Edit className="w-4 h-4 text-yellow-400" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onSuspend?.(row)}
              title={row.is_suspended ? 'إلغاء الإيقاف' : 'إيقاف'}
            >
              {row.is_suspended ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Ban className="w-4 h-4 text-orange-400" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete?.(row)}
              title="حذف"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        ),
      },
    ],
    [onView, onEdit, onSuspend, onDelete]
  )

  return (
    <Table
      columns={columns}
      data={referees}
      loading={loading}
      emptyMessage="لا يوجد حكام مطابقون"
    />
  )
}

// ✅ memo — تمنع re-render لو الـ props متغيرتش
export default memo(RefereeTable)