export default function EvaluationStats({ total, evaluated, pending, avgRating }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard value={total} label="مباريات منتهية" color="text-green-400" icon="📊" />
      <StatCard value={evaluated} label="مباريات مُقيَّمة" color="text-yellow-400" icon="⭐" />
      <StatCard value={pending} label="في انتظار التقييم" color="text-red-400" icon="⏳" />
      <StatCard value={avgRating} label="متوسط التقييم" color="text-blue-400" icon="📈" />
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