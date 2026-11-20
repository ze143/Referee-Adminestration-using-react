import { useEditorScope } from '@/hooks/useEditorScope'
import { useMatches } from '@/hooks/useMatches'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import {
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  Info,
} from 'lucide-react'

export default function EditorDashboard() {
  const { data: scope, isLoading: scopeLoading } = useEditorScope()
  const { data: matchesData, isLoading: matchLoading } = useMatches({
    pageSize: 1000,
    filters: {
      competition_id: scope?.competition_id || undefined,
      date: scope?.assigned_date || undefined,
    },
  })

  const matches = matchesData?.data || []

  // إحصائيات
  const totalMatches = matches.length
  const assignedMatches = matches.filter(
    (m) => m.main_referee_id || m.assistant1_referee_id || m.assistant2_referee_id
  ).length
  const pendingMatches = totalMatches - assignedMatches

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم المحرر"
        subtitle="نظرة عامة على نطاق صلاحياتك"
      />

      {/* Scope Info */}
      <div className="glass-card p-4 border-r-4 border-r-yellow-500">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">نطاق صلاحياتك</h3>
            {scopeLoading ? (
              <p className="text-white/60 text-sm">جاري التحميل...</p>
            ) : !scope ? (
              <p className="text-white/60 text-sm">⚠️ لم يتم تعيين صلاحيات لك</p>
            ) : (
              <div className="space-y-1 text-sm text-white/70">
                <p>
                  <strong className="text-gold-500">المسابقة:</strong>{' '}
                  {scope.competitions?.name || 'جميع المسابقات'}
                </p>
                <p>
                  <strong className="text-gold-500">التاريخ:</strong>{' '}
                  {scope.assigned_date
                    ? new Date(scope.assigned_date).toLocaleDateString('ar-EG')
                    : 'جميع التواريخ'}
                </p>
                <p>
                  <strong className="text-gold-500">نوع الصلاحية:</strong>{' '}
                  {scope.permission_type === 'full'
                    ? '🔸 كامل (حكام + مساعدين)'
                    : '🔹 مساعدين فقط'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          icon={Calendar}
          value={totalMatches}
          label="إجمالي المباريات"
          gradient="from-blue-500 to-blue-700"
        />
        <KpiCard
          icon={CheckCircle}
          value={assignedMatches}
          label="مباريات معينة"
          gradient="from-green-500 to-green-700"
        />
        <KpiCard
          icon={Clock}
          value={pendingMatches}
          label="بحاجة لتعيين"
          gradient="from-orange-500 to-orange-700"
        />
      </div>

      {/* Loading */}
      {matchLoading && <Spinner size="lg" className="py-8" />}
    </div>
  )
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
  )
}