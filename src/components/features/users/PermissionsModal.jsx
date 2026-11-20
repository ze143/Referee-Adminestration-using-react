import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { useCompetitions } from '@/hooks/useCompetitions'
import {
  useEditorPermissions,
  useGrantPermission,
  useRevokePermission,
} from '@/hooks/useUsers'
import { formatDate } from '@/lib/utils'

const PERMISSION_TYPES = [
  { value: 'assistants_only', label: 'مساعدين فقط' },
  { value: 'full', label: 'كامل (حكام + مساعدين)' },
]

export default function PermissionsModal({ open, onClose, user }) {
  const { data: permissions = [], isLoading } = useEditorPermissions(user?.id)
  const { data: competitions = [] } = useCompetitions()
  const grantMutation = useGrantPermission()
  const revokeMutation = useRevokePermission()

  const [form, setForm] = useState({
    competition_id: '',
    assigned_date: '',
    permission_type: 'assistants_only',
  })

  if (!user) return null

  const handleGrant = async () => {
    await grantMutation.mutateAsync({
      user_id: user.id,
      ...form,
    })
    setForm({ competition_id: '', assigned_date: '', permission_type: 'assistants_only' })
  }

  const handleRevoke = async (permId) => {
    await revokeMutation.mutateAsync({ id: permId, userId: user.id })
  }

  const competitionOptions = competitions.map((c) => ({ value: c.id, label: c.name }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`صلاحيات: ${user.full_name}`}
      size="lg"
      footer={<Button variant="ghost" onClick={onClose}>إغلاق</Button>}
    >
      <div className="space-y-4">
        {/* إضافة صلاحية */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-bold text-gold-500">منح صلاحية جديدة</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="المسابقة"
              value={form.competition_id}
              onChange={(v) => setForm({ ...form, competition_id: v })}
              placeholder="جميع المسابقات"
              searchable
              clearable
              options={competitionOptions}
            />
            <Input
              label="التاريخ"
              type="date"
              value={form.assigned_date}
              onChange={(e) => setForm({ ...form, assigned_date: e.target.value })}
            />
            <Select
              label="نوع الصلاحية"
              value={form.permission_type}
              onChange={(v) => setForm({ ...form, permission_type: v })}
              options={PERMISSION_TYPES}
            />
          </div>
          <Button
            icon={Plus}
            onClick={handleGrant}
            loading={grantMutation.isPending}
            disabled={!form.competition_id && !form.assigned_date}
          >
            منح
          </Button>
        </div>

        {/* الصلاحيات الحالية */}
        <div>
          <h4 className="text-sm font-bold text-gold-500 mb-2">
            الصلاحيات ({permissions.length})
          </h4>
          {isLoading ? (
            <Spinner />
          ) : permissions.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">
              لا توجد صلاحيات
            </p>
          ) : (
            <div className="space-y-2">
              {permissions.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge
                      variant={p.permission_type === 'full' ? 'success' : 'warning'}
                    >
                      {p.permission_type === 'full' ? 'كامل' : 'مساعدين فقط'}
                    </Badge>
                    <Badge variant="info">
                      {p.competitions?.name || 'جميع المسابقات'}
                    </Badge>
                    {p.assigned_date && (
                      <span className="text-xs text-white/60">
                        {formatDate(p.assigned_date)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRevoke(p.id)}
                    loading={revokeMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}