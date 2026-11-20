import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToggleSuspension } from '@/hooks/useReferees'

const schema = z.object({
  reason: z.string().min(3, 'السبب مطلوب'),
  start_date: z.string().min(1, 'تاريخ بداية الإيقاف مطلوب'),
  end_date: z.string().min(1, 'تاريخ نهاية الإيقاف مطلوب'),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'تاريخ النهاية لازم يكون بعد تاريخ البداية',
  path: ['end_date'],
})

export default function SuspensionModal({ open, onClose, referee }) {
  const isSuspended = referee?.is_suspended
  const mutation = useToggleSuspension()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: isSuspended ? undefined : zodResolver(schema),
    defaultValues: {
      reason: '',
      start_date: new Date().toISOString().split('T')[0], // النهاردة
      end_date: '',
    },
  })

  useEffect(() => {
    if (referee && !isSuspended) {
      reset({
        reason: referee.suspension_reason || '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: referee.suspension_until || '',
      })
    }
  }, [referee, isSuspended, reset])

  const onSubmit = async (data) => {
    if (isSuspended) {
      await mutation.mutateAsync({ id: referee.id, is_suspended: false })
    } else {
      await mutation.mutateAsync({
        id: referee.id,
        is_suspended: true,
        reason: data.reason,
        startDate: data.start_date,   // ✅
        endDate: data.end_date,       // ✅
      })
    }
    onClose()
  }

  if (!referee) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isSuspended ? 'إلغاء إيقاف الحكم' : 'إيقاف الحكم'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            إلغاء
          </Button>
          <Button
            variant={isSuspended ? 'success' : 'danger'}
            onClick={handleSubmit(onSubmit)}
            loading={mutation.isPending}
          >
            {isSuspended ? 'إلغاء الإيقاف' : 'تأكيد الإيقاف'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-white/70">
          الحكم: <strong className="text-gold-500">{referee.full_name}</strong>
        </p>

        {!isSuspended ? (
          <>
            <Input
              label="سبب الإيقاف *"
              placeholder="مثال: خطأ تحكيمي"
              {...register('reason')}
              error={errors.reason?.message}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="من تاريخ *"
                type="date"
                {...register('start_date')}
                error={errors.start_date?.message}
              />
              <Input
                label="إلى تاريخ *"
                type="date"
                {...register('end_date')}
                error={errors.end_date?.message}
              />
            </div>
          </>
        ) : (
          <p className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            ⚠️ سيتم إلغاء الإيقاف عن هذا الحكم فوراً
          </p>
        )}
      </form>
    </Modal>
  )
}