import { useState, useEffect } from 'react'
import { Menu, Clock, Bell, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import NotificationDropdown from './NotificationDropdown'

export default function Topbar({ onMenuClick }) {
  const [time, setTime] = useState(new Date())
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const profile = useAuthStore((s) => s.profile)

  // ✅ ساعة حية
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  return (
    <header className="sticky top-0 z-30 bg-ink-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Left: Menu + Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden btn-ghost p-2"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gold-500">
              أهلاً، {profile?.full_name || 'المدير'} 👋
            </h1>
          </div>
        </div>

        {/* Right: Clock + Notifications */}
        <div className="flex items-center gap-4">
          {/* ✅ Live Clock */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-gold-500" />
            <p className="text-xs text-white/80">
              {time.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <span className="text-white/20 mx-1">|</span>
            <Clock className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-mono text-white" dir="ltr">
              {formatTime(time)}
            </span>
          </div>

          {/* ✅ Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative btn-ghost p-2"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <NotificationDropdown
                onClose={() => setNotificationsOpen(false)}
                onUnreadChange={setUnreadCount}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}