import { useState, lazy, Suspense } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useUsers, useDeleteUser } from '@/hooks/useUsers'
import UserTable from '@/components/features/users/UserTable'

const UserFormModal = lazy(() => import('@/components/features/users/UserFormModal'))
const PermissionsModal = lazy(() => import('@/components/features/users/PermissionsModal'))

export default function Users() {
  const { data: users = [], isLoading } = useUsers()
  const deleteMutation = useDeleteUser()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [permTarget, setPermTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (user) => {
    setEditing(user)
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
        title="إدارة المستخدمين"
        subtitle={`${users.length} مستخدم`}
        actions={
          <Button icon={Plus} onClick={handleAdd}>
            إضافة مستخدم
          </Button>
        }
      />

      <div className="glass-card overflow-hidden">
        <UserTable
          users={users}
          loading={isLoading}
          onEdit={handleEdit}
          onManagePermissions={setPermTarget}
          onDelete={setDeleteTarget}
        />
      </div>

      <Suspense fallback={<Spinner />}>
        {formOpen && (
          <UserFormModal
            open
            onClose={() => setFormOpen(false)}
            user={editing}
          />
        )}
        {permTarget && (
          <PermissionsModal
            open
            onClose={() => setPermTarget(null)}
            user={permTarget}
          />
        )}
        {deleteTarget && (
          <ConfirmDialog
            open
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            title="حذف المستخدم"
            message={`هل أنت متأكد من حذف "${deleteTarget.full_name}"؟`}
            confirmText="نعم، احذف"
            loading={deleteMutation.isPending}
          />
        )}
      </Suspense>
    </div>
  )
}