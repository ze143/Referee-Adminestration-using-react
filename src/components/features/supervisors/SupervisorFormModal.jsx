import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Video, Eye, Users } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { REGIONS } from '@/types/constants'
import { useCreateSupervisor, useUpdateSupervisor } from '@/hooks/useSupervisors'

const schema = z.object({
  full_name: z.string().min(3, 'الاسم 3 أحرف على الأقل'),
  region: z.string().min(1, 'المنطقة مطلوبة'),
  phone: z.string().optional(),
  supervisor_type: z.enum(['regular', 'video', 'both']),
})

const SUPERVISOR_TYPES = [
  { value: 'regular', label: 'مراقب حكام' },
  { value: 'video', label: 'مراقب فيديو' },
  { value: 'both', label: 'مراقب حكام وفيديو' },
]

export default function SupervisorFormModal({ open, onClose, supervisor }) {
  const isEdit = !!supervisor
  const createMutation = useCreateSupervisor()
  const updateMutation = useUpdateSupervisor()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { supervisor_type: 'regular' },
  })

  useEffect(() => {
    if (supervisor) {
      reset({
        full_name: supervisor.full_name || '',
        region: supervisor.region || '',
        phone: supervisor.phone || '',
        supervisor_type: supervisor.supervisor_type || 'regular',
      })
    } else {
      reset({ full_name: '', region: '', phone: '', supervisor_type: 'regular' })
    }
  }, [supervisor, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: supervisor.id, ...data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
    } catch (e) {
      // toast من الـ hook
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل المراقب' : 'إضافة مراقب'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={mutation.isPending}>
            {isEdit ? 'تحديث' : 'إضافة'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="الاسم الكامل *"
          placeholder="محمد أحمد علي"
          {...register('full_name')}
          error={errors.full_name?.message}
        />

        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <Select
              label="المنطقة *"
              value={field.value ?? ''}
              onChange={(value) => field.onChange(value ?? '')}
              error={errors.region?.message}
            >
              <option value="">— اختر المنطقة —</option>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          )}
        />

        <Input
          label="رقم الهاتف"
          placeholder="01001234567"
          dir="ltr"
          {...register('phone')}
          error={errors.phone?.message}
        />

        {/* ✅ نوع المراقب */}
        <Controller
          name="supervisor_type"
          control={control}
          render={({ field }) => (
            <Select
              label="نوع المراقب *"
              value={field.value ?? 'regular'}
              onChange={(value) => field.onChange(value ?? 'regular')}
              error={errors.supervisor_type?.message}
            >
              {SUPERVISOR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          )}
        />
      </form>
    </Modal>
  )
}