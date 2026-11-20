import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ExternalLink, RefreshCw, Info } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useUpdateUserRole } from '@/hooks/useUsers'

const ROLES_OPTIONS = [
  { value: 'viewer', label: 'مشاهد' },
  { value: 'editor', label: 'محرر مشروط' },
  { value: 'admin', label: 'أدمن' },
]

const editSchema = z.object({
  full_name: z.string().min(3, 'الاسم مطلوب'),
  role: z.enum(['admin', 'editor', 'viewer']),
})

export default function UserFormModal({ open, onClose, user }) {
  const isEdit = !!user
  const updateMutation = useUpdateUserRole()
  const [syncing, setSyncing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
  })

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        role: user.role || 'viewer',
      })
    }
  }, [user?.id, reset])

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: user.id, ...data })
      onClose()
    }
  }

  // ✅ دالة فتح Dashboard
  const openDashboard = () => {
    window.open(
      'https://supabase.com/dashboard/project/ckhwymydcbhgvjupffkr/auth/users',
      '_blank'
    )
  }

  // ✅ دالة المزامنة (بس لـ useQuery في useUsers)
  const handleSync = async () => {
    setSyncing(true)
    // الـ useUsers hook هيعمل refetch تلقائياً لما الصفحة تتحدث
    window.location.reload() // أبسط طريقة لتحديث القائمة
  }

  // ✅ لو إضافة، نعرض تعليمات + زرار Dashboard
  if (!isEdit) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="إضافة مستخدم جديد"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              إغلاق
            </Button>
            <Button variant="secondary" icon={RefreshCw} onClick={handleSync} loading={syncing}>
              مزامنة
            </Button>
            <Button icon={ExternalLink} onClick={openDashboard}>
              فتح Authentication
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-300 mb-2">
                  الخطوات:
                </h4>
                <ol className="text-sm text-white/70 space-y-2 list-decimal pr-5">
                  <li>اضغط <strong>"فتح Authentication"</strong></li>
                  <li>في Supabase Dashboard، اضغط <strong>"Add user"</strong></li>
                  <li>أدخل البريد وكلمة المرور</li>
                  <li>✅ فعّل <strong>"Auto Confirm User"</strong></li>
                  <li>اضغط <strong>"Create user"</strong></li>
                  <li>ارجع هنا واضغط <strong>"مزامنة"</strong> لتحديث القائمة</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-300">
            ✅ <strong>ملاحظة:</strong> الـ profile هيتعمل تلقائياً بفضل الـ trigger الموجود في الداتابيز.
          </div>
        </div>
      </Modal>
    )
  }

  // ✅ تعديل: فورم عادي
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تعديل المستخدم"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={updateMutation.isPending}>
            تحديث
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          value={user?.id || ''}
          disabled
          dir="ltr"
        />

        <Input
          label="الاسم الكامل *"
          placeholder="محمد أحمد"
          {...register('full_name')}
          error={errors.full_name?.message}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              label="الدور *"
              value={field.value}
              onChange={field.onChange}
              options={ROLES_OPTIONS}
              variant="modal"
            />
          )}
        />
      </form>
    </Modal>
  )
}