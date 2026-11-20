import { useDashboardStats } from "@/hooks/useDashboard";
import { useRecentMatches } from "@/hooks/useDashboard";
import PageHeader from "@/components/ui/PageHeader";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import {
  CompetitionChart,
  DegreeChart,
} from "@/components/features/dashboard/DashboardCharts";
import { formatDate, formatTime } from "@/lib/utils";
import { Flag, CheckCircle, Ban, Calendar, Eye } from "lucide-react";

export default function ViewerDashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: recentMatches = [] } = useRecentMatches();
  const today = new Date().toISOString().split("T")[0];

  if (isLoading || !stats) return <Spinner size="lg" className="py-32" />;

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على النظام" />

      {/* Read-only notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-300 flex items-center gap-2">
        <Eye className="w-5 h-5 flex-shrink-0" />
        <span>هذه لوحة للعرض فقط — يمكنك مشاهدة جميع البيانات</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Flag}
          value={stats.totalReferees}
          label="إجمالي الحكام"
          gradient="from-green-500 to-green-700"
        />
        <KpiCard
          icon={CheckCircle}
          value={stats.activeReferees}
          label="حكام نشطين"
          gradient="from-blue-500 to-blue-700"
        />
        <KpiCard
          icon={Ban}
          value={stats.suspendedReferees}
          label="حكام موقوفين"
          gradient="from-orange-500 to-orange-700"
        />
        <KpiCard
          icon={Calendar}
          value={stats.matchesThisMonth}
          label="مباريات الشهر"
          gradient="from-purple-500 to-purple-700"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <h3 className="text-sm font-bold text-gold-500 mb-3">
            📊 توزيع المباريات حسب المسابقة
          </h3>
          <CompetitionChart data={stats.compCounts} />
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-gold-500 mb-3">
            🥧 توزيع الحكام حسب الدرجة
          </h3>
          <DegreeChart data={stats.degreeCounts} />
        </div>
      </div>

      {/* Recent Matches */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-gold-500">⚽ أحدث المباريات</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المضيف</th>
                <th>الضيف</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recentMatches.map((m) => {
                const isPast = m.match_date < today;
                return (
                  <tr key={m.id}>
                    <td>
                      {formatDate(m.match_date)}
                      <span className="text-xs text-white/40 mr-1">
                        {formatTime(m.match_time)}
                      </span>
                    </td>
                    <td>
                      <strong className="text-white">
                        {m.home_team?.name}
                      </strong>
                    </td>
                    <td>
                      <strong className="text-white">
                        {m.away_team?.name}
                      </strong>
                    </td>
                    <td>
                      <Badge variant={isPast ? "gray" : "success"} size="sm">
                        {isPast ? "منتهية" : "قادمة"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, value, label, gradient }) {
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
    </div>
  );
}
