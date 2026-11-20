import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Lock, Mail, Trophy } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
})

// ✅ خريطة التوجيه حسب الدور
const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  editor: '/editor/dashboard',
  viewer: '/viewer/dashboard',
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    try {
      setLoading(true)

      // 1. تسجيل الدخول
      await login(data.email, data.password)

      // 2. جلب الدور من الـ store
      const { profile } = useAuthStore.getState()
      const role = profile?.role || 'viewer'

      console.log('🔍 Login success:', { email: data.email, role })

      toast.success('تم تسجيل الدخول بنجاح')

      // 3. التوجيه حسب الدور
      const targetRoute = ROLE_ROUTES[role] || '/login'
      console.log('🚀 Navigating to:', targetRoute)
      navigate(targetRoute, { replace: true })
    } catch (error) {
      console.error('❌ Login failed:', error)
      toast.error(error.message || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-brand mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">
            لجنة الحكام
          </h1>
          <p className="text-white/60">نظام إدارة الحكام والمباريات</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="user@example.com"
                  className="input pr-10"
                  dir="ltr"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="input pr-10"
                  dir="ltr"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-8">
          © 2026 جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  )
}