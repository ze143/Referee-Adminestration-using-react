import ReportHeader from './ReportHeader'
import Badge from '@/components/ui/Badge'

export default function CompetitionsReport({ data = [] }) {
  const excelData = data.map((c) => ({
    'المسابقة': c.name,
    'الفئة': c.age_category,
    'الفرق': c.teamsCount,
    'المباريات': c.matchesCount,
    'المراحل': c.stagesCount,
    'مدفوع': c.paidCount,
  }))

  return (
    <div>
      <ReportHeader title="تقرير المسابقات" data={excelData} filename="تقرير_المسابقات" />
      <div id="report-content" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>المسابقة</th>
              <th>الفئة</th>
              <th>الفرق</th>
              <th>المباريات</th>
              <th>المراحل</th>
              <th>مدفوع</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td><strong className="text-white">{c.name}</strong></td>
                <td>{c.age_category}</td>
                <td><Badge variant="info">{c.teamsCount}</Badge></td>
                <td><Badge variant="primary">{c.matchesCount}</Badge></td>
                <td>{c.stagesCount}</td>
                <td>{c.paidCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}