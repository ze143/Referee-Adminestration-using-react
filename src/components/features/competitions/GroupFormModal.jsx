import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useCreateGroup, useUpdateGroup } from '@/hooks/useGroups'

const schema = z.object({
  name: z.string().min(1, 'اسم المجموعة مطلوب'),
})

export default function GroupFormModal({ open, onClose, group, stageId }) {
  const isEdit = !!group
  const createMutation = useCreateGroup()
  const updateMutation = useUpdateGroup()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    reset({ name: group?.name || '' })
  }, [group, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: group.id,
          name: data.name,
          stage_id: stageId,
        })
      } else {
        await createMutation.mutateAsync({
          stage_id: stageId,
          name: data.name,
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
      title={isEdit ? 'تعديل المجموعة' : 'إضافة مجموعة'}
      size="sm"
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="اسم المجموعة *"
          placeholder="مثال: المجموعة أ"
          {...register('name')}
          error={errors.name?.message}
        />
      </form>
    </Modal>
  )
}