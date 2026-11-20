import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Ban,
  ExternalLink,
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/authStore'
import { formatTime } from '@/lib/utils'

export default function NotificationDropdown({ onClose, onUnreadChange }) {
  const { data: notifications = [], isLoading } = useNotifications()
  const [readIds, setReadIds] = useState(new Set())
  const ref = useRef(null)
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role || 'viewer'

  // إغلاق عند الضغط برة
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // تحديث عداد غير المقروء
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read && !readIds.has(n.id)).length
    onUnreadChange(unread)
  }, [notifications, readIds, onUnreadChange])

  const handleClick = (notif) => {
    setReadIds((prev) => new Set([...prev, notif.id]))
    if (notif.link) {
      navigate(notif.link)
      onClose()
    }
  }

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  // ✅ روابط حسب الدور
  const goToAll = () => {
    const target =
      role === 'editor'
        ? '/editor/notifications'
        : role === 'viewer'
        ? '/viewer/notifications'
        : '/admin/notifications'
    navigate(target)
    onClose()
  }

  const typeColors = {
    info: 'text-blue-400 bg-blue-500/20',
    warning: 'text-yellow-400 bg-yellow-500/20',
    danger: 'text-red-400 bg-red-500/20',
    success: 'text-green-400 bg-green-500/20',
  }

  const typeIcons = {
    info: Calendar,
    warning: AlertTriangle,
    danger: Ban,
    success: CheckCircle,
  }

  // آخر 5 إشعارات
  const previewNotifications = notifications.slice(0, 5)

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 w-80 max-h-96 bg-ink-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
        <h3 className="font-bold text-gold-500 text-sm">الإشعارات</h3>
        <button
          onClick={markAllAsRead}
          className="text-xs text-brand-500 hover:text-gold-500"
        >
          تحديد الكل كمقروء
        </button>
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-white/40 text-sm">جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">
            لا توجد إشعارات
          </div>
        ) : (
          previewNotifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell
            const isRead = notif.read || readIds.has(notif.id)
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full p-3 flex items-start gap-3 text-right border-b border-white/5 hover:bg-white/5 transition-colors ${
                  !isRead ? 'bg-brand-500/5' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-full flex-shrink-0 ${
                    typeColors[notif.type] || typeColors.info
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{notif.title}</div>
                  <div className="text-xs text-white/60 mt-0.5 truncate">
                    {notif.message}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">
                    {formatTime(notif.time)}
                  </div>
                </div>
                {!isRead && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1" />
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Footer: View All */}
      {notifications.length > 0 && (
        <button
          onClick={goToAll}
          className="w-full p-3 text-center text-sm font-bold text-brand-500 hover:bg-white/5 border-t border-white/10 transition-colors flex items-center justify-center gap-2"
        >
          عرض كل الإشعارات ({notifications.length})
          <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}