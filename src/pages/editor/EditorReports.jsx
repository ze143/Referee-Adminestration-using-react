import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { useEditorScope } from '@/hooks/useEditorScope'
import { useMatches } from '@/hooks/useMatches'

export default function EditorReports() {
  const { data: scope } = useEditorScope()
  const { data: matchesData, isLoading } = useMatches({
    pageSize: 1000,
    filters: {
      competition_id: scope?.competition_id || undefined,
      date: scope?.assigned_date || undefined,
    },
  })

  const matches = matchesData?.data || []

  return (
    <div className="space-y-6">
      <PageHeader title="التقارير - عرض فقط" />

      {isLoading ? (
        <Spinner size="lg" className="py-16" />
      ) : matches.length === 0 ? (
        <EmptyState title="لا توجد بيانات" />
      ) : (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gold-500 mb-4">ملخص المباريات</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{matches.length}</div>
              <div className="text-xs text-white/60">مباراة</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {matches.filter((m) => m.is_notified).length}
              </div>
              <div className="text-xs text-white/60">مبلغ عنها</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">
                {matches.filter((m) => !m.main_referee_id).length}
              </div>
              <div className="text-xs text-white/60">بدون حكم رئيسي</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {matches.filter((m) => !m.assistant1_referee_id || !m.assistant2_referee_id).length}
              </div>
              <div className="text-xs text-white/60">بحاجة لمساعدين</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}