import { memo } from 'react'
import { Edit, Trash2, Key, Shield, User, Eye } from 'lucide-react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

const ROLE_INFO = {
  admin: { label: 'أدمن', variant: 'danger', icon: Shield },
  editor: { label: 'محرر', variant: 'warning', icon: User },
  viewer: { label: 'مشاهد', variant: 'info', icon: Eye },
}

function UserTable({ users = [], loading, onEdit, onManagePermissions, onDelete }) {
  const columns = [
    {
      header: 'الاسم',
      accessor: (row) => <strong className="text-white">{row.full_name}</strong>,
    },
    {
      header: 'الدور',
      accessor: (row) => {
        const info = ROLE_INFO[row.role] || ROLE_INFO.viewer
        const Icon = info.icon
        return (
          <Badge variant={info.variant}>
            <Icon className="w-3 h-3" />
            {info.label}
          </Badge>
        )
      },
    },
    {
      header: 'الصلاحيات',
      accessor: (row) => {
        if (row.role !== 'editor') return <span className="text-white/40">—</span>
        const count = row.editor_permissions?.length || 0
        return <Badge variant="info">{count} صلاحية</Badge>
      },
    },
    {
      header: 'تاريخ التسجيل',
      accessor: (row) => (
        <span className="text-xs text-white/60">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      width: '150px',
      accessor: (row) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => onEdit?.(row)} title="تعديل">
            <Edit className="w-4 h-4 text-yellow-400" />
          </Button>
          {row.role === 'editor' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onManagePermissions?.(row)}
              title="الصلاحيات"
            >
              <Key className="w-4 h-4 text-blue-400" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => onDelete?.(row)} title="حذف">
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={users}
      loading={loading}
      emptyMessage="لا يوجد مستخدمون"
    />
  )
}

export default memo(UserTable)