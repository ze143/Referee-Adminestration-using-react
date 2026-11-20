import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  Flag,
  FileText,
  LogOut,
  X,
  User,
  Trophy,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const menuItems = [
  { to: '/editor/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/editor/matches', icon: CalendarCheck, label: 'المباريات والتعيينات' },
  { to: '/editor/referees', icon: Flag, label: 'الحكام (عرض فقط)' },
  { to: '/editor/reports', icon: FileText, label: 'التقارير (عرض فقط)' },
]

export default function EditorSidebar({ open, onClose }) {
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed top-0 right-0 h-screen w-64 z-50 transition-transform duration-300',
          'bg-ink-800/95 backdrop-blur-xl border-l border-white/10',
          'flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gold-500">لجنة الحكام</h2>
            <p className="text-xs text-white/50">وضع المحرر</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden mr-auto btn-ghost p-1"
            aria-label="إغلاق القائمة الجانبية"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || 'منسق'}
              </p>
              <p className="text-xs text-yellow-400">📝 محرر مشروط</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
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
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="btn-danger w-full">
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  )
}