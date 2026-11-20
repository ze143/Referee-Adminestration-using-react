import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'لا توجد بيانات',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-white/30" />
      </div>
      <h3 className="text-lg font-semibold text-white/80 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/50 mb-6 max-w-md">{description}</p>
      )}
      {action}
    </div>
  )
}