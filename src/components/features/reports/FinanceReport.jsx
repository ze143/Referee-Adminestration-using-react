import ReportHeader from './ReportHeader'
import { formatCurrency } from '@/lib/utils'

export default function FinanceReport({ data = [] }) {
  const excelData = data.map((r) => ({
    'الحكم': r.referee_name,
    'المباريات': r.matches,
    'الإجمالي': r.total.toFixed(2),
    'الخصم': r.deduction.toFixed(2),
    'الصافي': r.net.toFixed(2),
  }))

  return (
    <div>
      <ReportHeader title="تقرير المالية" data={excelData} filename="تقرير_المالية" />
      <div id="report-content" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>الحكم</th>
              <th>المباريات</th>
              <th>الإجمالي</th>
              <th>الخصم (10%)</th>
              <th>الصافي</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.referee_id}>
                <td><strong className="text-white">{r.referee_name}</strong></td>
                <td>{r.matches}</td>
                <td className="text-green-400">{formatCurrency(r.total)}</td>
                <td className="text-red-400">{formatCurrency(r.deduction)}</td>
                <td className="text-gold-500 font-bold">{formatCurrency(r.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}