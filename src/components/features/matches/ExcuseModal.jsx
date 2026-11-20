import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const CREW = [
  { key: 'main_referee', role: 'main', label: 'رئيسي' },
  { key: 'assistant1', role: 'assistant1', label: 'مساعد أول' },
  { key: 'assistant2', role: 'assistant2', label: 'مساعد ثاني' },
  { key: 'fourth_referee', role: 'fourth', label: 'رابع' },
  { key: 'var_referee', role: 'var', label: 'VAR' },
  { key: 'avar_referee', role: 'avar', label: 'AVAR' },
]

const FIELD_MAP = {
  main: 'main_referee_id',
  assistant1: 'assistant1_referee_id',
  assistant2: 'assistant2_referee_id',
  fourth: 'fourth_referee_id',
  var: 'var_referee_id',
  avar: 'avar_referee_id',
}

export default function ExcuseModal({ open, onClose, match }) {
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      referee_id: '',
      reason: '',
      notes: '',
      excuse_date: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        referee_id: '',
        reason: '',
        notes: '',
        excuse_date: new Date().toISOString().split('T')[0],
      })
    }
  }, [open, reset])

  if (!match) return null

  const crew = CREW.filter((c) => match[c.key]?.id).map((c) => ({
    id: match[c.key].id,
    name: match[c.key].full_name,
    role: c.role,
    label: c.label,
  }))

  const onSubmit = async (data) => {
    if (!data.referee_id || !data.reason) {
      toast.error('اختر الحكم والسبب')
      return
    }

    setLoading(true)
    try {
      const selectedReferee = crew.find((c) => c.id === data.referee_id)
      if (!selectedReferee) throw new Error('الحكم غير موجود')

      // 1. سجل العذر
      const { error: excuseErr } = await supabase.from('referee_excuses').insert([
        {
          referee_id: data.referee_id,
          match_id: match.id,
          excuse_date: data.excuse_date,
          reason: data.reason,
          notes: data.notes || null,
          status: 'accepted',
        },
      ])
      if (excuseErr) throw excuseErr

      // 2. سجل التعيينات
      await supabase.from('match_assignments_history').insert([
        {
          match_id: match.id,
          referee_id: data.referee_id,
          role: selectedReferee.role,
          status: 'excused',
          notes: data.reason,
        },
      ])

      // 3. إزالة الحكم من المباراة
      const field = FIELD_MAP[selectedReferee.role]
      const { error: updateErr } = await supabase
        .from('matches')
        .update({ [field]: null })
        .eq('id', match.id)
      if (updateErr) throw updateErr

      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['match-details'] })
      toast.success('تم تسجيل الاعتذار')
      onClose()
    } catch (err) {
      toast.error(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تسجيل اعتذار حكم"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit(onSubmit)}
            loading={loading}
            disabled={crew.length === 0}
          >
            تسجيل الاعتذار
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white/5 rounded-lg p-3 text-sm">
          <span className="text-white/60">المباراة: </span>
          <strong className="text-white">
            {match.home_team?.name} × {match.away_team?.name}
          </strong>
        </div>

        {crew.length === 0 ? (
          <p className="text-white/60 text-center py-4">
            لا يوجد حكام معينين في هذه المباراة
          </p>
        ) : (
          <>
            {/* ✅ select عادي بدل Select */}
            <div>
              <label className="label">الحكم المعتذر *</label>
              <select
                {...register('referee_id', { required: true })}
                className="input"
              >
                <option value="">— اختر الحكم —</option>
                {crew.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">السبب *</label>
              <select
                {...register('reason', { required: true })}
                className="input"
              >
                <option value="">— اختر السبب —</option>
                <option value="مرض">مرض</option>
                <option value="ظروف عائلية">ظروف عائلية</option>
                <option value="سفر">سفر</option>
                <option value="إصابة">إصابة</option>
                <option value="ظروف خاصة">ظروف خاصة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <Input
              label="تفاصيل إضافية"
              placeholder="أدخل تفاصيل..."
              {...register('notes')}
            />

            <Input
              label="تاريخ الاعتذار"
              type="date"
              {...register('excuse_date')}
            />

            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs p-3 rounded-lg">
              ⚠️ سيتم إزالة الحكم من المباراة تلقائياً
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}