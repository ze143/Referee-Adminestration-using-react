import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Ban,
  ExternalLink,
  CheckCheck,
  FileText,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/authStore'
import { formatTime, formatDate } from '@/lib/utils'

// ============================================
// تصنيفات الإشعارات حسب الدور
// ============================================
const FILTERS_BY_ROLE = {
  admin: [
    { id: 'all', label: 'الكل' },
    { id: 'matches', label: 'المباريات' },
    { id: 'referees', label: 'الحكام' },
    { id: 'system', label: 'النظام' },
  ],
  editor: [
    { id: 'all', label: 'الكل' },
    { id: 'matches', label: 'المباريات' },
  ],
  viewer: [
    { id: 'all', label: 'الكل' },
    { id: 'matches', label: 'المباريات' },
    { id: 'reports', label: 'التقارير' },
  ],
}

const TYPE_ICONS = {
  info: Calendar,
  warning: AlertTriangle,
  danger: Ban,
  success: CheckCircle,
}

const TYPE_COLORS = {
  info: 'text-blue-400 bg-blue-500/20',
  warning: 'text-yellow-400 bg-yellow-500/20',
  danger: 'text-red-400 bg-red-500/20',
  success: 'text-green-400 bg-green-500/20',
}

const TYPE_LABELS = {
  info: 'معلومات',
  warning: 'تحذير',
  danger: 'خطر',
  success: 'نجاح',
}

const PAGE_TITLES = {
  admin: 'الإشعارات',
  editor: 'إشعارات المنسق',
  viewer: 'إشعارات المشاهد',
}

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications()
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role || 'viewer'
  const [filter, setFilter] = useState('all')
  const [readIds, setReadIds] = useState(new Set())
  const navigate = useNavigate()

  const filters = FILTERS_BY_ROLE[role] || FILTERS_BY_ROLE.viewer

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications
    return notifications.filter((n) => n.category === filter)
  }, [notifications, filter])

  const unreadCount = notifications.filter(
    (n) => !n.read && !readIds.has(n.id)
  ).length

  const handleClick = (notif) => {
    setReadIds((prev) => new Set([...prev, notif.id]))
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_TITLES[role] || 'الإشعارات'}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} إشعار غير مقروء من ${notifications.length}`
            : `${notifications.length} إشعار`
        }
        actions={
          unreadCount > 0 && (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={markAllAsRead}
            >
              تحديد الكل كمقروء
            </Button>
          )
        }
      />

      {/* Filter Tabs — حسب الدور */}
      <div className="glass-card p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-gradient-brand text-white'
                : 'text-white/60 hover:bg-white/5'
            }`}
          >
            {f.label}
            {f.id === 'all' && unreadCount > 0 && (
              <Badge variant="danger" size="sm" className="mr-2">
                {unreadCount}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <Spinner size="lg" className="py-16" />
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            icon={Bell}
            title="لا توجد إشعارات"
            description="لا توجد إشعارات في هذا التصنيف"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell
            const isRead = notif.read || readIds.has(notif.id)
            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/5 ${
                  !isRead ? 'border-r-4 border-r-brand-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-3 rounded-full flex-shrink-0 ${
                      TYPE_COLORS[notif.type] || TYPE_COLORS.info
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-bold text-white">{notif.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="gray" size="sm">
                          {TYPE_LABELS[notif.type] || 'إشعار'}
                        </Badge>
                        {!isRead && (
                          <Badge variant="danger" size="sm">
                            جديد
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-white/70 mt-1">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span>{formatTime(notif.time)}</span>
                      {notif.date && (
                        <>
                          <span>•</span>
                          <span>{formatDate(notif.date)}</span>
                        </>
                      )}
                      {notif.link && (
                        <>
                          <span>•</span>
                          <span className="text-brand-500 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            عرض التفاصيل
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}