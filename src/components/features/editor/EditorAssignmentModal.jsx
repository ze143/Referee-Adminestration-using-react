import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Flag, Info } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { useReferees } from '@/hooks/useReferees'
import { useUpdateMatch } from '@/hooks/useMatches'
import { formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

export default function EditorAssignmentModal({ open, onClose, match, scope }) {
  const { data: refereesData } = useReferees({ pageSize: 1000 })
  const referees = Array.isArray(refereesData) ? refereesData : (refereesData?.data || [])
  const updateMutation = useUpdateMatch()

  const canAssignMain = scope?.permission_type === 'full'

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()

  const watchedAsst1 = watch('assistant1_referee_id')
  const watchedAsst2 = watch('assistant2_referee_id')

  useEffect(() => {
    if (match) {
      reset({
        main_referee_id: match.main_referee_id || '',
        assistant1_referee_id: match.assistant1_referee_id || '',
        assistant2_referee_id: match.assistant2_referee_id || '',
        fourth_referee_id: match.fourth_referee_id || '',
      })
    }
  }, [match, reset])

  if (!match) return null

  // فلترة الحكام
  const mainReferees = referees.filter(
    (r) => ['referee', 'both'].includes(r.job) || r.degree === 'New'
  )
  const assistantReferees = referees.filter(
    (r) => ['assistant', 'both'].includes(r.job) || r.degree === 'New'
  )

  const mainOptions = mainReferees.map((r) => ({
    value: r.id,
    label: `${r.full_name}${r.region ? ` (${r.region})` : ''}`,
  }))

  const assistantOptions = assistantReferees.map((r) => ({
    value: r.id,
    label: `${r.full_name}${r.region ? ` (${r.region})` : ''}`,
    disabled: r.id === watchedAsst2,
  }))

  const onSubmit = async (data) => {
    // ✅ لو مساعدين فقط، نبعت المساعدين بس
    const payload = {
      id: match.id,
      assistant1_referee_id: data.assistant1_referee_id || null,
      assistant2_referee_id: data.assistant2_referee_id || null,
    }

    if (canAssignMain) {
      payload.main_referee_id = data.main_referee_id || null
      payload.fourth_referee_id = data.fourth_referee_id || null
    }

    try {
      await updateMutation.mutateAsync(payload)
      onClose()
    } catch (e) {
      // errors handled
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تعيين طاقم المباراة"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={updateMutation.isPending}>
            حفظ
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* معلومات المباراة */}
        <div className="bg-white/5 rounded-lg p-3 text-sm">
          <p className="font-bold text-white mb-1">
            {match.home_team?.name} × {match.away_team?.name}
          </p>
          <p className="text-xs text-white/60">
            {formatDate(match.match_date)} — {formatTime(match.match_time)} | {match.stadium}
          </p>
        </div>

        {/* تنبيه الصلاحية */}
        {!canAssignMain && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>يمكنك تعيين المساعدين فقط. الحكم الرئيسي والرابع للقراءة فقط.</span>
          </div>
        )}

        {/* الحكم الرئيسي (قراءة فقط لو مش full) */}
        <div>
          <label className="label flex items-center gap-2">
            <Flag className="w-4 h-4 text-gold-500" />
            الحكم الرئيسي {!canAssignMain && '(قراءة فقط)'}
          </label>
          {canAssignMain ? (
            <Select
              value={match.main_referee_id || ''}
              onChange={(v) => reset({ ...watch(), main_referee_id: v })}
              placeholder="— بدون —"
              searchable
              clearable
              options={mainOptions}
            />
          ) : (
            <div className="input bg-white/[0.02] text-white/60">
              {match.main_referee?.full_name || '— بدون —'}
            </div>
          )}
        </div>

        {/* المساعد الأول */}
        <div>
          <label className="label flex items-center gap-2">
            <Flag className="w-4 h-4 text-gold-500" />
            مساعد أول *
          </label>
          <Select
            value={watch('assistant1_referee_id') || ''}
            onChange={(v) => reset({ ...watch(), assistant1_referee_id: v })}
            placeholder="— بدون —"
            searchable
            clearable
            options={assistantOptions}
          />
        </div>

        {/* المساعد الثاني */}
        <div>
          <label className="label flex items-center gap-2">
            <Flag className="w-4 h-4 text-gold-500" />
            مساعد ثاني *
          </label>
          <Select
            value={watch('assistant2_referee_id') || ''}
            onChange={(v) => reset({ ...watch(), assistant2_referee_id: v })}
            placeholder="— بدون —"
            searchable
            clearable
            options={assistantOptions.map((o) => ({
              ...o,
              disabled: o.value === watchedAsst1,
            }))}
          />
        </div>

        {/* الحكم الرابع (قراءة فقط لو مش full) */}
        <div>
          <label className="label flex items-center gap-2">
            <Flag className="w-4 h-4 text-gold-500" />
            الحكم الرابع {!canAssignMain && '(قراءة فقط)'}
          </label>
          {canAssignMain ? (
            <Select
              value={watch('fourth_referee_id') || ''}
              onChange={(v) => reset({ ...watch(), fourth_referee_id: v })}
              placeholder="— بدون —"
              searchable
              clearable
              options={mainOptions}
            />
          ) : (
            <div className="input bg-white/[0.02] text-white/60">
              {match.fourth_referee?.full_name || '— بدون —'}
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}