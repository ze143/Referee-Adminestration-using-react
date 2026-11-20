import { useMemo } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useFinance } from '@/hooks/useFinance'
import FinanceStats from '@/components/features/finance/FinanceStats'
import FinanceTable from '@/components/features/finance/FinanceTable'
import { formatCurrency } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/finance-config'
import { toast } from 'sonner'

export default function Finance() {
  const { data = [], isLoading } = useFinance()

  // الإجماليات
  const totals = useMemo(() => {
    const total = data.reduce((s, d) => s + d.total_fee, 0)
    const deductions = data.reduce((s, d) => s + d.total_deduction, 0)
    const net = data.reduce((s, d) => s + d.net_amount, 0)
    return { total, deductions, net }
  }, [data])

  // ============================================
  // تصدير Excel
  // ============================================
  const exportExcel = () => {
    if (data.length === 0) {
      toast.error('لا توجد بيانات للتصدير')
      return
    }

    import('xlsx').then((XLSX) => {
      // شيت 1: تفصيلي (حكم + مسابقة + دور)
      const detailData = []
      data.forEach((ref) => {
        ref.competitions.forEach((comp) => {
          Object.entries(comp.roles)
            .filter(([, v]) => v.count > 0)
            .forEach(([role, v]) => {
              detailData.push({
                الحكم: ref.referee_name,
                المسابقة: comp.name,
                الدور: ROLE_LABELS[role],
                'عدد المباريات': v.count,
                الإجمالي: v.fee.toFixed(2),
              })
            })
        })
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(detailData)
      XLSX.utils.book_append_sheet(wb, ws, 'المالية التفصيلية')

      // شيت 2: إجماليات
      const summaryData = data.map((ref) => ({
        الحكم: ref.referee_name,
        'إجمالي المباريات': ref.total_matches,
        الإجمالي: ref.total_fee.toFixed(2),
        'الخصم (10%)': ref.total_deduction.toFixed(2),
        الصافي: ref.net_amount.toFixed(2),
      }))
      const ws2 = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, ws2, 'الإجماليات')

      XLSX.writeFile(wb, `المالية_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('تم تصدير Excel')
    })
  }

  // ============================================
  // تصدير PDF
  // ============================================
  const exportPdf = () => {
    if (data.length === 0) {
      toast.error('لا توجد بيانات للتصدير')
      return
    }
    toast.info('جاري إنشاء PDF...')

    Promise.all([import('jspdf'), import('html2canvas')]).then(
      ([{ jsPDF }, { default: html2canvas }]) => {
        const element = document.getElementById('finance-content')
        html2canvas(element, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF('l', 'mm', 'a4')
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
          pdf.save(`المالية_${new Date().toISOString().split('T')[0]}.pdf`)
          toast.success('تم تصدير PDF')
        })
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="المالية"
        subtitle="مسابقات الاتحاد فقط — البدل حسب المسابقة والدور — خصم 10%"
      />

      {/* Stats */}
      <FinanceStats data={data} />

      {/* Actions */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 text-sm text-white/60">
          {data.length > 0 && `${data.length} حكم لديهم مستحقات غير مدفوعة`}
        </div>
        <Button
          variant="success"
          icon={FileSpreadsheet}
          onClick={exportExcel}
          disabled={data.length === 0}
        >
          تصدير Excel
        </Button>
        <Button
          variant="danger"
          icon={FileText}
          onClick={exportPdf}
          disabled={data.length === 0}
        >
          تصدير PDF
        </Button>
      </div>

      {/* Table */}
      <div id="finance-content" className="glass-card overflow-hidden">
        {isLoading ? (
          <Spinner size="lg" className="py-16" />
        ) : (
          <>
            <FinanceTable data={data} loading={isLoading} />

            {/* Totals */}
            {data.length > 0 && (
              <div className="border-t-2 border-gold-500/30 p-4 bg-gold-500/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-white/60">إجمالي المكافآت</div>
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(totals.total)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">إجمالي الخصومات</div>
                    <div className="text-lg font-bold text-red-400">
                      {formatCurrency(totals.deductions)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">الصافي</div>
                    <div className="text-lg font-bold text-gold-500">
                      {formatCurrency(totals.net)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">عدد الحكام</div>
                    <div className="text-lg font-bold text-blue-400">
                      {data.length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}