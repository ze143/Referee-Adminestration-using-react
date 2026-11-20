import { useEffect, useMemo } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Copy } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useCompetitions } from '@/hooks/useCompetitions'
import { useStages } from '@/hooks/useStages'
import { useGroups } from '@/hooks/useGroups'
import { useTeams } from '@/hooks/useTeams'
import { useCreateMatchesBulk } from '@/hooks/useMatches'

// ============================================
// Schema
// ============================================
const rowSchema = z.object({
  home_team_id: z.string().min(1, 'اختر الفريق المضيف'),
  away_team_id: z.string().min(1, 'اختر الفريق الضيف'),
  stadium: z.string().min(1, 'الملعب مطلوب'),
  match_date: z.string().min(1, 'التاريخ مطلوب'),
  match_time: z.string().min(1, 'الوقت مطلوب'),
})

const schema = z.object({
  competition_id: z.string().min(1, 'اختر المسابقة'),
  stage_id: z.string().optional(),
  group_id: z.string().optional(),
  matches: z.array(rowSchema).min(1, 'أضف مباراة واحدة على الأقل'),
})

const emptyRow = {
  home_team_id: '',
  away_team_id: '',
  stadium: '',
  match_date: '',
  match_time: '',
}

// ============================================
// Modal
// ============================================
export default function MatchFormModal({ open, onClose, onSuccess }) {
  const { data: competitions = [] } = useCompetitions()
  const createBulk = useCreateMatchesBulk()

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      competition_id: '',
      stage_id: '',
      group_id: '',
      matches: [{ ...emptyRow }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'matches',
  })

  const watchedComp = watch('competition_id')
  const watchedStage = watch('stage_id')
  const watchedGroup = watch('group_id')

  const { data: stages = [] } = useStages(watchedComp)
  const { data: groups = [] } = useGroups(watchedStage)
  const { data: teams = [] } = useTeams(watchedComp)

  // ✅ فلترة الفرق بالمرحلة والمجموعة
  const filteredTeams = useMemo(() => {
    // 1. مجموعة مختارة → فرق المجموعة
    if (watchedGroup) {
      return teams.filter((t) => t.group_id === watchedGroup)
    }
    // 2. مرحلة مختارة → فرق المرحلة
    if (watchedStage) {
      return teams.filter((t) => t.stage_id === watchedStage)
    }
    // 3. مفيش → كل الفرق
    return teams
  }, [teams, watchedStage, watchedGroup])

  // ✅ Reset عند الفتح
  useEffect(() => {
    if (open) {
      reset({
        competition_id: '',
        stage_id: '',
        group_id: '',
        matches: [{ ...emptyRow }],
      })
    }
  }, [open, reset])

  // ✅ لما المسابقة تتغير → نصفّر المرحلة والمجموعة
  useEffect(() => {
    if (watchedComp !== undefined) {
      setValue('stage_id', '')
      setValue('group_id', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedComp])

  // ✅ لما المرحلة تتغير → نصفّر المجموعة
  useEffect(() => {
    setValue('group_id', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedStage])

  // ✅ لما الفلترة تتغير → نصفّر اختيارات الفرق اللي مش في القائمة
  useEffect(() => {
    const validIds = new Set(filteredTeams.map((t) => t.id))
    const currentMatches = getValues('matches') || []

    currentMatches.forEach((m, i) => {
      if (m.home_team_id && !validIds.has(m.home_team_id)) {
        setValue(`matches.${i}.home_team_id`, '')
      }
      if (m.away_team_id && !validIds.has(m.away_team_id)) {
        setValue(`matches.${i}.away_team_id`, '')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTeams])

  const copyLastDateTime = () => {
    const lastIndex = fields.length - 1
    if (lastIndex < 0) return
    const lastDate = watch(`matches.${lastIndex}.match_date`)
    const lastTime = watch(`matches.${lastIndex}.match_time`)

    append({
      ...emptyRow,
      match_date: lastDate,
      match_time: lastTime,
    })
  }

  const onSubmit = async (data) => {
    const matchesToInsert = data.matches.map((m) => ({
      competition_id: data.competition_id,
      stage_id: data.stage_id || null,
      group_id: data.group_id || null,
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      stadium: m.stadium,
      match_date: m.match_date,
      match_time: m.match_time,
    }))

    try {
      await createBulk.mutateAsync(matchesToInsert)
      reset()
      onClose()
      onSuccess?.(matchesToInsert.length)
    } catch (e) {
      // errors handled in hook
    }
  }

  const getTeamName = (id) => teams.find((t) => t.id === id)?.name || ''

  // ✅ نص توضيحي للفلترة
  const filterHint = useMemo(() => {
    if (watchedGroup) {
      const g = groups.find((x) => x.id === watchedGroup)
      return g ? `الفرق المتاحة: فرق ${g.name} فقط` : 'الفرق المتاحة: فرق المجموعة المختارة'
    }
    if (watchedStage) {
      const s = stages.find((x) => x.id === watchedStage)
      return s ? `الفرق المتاحة: فرق ${s.name}` : 'الفرق المتاحة: فرق المرحلة المختارة'
    }
    return 'الفرق المتاحة: كل فرق المسابقة'
  }, [watchedGroup, watchedStage, groups, stages])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="إضافة مباريات"
      size="full"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createBulk.isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={createBulk.isPending}>
            حفظ الكل ({fields.length})
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ========== البيانات المشتركة ========== */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-bold text-gold-500 mb-2">
            البيانات المشتركة (تتطبق على كل الصفوف)
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <Controller
              name="competition_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="المسابقة *"
                  value={field.value ?? ''}
                  onChange={(value) => field.onChange(value ?? '')}
                  error={errors.competition_id?.message}
                >
                  <option value="">— اختر مسابقة —</option>
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="stage_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="المرحلة (اختياري)"
                  value={field.value ?? ''}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={!watchedComp}
                >
                  <option value="">بدون مرحلة</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="group_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="المجموعة (اختياري)"
                  value={field.value ?? ''}
                  onChange={(value) => field.onChange(value ?? '')}
                  disabled={!watchedStage}
                >
                  <option value="">بدون مجموعة</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          {watchedComp && (
            <p className="text-xs text-white/50">
              {filterHint} — عدد الفرق: {filteredTeams.length}
            </p>
          )}
          {!watchedComp && (
            <p className="text-xs text-white/40">
              اختر المسابقة أولاً لإظهار المراحل والمجموعات
            </p>
          )}
        </div>

        {/* ========== المباريات ========== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gold-500">المباريات</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={Copy}
                onClick={copyLastDateTime}
                disabled={fields.length === 0}
              >
                نسخ آخر صف
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => append({ ...emptyRow })}
              >
                إضافة صف
              </Button>
            </div>
          </div>

          {!watchedComp ? (
            <div className="p-8 text-center text-white/40 bg-white/5 rounded-lg">
              اختر مسابقة أولاً لإضافة المباريات
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="p-8 text-center text-white/40 bg-white/5 rounded-lg">
              لا توجد فرق متاحة في هذه المجموعة/المرحلة. أضف فرق أولاً من صفحة "المسابقات والفرق".
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const homeTeam = watch(`matches.${index}.home_team_id`)
                const awayTeam = watch(`matches.${index}.away_team_id`)

                return (
                  <div
                    key={field.id}
                    className="glass-card p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gold-500">
                        مباراة #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-400 hover:text-red-300"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      <Controller
                        name={`matches.${index}.home_team_id`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="المضيف *"
                            value={field.value ?? ''}
                            onChange={(value) => field.onChange(value ?? '')}
                            error={errors.matches?.[index]?.home_team_id?.message}
                          >
                            <option value="">اختر الفريق</option>
                            {filteredTeams.map((t) => (
                              <option
                                key={t.id}
                                value={t.id}
                                disabled={t.id === awayTeam}
                              >
                                {t.name}
                              </option>
                            ))}
                          </Select>
                        )}
                      />

                      <Controller
                        name={`matches.${index}.away_team_id`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="الضيف *"
                            value={field.value ?? ''}
                            onChange={(value) => field.onChange(value ?? '')}
                            error={errors.matches?.[index]?.away_team_id?.message}
                          >
                            <option value="">اختر الفريق</option>
                            {filteredTeams.map((t) => (
                              <option
                                key={t.id}
                                value={t.id}
                                disabled={t.id === homeTeam}
                              >
                                {t.name}
                              </option>
                            ))}
                          </Select>
                        )}
                      />

                      <Input
                        label="الملعب *"
                        placeholder="استاد القاهرة"
                        {...register(`matches.${index}.stadium`)}
                        error={errors.matches?.[index]?.stadium?.message}
                      />

                      <Input
                        label="التاريخ *"
                        type="date"
                        {...register(`matches.${index}.match_date`)}
                        error={errors.matches?.[index]?.match_date?.message}
                      />

                      <Input
                        label="الوقت *"
                        type="time"
                        {...register(`matches.${index}.match_time`)}
                        error={errors.matches?.[index]?.match_time?.message}
                      />
                    </div>

                    {homeTeam && awayTeam && (
                      <div className="mt-3 text-xs text-white/50">
                        {getTeamName(homeTeam)} × {getTeamName(awayTeam)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}