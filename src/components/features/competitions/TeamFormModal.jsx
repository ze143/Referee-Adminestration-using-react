import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useCreateTeam, useUpdateTeam } from '@/hooks/useTeams'
import { useStages } from '@/hooks/useStages'
import { useGroups } from '@/hooks/useGroups'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  stage_id: z.string().optional(),
  group_id: z.string().optional(),
})

export default function TeamFormModal({ open, onClose, team, competitionId }) {
  const isEdit = !!team
  const createMutation = useCreateTeam()
  const updateMutation = useUpdateTeam()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', stage_id: '', group_id: '' },
  })

  const watchedStage = watch('stage_id')
  const { data: stages = [] } = useStages(competitionId)
  const { data: groups = [] } = useGroups(watchedStage)

  // ✅ إضافة جديدة — صفّر لما المودال يفتح
  useEffect(() => {
    if (open && !team) {
      reset({ name: '', stage_id: '', group_id: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, team?.id])

  // ✅ تعديل — عبّي البيانات
  useEffect(() => {
    if (open && team) {
      reset({
        name: team.name || '',
        stage_id: team.stage_id || '',
        group_id: team.group_id || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, team?.id])

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        stage_id: data.stage_id || null,
        group_id: data.group_id || null,
      }
      if (isEdit) {
        await updateMutation.mutateAsync({ id: team.id, ...payload })
      } else {
        await createMutation.mutateAsync({
          competition_id: competitionId,
          ...payload,
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
      title={isEdit ? 'تعديل الفريق' : 'إضافة فريق'}
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
          label="اسم الفريق *"
          placeholder="مثال: الأهلي"
          {...register('name')}
          error={errors.name?.message}
        />

        {/* ✅ المرحلة */}
        <Controller
          name="stage_id"
          control={control}
          render={({ field }) => (
            <Select
              label="المرحلة (اختياري)"
              value={field.value ?? ''}
              onChange={(value) => {
                field.onChange(value ?? '')
                setValue('group_id', '')   // لما نغير المرحلة، نصفّر المجموعة
              }}
            >
              <option value="">— بدون مرحلة —</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          )}
        />

        {/* ✅ المجموعة — بس لو فيه مرحلة مختارة */}
        {watchedStage && (
          <Controller
            name="group_id"
            control={control}
            render={({ field }) => (
              <Select
                label="المجموعة (اختياري)"
                value={field.value ?? ''}
                onChange={(value) => field.onChange(value ?? '')}
              >
                <option value="">— بدون مجموعة —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </Select>
            )}
          />
        )}

        {!watchedStage && (
          <p className="text-xs text-white/40">
            اختر المرحلة أولاً لإظهار المجموعات
          </p>
        )}
      </form>
    </Modal>
  )
}