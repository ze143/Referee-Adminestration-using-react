import ReportHeader from './ReportHeader'
import { formatDate, formatTime } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default function MatchesReport({ data = [] }) {
  const excelData = data.map((m) => ({
    'التاريخ': m.match_date,
    'الوقت': m.match_time,
    'المسابقة': m.competitions?.name,
    'المرحلة': m.stage?.name || '',
    'المجموعة': m.group?.name || '',
    'المضيف': m.home_team?.name,
    'الضيف': m.away_team?.name,
    'رئيسي': m.main_referee?.full_name || '',
    'مساعد1': m.assistant1?.full_name || '',
    'مساعد2': m.assistant2?.full_name || '',
    'رابع': m.fourth_referee?.full_name || '',
    'المراقب': m.supervisor?.full_name || '',
    'مبلغ': m.is_notified ? 'نعم' : 'لا',
    'مدفوع': m.is_paid ? 'نعم' : 'لا',
  }))

  return (
    <div>
      <ReportHeader title="تقرير المباريات" data={excelData} filename="تقرير_المباريات" />
      <div id="report-content" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المسابقة</th>
              <th>المضيف</th>
              <th>الضيف</th>
              <th>الطاقم</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id}>
                <td>{formatDate(m.match_date)}</td>
                <td>{m.competitions?.name}</td>
                <td>{m.home_team?.name}</td>
                <td>{m.away_team?.name}</td>
                <td className="text-xs">
                  {m.main_referee?.full_name || '—'}
                </td>
                <td>
                  <Badge variant={m.is_notified ? 'success' : 'warning'} size="sm">
                    {m.is_notified ? 'مبلغ' : 'غير مبلغ'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}