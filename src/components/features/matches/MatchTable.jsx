import { memo, useMemo } from 'react'
import {
  Eye,
  Edit,
  UserPlus,
  UserX,
  Trash2,
  AlertTriangle,
  MapPin,
} from 'lucide-react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import RefereeCrewBadges from './RefereeCrewBadges'
import { formatDate, formatTime } from '@/lib/utils'

function MatchTable({
  matches = [],
  loading,
  onView,
  onEdit,
  onAssign,
  onExcuse,
  onDelete,
  onToggleNotify,
}) {
  const columns = useMemo(
    () => [
      // ============ المسابقة ============
      {
        header: 'المسابقة',
        accessor: (row) => (
          <div className="flex items-center gap-1">
            <span className="text-white/80 text-sm">
              {row.competitions?.name || '-'}
            </span>
            {row.has_conflict && (
              <AlertTriangle
                className="w-4 h-4 text-yellow-400"
                title="تعارض في التوقيت"
              />
            )}
          </div>
        ),
      },

      // ============ المرحلة + المجموعة ============
      {
        header: 'المرحلة / المجموعة',
        width: '120px',
        accessor: (row) => {
          const hasStage = !!row.stage?.name
          const hasGroup = !!row.group?.name
          if (!hasStage && !hasGroup) {
            return <span className="text-white/30 text-xs">—</span>
          }
          return (
            <div className="flex flex-col gap-1">
              {hasStage && (
                <Badge variant="warning" size="sm">
                  {row.stage.name}
                </Badge>
              )}
              {hasGroup && (
                <Badge variant="info" size="sm">
                  {row.group.name}
                </Badge>
              )}
            </div>
          )
        },
      },

      // ============ التاريخ ============
      {
        header: 'التاريخ',
        accessor: (row) => (
          <span className="text-white/80 text-xs">
            {formatDate(row.match_date)}
          </span>
        ),
      },

      // ============ الوقت ============
      {
        header: 'الوقت',
        accessor: (row) => (
          <span className="text-white/80 text-xs">
            {formatTime(row.match_time)}
          </span>
        ),
      },

      // ============ الملعب ============
      {
        header: 'الملعب',
        width: '120px',
        accessor: (row) => (
          <div className="flex items-center gap-1 text-xs text-white/70">
            <MapPin className="w-3 h-3 text-gold-500 flex-shrink-0" />
            <span className="truncate" title={row.stadium || '-'}>
              {row.stadium || '-'}
            </span>
          </div>
        ),
      },

      // ============ المضيف ============
      {
        header: 'المضيف',
        accessor: (row) => (
          <strong className="text-white text-sm">
            {row.home_team?.name || '-'}
          </strong>
        ),
      },

      // ============ الضيف ============
      {
        header: 'الضيف',
        accessor: (row) => (
          <strong className="text-white text-sm">
            {row.away_team?.name || '-'}
          </strong>
        ),
      },

      // ============ طاقم الحكام ============
      {
        header: 'طاقم الحكام',
        width: '250px',
        accessor: (row) => (
          <RefereeCrewBadges match={row} onToggleNotify={onToggleNotify} />
        ),
      },

      // ============ الحالة ============
      {
        header: 'الحالة',
        accessor: (row) => (
          <div className="flex flex-col gap-1">
            <Badge
              variant={row.is_notified ? 'success' : 'warning'}
              size="sm"
            >
              {row.is_notified ? 'مبلغ' : 'غير مبلغ'}
            </Badge>
            <Badge variant={row.is_paid ? 'success' : 'gray'} size="sm">
              {row.is_paid ? 'مدفوع' : 'غير مدفوع'}
            </Badge>
          </div>
        ),
      },

      // ============ الإجراءات ============
      {
        header: 'الإجراءات',
        width: '180px',
        accessor: (row) => (
          <div className="flex gap-1 flex-wrap">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onView?.(row)}
              title="عرض"
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
              onClick={() => onAssign?.(row)}
              title="تعيين"
            >
              <UserPlus className="w-4 h-4 text-green-400" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onExcuse?.(row)}
              title="اعتذار"
            >
              <UserX className="w-4 h-4 text-orange-400" />
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
    [onView, onEdit, onAssign, onExcuse, onDelete, onToggleNotify]
  )

  return (
    <Table
      columns={columns}
      data={matches}
      loading={loading}
      emptyMessage="لا توجد مباريات"
    />
  )
}

export default memo(MatchTable)