import { useFinance } from '@/hooks/useFinance'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import FinanceStats from '@/components/features/finance/FinanceStats'
import FinanceTable from '@/components/features/finance/FinanceTable'

export default function ViewerFinance() {
  const { data = [], isLoading } = useFinance()

  return (
    <div className="space-y-6">
      <PageHeader title="المالية - عرض فقط" subtitle="مسابقات الاتحاد فقط" />

      <FinanceStats data={data} />

      <div className="glass-card overflow-hidden">
        {isLoading ? <Spinner size="lg" className="py-16" /> : <FinanceTable data={data} loading={isLoading} />}
      </div>
    </div>
  )
}