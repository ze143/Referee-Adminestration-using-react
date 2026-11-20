import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useCreateStage, useUpdateStage } from '@/hooks/useStages'

const schema = z.object({
  name: z.string().min(1, 'اسم المرحلة مطلوب'),
  stage_type: z.enum(['league', 'group', 'knockout']),
  order_num: z.coerce.number().min(0),
})

export default function StageFormModal({ open, onClose, stage, competitionId }) {
  const isEdit = !!stage
  const createMutation = useCreateStage()
  const updateMutation = useUpdateStage()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', stage_type: 'group', order_num: 0 },
  })

  useEffect(() => {
    if (stage) {
      reset({
        name: stage.name || '',
        stage_type: stage.stage_type || 'group',
        order_num: stage.order_num ?? 0,
      })
    } else {
      reset({ name: '', stage_type: 'group', order_num: 0 })
    }
  }, [stage, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: stage.id,
          competition_id: competitionId,
          ...data,
        })
      } else {
        await createMutation.mutateAsync({
          competition_id: competitionId,
          ...data,
        })
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
      title={isEdit ? 'تعديل المرحلة' : 'إضافة مرحلة'}
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
          label="اسم المرحلة *"
          placeholder="مثال: دور التمهيدي / المجموعة أ"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* ✅ Select بيبعت القيمة مباشرة — Controller هو الصح */}
          <Controller
            name="stage_type"
            control={control}
            render={({ field }) => (
              <Select
                label="نوع المرحلة *"
                value={field.value}
                onChange={(value) => field.onChange(value)}
                error={errors.stage_type?.message}
              >
                <option value="league">دوري</option>
                <option value="group">مجموعات</option>
                <option value="knockout">خروج المغلوب</option>
              </Select>
            )}
          />

          <Controller
            name="order_num"
            control={control}
            render={({ field }) => (
              <Input
                label="الترتيب *"
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={errors.order_num?.message}
              />
            )}
          />
        </div>
      </form>
    </Modal>
  )
}