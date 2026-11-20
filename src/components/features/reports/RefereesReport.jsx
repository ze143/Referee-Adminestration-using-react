import { memo } from 'react'
import Badge from '@/components/ui/Badge'
import ReportHeader from './ReportHeader'

function RefereesReport({ data = [] }) {
  const excelData = data.map((r) => ({
    'الاسم': r.full_name,
    'المنطقة': r.region || '',
    'الدرجة': r.degree,
    'الوظيفة': r.job,
    'إجمالي المباريات': r.matchCount,
    'رئيسي': r.mainCount,
    'مساعد': r.asstCount,
    'رابع': r.fourthCount,
    'VAR/AVAR': r.varCount,
    'أعذار': r.excuseCount,
    'إيقافات': r.suspensionCount,
    'متوسط التقييم': r.avgRating,
    'عدد التقييمات': r.evalCount,
  }))

  return (
    <div>
      <ReportHeader title="تقرير الحكام" data={excelData} filename="تقرير_الحكام" />
      <div id="report-content" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>المنطقة</th>
              <th>الدرجة</th>
              <th>الوظيفة</th>
              <th>المباريات</th>
              <th>رئيسي</th>
              <th>مساعد</th>
              <th>رابع</th>
              <th>VAR</th>
              <th>أعذار</th>
              <th>إيقافات</th>
              <th>متوسط التقييم</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td><strong className="text-white">{r.full_name}</strong></td>
                <td>{r.region || '-'}</td>
                <td><Badge variant="info" size="sm">{r.degree}</Badge></td>
                <td>{r.job}</td>
                <td><Badge variant="primary">{r.matchCount}</Badge></td>
                <td>{r.mainCount}</td>
                <td>{r.asstCount}</td>
                <td>{r.fourthCount}</td>
                <td>{r.varCount}</td>
                <td>{r.excuseCount}</td>
                <td>{r.suspensionCount}</td>
                <td>
                  <span className="text-gold-500 font-bold">{r.avgRating}</span>
                  <span className="text-xs text-white/40"> ({r.evalCount})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default memo(RefereesReport)