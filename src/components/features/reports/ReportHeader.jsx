import { FileSpreadsheet, FileText } from 'lucide-react'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

export default function ReportHeader({ title, data, filename }) {
  const exportExcel = () => {
    if (!data || data.length === 0) {
      toast.error('لا توجد بيانات للتصدير')
      return
    }

    import('xlsx').then((XLSX) => {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, 'التقرير')
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('تم تصدير Excel')
    })
  }

  const exportPdf = () => {
    toast.info('جاري إنشاء PDF...')
    Promise.all([import('jspdf'), import('html2canvas')]).then(
      ([{ jsPDF }, { default: html2canvas }]) => {
        const el = document.getElementById('report-content')
        html2canvas(el, { scale: 2 }).then((canvas) => {
          const img = canvas.toDataURL('image/png')
          const pdf = new jsPDF('l', 'mm', 'a4')
          const w = pdf.internal.pageSize.getWidth()
          const h = (canvas.height * w) / canvas.width
          pdf.addImage(img, 'PNG', 0, 0, w, h)
          pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
          toast.success('تم تصدير PDF')
        })
      }
    )
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gold-500">{title}</h3>
      <div className="flex gap-2">
        <Button variant="success" size="sm" icon={FileSpreadsheet} onClick={exportExcel}>
          Excel
        </Button>
        <Button variant="danger" size="sm" icon={FileText} onClick={exportPdf}>
          PDF
        </Button>
      </div>
    </div>
  )
}