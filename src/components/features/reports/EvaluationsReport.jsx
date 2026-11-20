import ReportHeader from './ReportHeader'
import Badge from '@/components/ui/Badge'

const ROLE_LABELS = {
  main: 'رئيسي', assistant1: 'مساعد 1', assistant2: 'مساعد 2',
  fourth: 'رابع', var: 'VAR', avar: 'AVAR',
}

export default function EvaluationsReport({ data }) {
  const { refereeStats = [], evaluations = [] } = data || {}

  const excelData = refereeStats.map((r) => ({
    'الترتيب': r.rank,
    'الاسم': r.referee_name,
    'المنطقة': r.region,
    'الدرجة': r.degree,
    'عدد التقييمات': r.count,
    'المتوسط': r.avgRating,
    'أعلى': r.maxRating,
    'أقل': r.minRating,
  }))

  return (
    <div>
      <ReportHeader title="تقرير التقييمات" data={excelData} filename="تقرير_التقييمات" />

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-gold-500">{refereeStats.length}</div>
          <div className="text-xs text-white/60">حكام</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{evaluations.length}</div>
          <div className="text-xs text-white/60">تقييم</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {refereeStats[0]?.avgRating || '-'}
          </div>
          <div className="text-xs text-white/60">أعلى متوسط</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-red-400">
            {refereeStats[refereeStats.length - 1]?.avgRating || '-'}
          </div>
          <div className="text-xs text-white/60">أقل متوسط</div>
        </div>
      </div>

      {/* ترتيب الحكام */}
      <div id="report-content" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>المنطقة</th>
              <th>عدد التقييمات</th>
              <th>المتوسط</th>
              <th>أعلى</th>
              <th>أقل</th>
            </tr>
          </thead>
          <tbody>
            {refereeStats.map((r) => (
              <tr key={r.referee_id}>
                <td>
                  {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                </td>
                <td><strong className="text-white">{r.referee_name}</strong></td>
                <td>{r.region}</td>
                <td>{r.count}</td>
                <td><span className="text-gold-500 font-bold">{r.avgRating}</span></td>
                <td className="text-green-400">{r.maxRating}</td>
                <td className="text-red-400">{r.minRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}