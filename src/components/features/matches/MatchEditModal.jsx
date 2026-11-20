import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useCompetitions } from '@/hooks/useCompetitions'
import { useStages } from '@/hooks/useStages'
import { useGroups } from '@/hooks/useGroups'
import { useTeams } from '@/hooks/useTeams'
import { useUpdateMatch } from '@/hooks/useMatches'

const schema = z.object({
  competition_id: z.string().min(1, 'اختر المسابقة'),
  stage_id: z.string().optional(),
  group_id: z.string().optional(),
  home_team_id: z.string().min(1, 'اختر المضيف'),
  away_team_id: z.string().min(1, 'اختر الضيف'),
  stadium: z.string().min(1, 'الملعب مطلوب'),
  match_date: z.string().min(1, 'التاريخ مطلوب'),
  match_time: z.string().min(1, 'الوقت مطلوب'),
  notes: z.string().optional(),
})

export default function MatchEditModal({ open, onClose, match }) {
  console.log('🔍 [MatchEditModal] Rendering with match:', match?.id)

  const { data: competitions = [] } = useCompetitions()
  const updateMutation = useUpdateMatch()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    // ✅ مش بنحط defaultValues — الـ reset هو اللي هيعبّي
  })

  const watchedComp = watch('competition_id')
  const watchedStage = watch('stage_id')

  const { data: stages = [] } = useStages(watchedComp)
  const { data: groups = [] } = useGroups(watchedStage)
  const { data: teams = [] } = useTeams(watchedComp)

  // ✅ تعبئة الفورم عند التحميل
  useEffect(() => {
    if (match) {
      console.log('🔍 [MatchEditModal] Resetting form with:', {
        competition_id: match.competition_id,
        stage_id: match.stage_id,
        group_id: match.group_id,
      })

      reset({
        competition_id: match.competition_id || '',
        stage_id: match.stage_id || '',
        group_id: match.group_id || '',
        home_team_id: match.home_team_id || '',
        away_team_id: match.away_team_id || '',
        stadium: match.stadium || '',
        match_date: match.match_date || '',
        match_time: match.match_time ? match.match_time.slice(0, 5) : '',
        notes: match.notes || '',
      })
    }
  }, [match, reset])

  // ✅ لو المستخدم غيّر المرحلة يدوياً، صفّر المجموعة
  useEffect(() => {
    if (match && watchedStage && watchedStage !== match.stage_id) {
      setValue('group_id', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedStage])

  // ✅ لو المستخدم غيّر المسابقة يدوياً، صفّر المرحلة والمجموعة
  useEffect(() => {
    if (match && watchedComp && watchedComp !== match.competition_id) {
      setValue('stage_id', '')
      setValue('group_id', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedComp])

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        id: match.id,
        competition_id: data.competition_id,
        stage_id: data.stage_id || null,
        group_id: data.group_id || null,
        home_team_id: data.home_team_id,
        away_team_id: data.away_team_id,
        stadium: data.stadium,
        match_date: data.match_date,
        match_time: data.match_time,
        notes: data.notes || null,
      })
      onClose()
    } catch (e) {
      // errors handled in hook
    }
  }

  if (!match) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`تعديل: ${match.home_team?.name || '—'} × ${match.away_team?.name || '—'}`}
      size="lg"
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
        <div className="grid md:grid-cols-3 gap-3">
          <Select
            label="المسابقة *"
            {...register('competition_id')}
            error={errors.competition_id?.message}
          >
            <option value="">— اختر —</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select
            label="المرحلة (اختياري)"
            {...register('stage_id')}
            disabled={!watchedComp}
          >
            <option value="">بدون مرحلة</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>

          <Select
            label="المجموعة (اختياري)"
            {...register('group_id')}
            disabled={!watchedStage}
          >
            <option value="">بدون مجموعة</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <Select
            label="المضيف *"
            {...register('home_team_id')}
            error={errors.home_team_id?.message}
          >
            <option value="">— اختر —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>

          <Select
            label="الضيف *"
            {...register('away_team_id')}
            error={errors.away_team_id?.message}
          >
            <option value="">— اختر —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Input label="الملعب *" {...register('stadium')} error={errors.stadium?.message} />
          <Input label="التاريخ *" type="date" {...register('match_date')} error={errors.match_date?.message} />
          <Input label="الوقت *" type="time" {...register('match_time')} error={errors.match_time?.message} />
        </div>

        <Input label="ملاحظات" {...register('notes')} />
      </form>
    </Modal>
  )
}