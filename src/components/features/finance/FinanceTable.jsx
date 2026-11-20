import { memo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/finance-config'

function FinanceTable({ data = [], loading }) {
  const [expanded, setExpanded] = useState({})
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  if (loading) {
    return <div className="p-8 text-center text-white/40">جاري التحميل...</div>
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-white/40">
        لا توجد بيانات مالية (مسابقات الاتحاد فقط)
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="w-10"></th>
            <th>الحكم</th>
            <th>الأدوار</th>
            <th>مباريات</th>
            <th>الإجمالي</th>
            <th>الخصم (10%)</th>
            <th>الصافي</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <FinanceRow
              key={row.referee_id}
              row={row}
              expanded={!!expanded[row.referee_id]}
              onToggle={() => toggle(row.referee_id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// صف الحكم + تفاصيله
// ============================================
function FinanceRow({ row, expanded, onToggle }) {
  return (
    <>
      <tr>
        <td>
          <button onClick={onToggle} className="text-gold-500">
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                expanded ? '' : '-rotate-90'
              }`}
            />
          </button>
        </td>
        <td>
          <strong className="text-white">{row.referee_name}</strong>
        </td>
        <td>
          <div className="flex flex-wrap gap-1">
            {Object.entries(row.role_breakdown)
              .filter(([, v]) => v.count > 0)
              .map(([role, v]) => (
                <Badge key={role} variant="info" size="sm">
                  {ROLE_LABELS[role]} ({v.count})
                </Badge>
              ))}
          </div>
        </td>
        <td>
          <Badge variant="primary">{row.total_matches}</Badge>
        </td>
        <td>
          <span className="text-green-400 font-bold">
            {formatCurrency(row.total_fee)}
          </span>
        </td>
        <td>
          <span className="text-red-400">{formatCurrency(row.total_deduction)}</span>
        </td>
        <td>
          <span className="text-gold-500 font-bold text-lg">
            {formatCurrency(row.net_amount)}
          </span>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="p-0">
            <FinanceDetails row={row} />
          </td>
        </tr>
      )}
    </>
  )
}

// ============================================
// تفاصيل الحكم
// ============================================
function FinanceDetails({ row }) {
  return (
    <div className="bg-ink-900/50 p-4 space-y-4">
      {/* تفصيل حسب المسابقة */}
      <div>
        <h4 className="text-sm font-bold text-gold-500 mb-2">
          تفصيل حسب المسابقة
        </h4>
        <div className="space-y-2">
          {row.competitions.map((comp) => (
            <div
              key={comp.id}
              className="bg-white/5 rounded p-3 border border-white/10"
            >
              <div className="font-bold text-white mb-2">{comp.name}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(comp.roles)
                  .filter(([, v]) => v.count > 0)
                  .map(([role, v]) => (
                    <div
                      key={role}
                      className="flex justify-between bg-white/5 rounded px-2 py-1"
                    >
                      <span className="text-white/70">
                        {ROLE_LABELS[role]} ×{v.count}
                      </span>
                      <span className="text-green-400 font-bold">
                        {formatCurrency(v.fee)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* تفصيل حسب الدور */}
      <div>
        <h4 className="text-sm font-bold text-gold-500 mb-2">
          تفصيل حسب الدور
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {Object.entries(row.role_breakdown)
            .filter(([, v]) => v.count > 0)
            .map(([role, v]) => (
              <div
                key={role}
                className="bg-white/5 rounded p-2 border border-white/10"
              >
                <div className="text-white/70">{ROLE_LABELS[role]}</div>
                <div className="text-xs text-white/50">{v.count} مباراة</div>
                <div className="text-green-400 font-bold">
                  {formatCurrency(v.fee)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default memo(FinanceTable)