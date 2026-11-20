import { Link } from 'react-router-dom'
import {
  Flag,
  CheckCircle,
  Ban,
  Calendar,
  Plus,
  UserPlus,
  Trophy,
  UserCog,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import { useDashboardStats } from '@/hooks/useDashboard'
import {
  CompetitionChart,
  DegreeChart,
} from '@/components/features/dashboard/DashboardCharts'
import RecentMatches from '@/components/features/dashboard/RecentMatches'

const QUICK_ACTIONS = [
  { to: '/admin/matches', icon: Plus, label: 'إضافة مباراة', color: 'text-green-400' },
  { to: '/admin/referees', icon: UserPlus, label: 'إضافة حكم', color: 'text-blue-400' },
  { to: '/admin/competitions', icon: Trophy, label: 'إضافة مسابقة', color: 'text-yellow-400' },
  { to: '/admin/users', icon: UserCog, label: 'إدارة المستخدمين', color: 'text-purple-400' },
]

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading || !stats) {
    return <Spinner size="lg" className="py-32" />
  }

  // ✅ تأكد إن البيانات arrays
  const compCounts = Array.isArray(stats.compCounts) ? stats.compCounts : []
  const degreeCounts = stats.degreeCounts && typeof stats.degreeCounts === 'object'
    ? stats.degreeCounts
    : {}

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على النظام" />

      {/* ====== KPI Cards ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Flag}
          value={stats.totalReferees ?? 0}
          label="إجمالي الحكام"
          trend="نشط"
          gradient="from-green-500 to-green-700"
        />
        <KpiCard
          icon={CheckCircle}
          value={stats.activeReferees ?? 0}
          label="حكام نشطين"
          trend="متاح"
          gradient="from-blue-500 to-blue-700"
        />
        <KpiCard
          icon={Ban}
          value={stats.suspendedReferees ?? 0}
          label="حكام موقوفين"
          trend="معلق"
          gradient="from-orange-500 to-orange-700"
        />
        <KpiCard
          icon={Calendar}
          value={stats.matchesThisMonth ?? 0}
          label="مباريات الشهر"
          trend="هذا الشهر"
          gradient="from-purple-500 to-purple-700"
        />
      </div>

      {/* ====== Charts ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <h3 className="text-sm font-bold text-gold-500 mb-3">
            📊 توزيع المباريات حسب المسابقة
          </h3>
          <CompetitionChart data={compCounts} />
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-gold-500 mb-3">
            🥧 توزيع الحكام حسب الدرجة
          </h3>
          <DegreeChart data={degreeCounts} />
        </div>
      </div>

      {/* ====== Recent + Quick Actions ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-gold-500">⚽ أحدث المباريات</h3>
            <Link to="/admin/matches" className="text-xs text-brand-500 hover:text-gold-500">
              عرض الكل →
            </Link>
          </div>
          <RecentMatches />
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-gold-500 mb-4">⚡ إجراءات سريعة</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="glass-card glass-card-hover p-4 text-center transition-all"
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${action.color}`} />
                  <p className="text-xs text-white/80">{action.label}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ====== Pending Matches Alert ====== */}
      {stats.pendingMatches > 0 && (
        <div className="glass-card p-4 border-r-4 border-r-orange-500">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-orange-400" />
            <div className="flex-1">
              <p className="font-bold text-white">
                {stats.pendingMatches} مباراة بدون تعيين حكام
              </p>
              <p className="text-xs text-white/60">
                تحتاج لتعيين الطاقم قبل المباراة
              </p>
            </div>
            <Link to="/admin/matches" className="btn-primary text-sm">
              عرض المباريات
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// KPI Card
// ============================================
function KpiCard({ icon: Icon, value, label, trend, gradient }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-white/80 mt-1">{label}</p>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      <p className="text-xs text-white/60 mt-3">{trend}</p>
    </div>
  )
}