import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import ReportsFilters from '@/components/features/reports/ReportsFilters'
import RefereesReport from '@/components/features/reports/RefereesReport'
import MatchesReport from '@/components/features/reports/MatchesReport'
import EvaluationsReport from '@/components/features/reports/EvaluationsReport'
import CompetitionsReport from '@/components/features/reports/CompetitionsReport'
import FinanceReport from '@/components/features/reports/FinanceReport'
import SupervisorsReport from '@/components/features/reports/SupervisorsReport'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import {
  useRefereesReport,
  useMatchesReport,
  useEvaluationsReport,
  useCompetitionsReport,
  useFinanceReport,
  useSupervisorsReport,
} from '@/hooks/useReports'
import { Trophy, Users, Star, Calendar, Coins, Eye } from 'lucide-react'

const TABS = [
  { id: 'referees', label: 'الحكام', icon: Users },
  { id: 'matches', label: 'المباريات', icon: Calendar },
  { id: 'evaluations', label: 'التقييمات', icon: Star },
  { id: 'competitions', label: 'المسابقات', icon: Trophy },
  { id: 'finance', label: 'المالية', icon: Coins },
  { id: 'supervisors', label: 'المراقبين', icon: Eye },
]

export default function ViewerReports() {
  const [type, setType] = useState('referees')
  const [filters, setFilters] = useState({ run: false })

  const refReport = useRefereesReport(type === 'referees' ? filters : { run: false })
  const matchReport = useMatchesReport(type === 'matches' ? filters : { run: false })
  const evalReport = useEvaluationsReport(type === 'evaluations' ? filters : { run: false })
  const compReport = useCompetitionsReport(type === 'competitions' ? filters : { run: false })
  const finReport = useFinanceReport(type === 'finance' ? filters : { run: false })
  const supReport = useSupervisorsReport(type === 'supervisors' ? filters : { run: false })

  const reports = { referees: refReport, matches: matchReport, evaluations: evalReport, competitions: compReport, finance: finReport, supervisors: supReport }
  const current = reports[type]
  const isLoading = current.isLoading
  const data = current.data

  const renderReport = () => {
    if (isLoading) return <Spinner size="lg" className="py-16" />
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return <EmptyState title="لا توجد بيانات" />
    }
    return (
      <>
        {type === 'referees' && <RefereesReport data={data} />}
        {type === 'matches' && <MatchesReport data={data} />}
        {type === 'evaluations' && <EvaluationsReport data={data} />}
        {type === 'competitions' && <CompetitionsReport data={data} />}
        {type === 'finance' && <FinanceReport data={data} />}
        {type === 'supervisors' && <SupervisorsReport data={data} />}
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="التقارير - عرض فقط" />

      <div className="glass-card p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                type === t.id ? 'bg-gradient-brand text-white' : 'text-white/60 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      <ReportsFilters type={type} filters={filters} onChange={setFilters} onRun={() => setFilters({ ...filters, run: true })} />

      <div className="glass-card p-4">{renderReport()}</div>
    </div>
  )
}