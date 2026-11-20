import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { DEGREES, JOBS, REGIONS } from '@/types/constants'
import { useCreateReferee, useUpdateReferee } from '@/hooks/useReferees'

const schema = z.object({
  full_name: z.string().min(3, 'الاسم 3 أحرف على الأقل'),
  region: z.string().min(1, 'المنطقة مطلوبة'),
  birth_date: z.string().min(1, 'تاريخ الميلاد مطلوب'),
  degree: z.enum(['1st', '2nd', '3rd', 'International', 'New']),
  job: z.enum(['referee', 'assistant', 'both']),
  phone: z.string().optional(),
  address: z.string().optional(),
  has_var_license: z.boolean().optional(),
  has_avar_license: z.boolean().optional(),
})

export default function RefereeFormModal({ open, onClose, referee = null }) {
  const isEdit = !!referee
  const createMutation = useCreateReferee()
  const updateMutation = useUpdateReferee()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      degree: '3rd',
      job: 'referee',
      has_var_license: false,
      has_avar_license: false,
    },
  })

  useEffect(() => {
    if (referee) {
      reset({
        full_name: referee.full_name || '',
        region: referee.region || '',
        birth_date: referee.birth_date || '',
        degree: referee.degree || '3rd',
        job: referee.job || 'referee',
        phone: referee.phone || '',
        address: referee.address || '',
        has_var_license: referee.has_var_license || false,
        has_avar_license: referee.has_avar_license || false,
      })
    } else {
      reset({
        full_name: '',
        region: '',
        birth_date: '',
        degree: '3rd',
        job: 'referee',
        phone: '',
        address: '',
        has_var_license: false,
        has_avar_license: false,
      })
    }
  }, [referee, reset])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: referee.id, ...data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose()
    } catch (err) {
      // errors handled in hooks
    }
  }

  const loading = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل بيانات الحكم' : 'إضافة حكم جديد'}
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
        <Input
          label="الاسم الرباعي *"
          placeholder="محمد أحمد علي حسن"
          {...register('full_name')}
          error={errors.full_name?.message}
        />

        <div className="grid md:grid-cols-2 gap-4">
          {/* ✅ Controller للمنطقة */}
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
                <option value="">اختر المنطقة</option>
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            )}
          />

          <Input
            label="تاريخ الميلاد *"
            type="date"
            {...register('birth_date')}
            error={errors.birth_date?.message}
          />

          {/* ✅ Controller للدرجة */}
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <Select
                label="الدرجة *"
                value={field.value ?? ''}
                onChange={(value) => field.onChange(value ?? '')}
                error={errors.degree?.message}
              >
                {DEGREES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            )}
          />

          {/* ✅ Controller للوظيفة */}
          <Controller
            name="job"
            control={control}
            render={({ field }) => (
              <Select
                label="الوظيفة *"
                value={field.value ?? ''}
                onChange={(value) => field.onChange(value ?? '')}
                error={errors.job?.message}
              >
                {JOBS.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
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

          <Input
            label="العنوان"
            placeholder="العنوان بالتفصيل"
            {...register('address')}
            error={errors.address?.message}
          />
        </div>

        <div>
          <label className="label">صلاحيات VAR</label>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('has_var_license')}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-white/80">VAR</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('has_avar_license')}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-white/80">AVAR</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  )
}