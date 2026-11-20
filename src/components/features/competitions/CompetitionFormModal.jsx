import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  useCreateCompetition,
  useUpdateCompetition,
} from '@/hooks/useCompetitions'
import { useRoleFees, useSaveRoleFees } from '@/hooks/useRoleFees'
import { ROLES_LIST } from '@/lib/finance-config'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  age_category: z.string().min(1, 'الفئة العمرية مطلوبة'),
  payout_source: z.enum(['federation', 'club']),
})

const PAYOUT_OPTIONS = [
  { value: 'federation', label: 'الاتحاد' },
  { value: 'club', label: 'النادي' },
]

export default function CompetitionFormModal({ open, onClose, competition }) {
  const isEdit = !!competition
  const createMutation = useCreateCompetition()
  const updateMutation = useUpdateCompetition()
  const saveRoleFees = useSaveRoleFees()

  // ✅ query
  const { data: existingFees } = useRoleFees(competition?.id)

  // ✅ roleFees state
  const [roleFees, setRoleFees] = useState({
    main: 0,
    assistant1: 0,
    assistant2: 0,
    fourth: 0,
    var: 0,
    avar: 0,
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      payout_source: 'federation',
    },
  })

  // ✅ تعبئة الفورم — depend on `competition?.id` (string) مش object
  useEffect(() => {
    if (competition) {
      reset({
        name: competition.name || '',
        age_category: competition.age_category || '',
        payout_source: competition.payout_source || 'federation',
      })
    } else {
      reset({
        name: '',
        age_category: '',
        payout_source: 'federation',
      })
    }
  }, [competition?.id, reset])  // ✅ depend on id بس

  // ✅ تعبئة البدلات — depend on existingFees?.length (رقم) مش array
  useEffect(() => {
    const fees = { main: 0, assistant1: 0, assistant2: 0, fourth: 0, var: 0, avar: 0 }
    if (existingFees && Array.isArray(existingFees)) {
      existingFees.forEach((f) => {
        fees[f.role] = f.fee || 0
      })
    }
    setRoleFees(fees)
  }, [existingFees?.length])  // ✅ depend on length بس

  const onSubmit = async (data) => {
    try {
      let compId = competition?.id

      if (isEdit) {
        await updateMutation.mutateAsync({ id: compId, ...data })
      } else {
        const result = await createMutation.mutateAsync(data)
        compId = result.id
      }

      if (compId) {
        await saveRoleFees.mutateAsync({
          competitionId: compId,
          fees: roleFees,
        })
      }

      onClose()
    } catch (e) {
      // errors handled
    }
  }

  const loading =
    createMutation.isPending || updateMutation.isPending || saveRoleFees.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل المسابقة' : 'إضافة مسابقة'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={loading}>
            {isEdit ? 'تحديث' : 'إضافة'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ====== بيانات المسابقة ====== */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gold-500">بيانات المسابقة</h3>

          <Input
            label="اسم المسابقة *"
            placeholder="مثال: الدوري المصري الممتاز"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="الفئة العمرية *"
            placeholder="مثال: كبار"
            {...register('age_category')}
            error={errors.age_category?.message}
          />

          {/* ✅ Select مع Controller */}
          <Controller
            name="payout_source"
            control={control}
            render={({ field }) => (
              <Select
                label="مصدر المكافأة *"
                value={field.value}
                onChange={field.onChange}
                options={PAYOUT_OPTIONS}
                variant="modal"
              />
            )}
          />
        </div>

        {/* ====== بدلات الأدوار ====== */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-bold text-gold-500 mb-3">
            بدلات الأدوار (قيمة ثابتة لكل مباراة)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ROLES_LIST.map((role) => (
              <div key={role.value}>
                <label className="label text-xs">{role.label}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={roleFees[role.value] || 0}
                  onChange={(e) =>
                    setRoleFees((prev) => ({
                      ...prev,
                      [role.value]: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="input bg-ink-900 border-white/20"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">
            💡 البدل = قيمة ثابتة لكل مباراة (مش نسبة)
          </p>
        </div>
      </form>
    </Modal>
  )
}