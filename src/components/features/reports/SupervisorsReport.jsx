import ReportHeader from './ReportHeader'
import Badge from '@/components/ui/Badge'
import { Video, Eye } from 'lucide-react'

export default function SupervisorsReport({ data = [] }) {
  const excelData = data.map((s) => ({
    'الاسم': s.full_name,
    'النوع': s.is_video_supervisor ? 'مراقب فيديو' : 'مراقب حكام',
    'المنطقة': s.region,
    'الهاتف': s.phone,
    'مباريات كمراقب': s.supervisorMatches,
    'مباريات كمراقب فيديو': s.videoMatches,
    'الإجمالي': s.totalMatches,
  }))

  return (
    <div>
      <ReportHeader title="تقرير المراقبين" data={excelData} filename="تقرير_المراقبين" />
      <div id="report-content" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>النوع</th>
              <th>المنطقة</th>
              <th>مراقب حكام</th>
              <th>مراقب فيديو</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td><strong className="text-white">{s.full_name}</strong></td>
                <td>
                  {s.is_video_supervisor ? (
                    <Badge variant="danger" size="sm"><Video className="w-3 h-3" /> فيديو</Badge>
                  ) : (
                    <Badge variant="info" size="sm"><Eye className="w-3 h-3" /> حكام</Badge>
                  )}
                </td>
                <td>{s.region}</td>
                <td>{s.supervisorMatches}</td>
                <td>{s.videoMatches}</td>
                <td><Badge variant="primary">{s.totalMatches}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}