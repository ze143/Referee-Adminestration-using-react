import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UserCog,
  Flag,
  CalendarCheck,
  Star,
  Trophy,
  Coins,
  FileText,
  Eye,
  LogOut,
  X,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const menuItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/admin/supervisors', icon: Eye, label: 'إدارة المراقبين' },
  { to: '/admin/referees', icon: Flag, label: 'إدارة الحكام' },
  { to: '/admin/matches', icon: CalendarCheck, label: 'المباريات والتعيينات' },
  { to: '/admin/evaluations', icon: Star, label: 'تقييمات الحكام' },
  { to: '/admin/competitions', icon: Trophy, label: 'المسابقات والفرق' },
  { to: '/admin/finance', icon: Coins, label: 'المالية' },
  { to: '/admin/reports', icon: FileText, label: 'التقارير' },
  { to: '/admin/users', icon: UserCog, label: 'إدارة المستخدمين' },
]

export default function Sidebar({ open, onClose }) {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay للموبايل */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 right-0 h-screen w-64 z-50 transition-transform duration-300',
          'bg-ink-800/95 backdrop-blur-xl border-l border-white/10',
          'flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
        aria-label="القائمة الجانبية"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-gold-500">لجنة الحكام</div>
            <div className="text-xs text-white/50">نظام الإدارة</div>
          </div>
          {/* ✅ زر الإغلاق مع aria-label */}
          <button
            onClick={onClose}
            className="lg:hidden mr-auto btn-ghost p-1"
            aria-label="إغلاق القائمة الجانبية"
            type="button"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* User */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
              <Users className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || 'مستخدم'}
              </p>
              <p className="text-xs text-gold-500">
                {profile?.role === 'admin'
                  ? 'مدير النظام'
                  : profile?.role === 'editor'
                  ? 'منسق'
                  : 'مشاهد'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="القائمة الرئيسية">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                  'border-r-[3px] border-transparent',
                  isActive
                    ? 'bg-brand-500/10 text-gold-500 border-r-gold-500'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="btn-danger w-full"
            type="button"
            aria-label="تسجيل الخروج من النظام"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  )
}