import { formatCurrency } from '@/lib/utils'

export default function FinanceStats({ data = [] }) {
  const total = data.reduce((s, d) => s + d.total_fee, 0)
  const deductions = data.reduce((s, d) => s + d.total_deduction, 0)
  const net = data.reduce((s, d) => s + d.net_amount, 0)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        value={formatCurrency(total)}
        label="إجمالي المكافآت"
        color="text-green-400"
        icon="💰"
      />
      <StatCard
        value={formatCurrency(deductions)}
        label="إجمالي الخصومات (10%)"
        color="text-red-400"
        icon="📉"
      />
      <StatCard
        value={formatCurrency(net)}
        label="إجمالي الصافي"
        color="text-gold-500"
        icon="📈"
      />
      <StatCard
        value={data.length}
        label="عدد الحكام"
        color="text-blue-400"
        icon="👤"
      />
    </div>
  )
}

function StatCard({ value, label, color, icon }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/60 mt-1">{label}</div>
    </div>
  )
}