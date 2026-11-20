import { useState, useMemo, lazy, Suspense } from 'react'
import { Shield, Info } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { useMatches } from '@/hooks/useMatches'
import { useEditorScope } from '@/hooks/useEditorScope'
import { formatDate, formatTime } from '@/lib/utils'

const EditorAssignmentModal = lazy(() =>
  import('@/components/features/editor/EditorAssignmentModal')
)

export default function EditorMatches() {
  const { data: scope, isLoading: scopeLoading } = useEditorScope()
  const { data: matchesData, isLoading } = useMatches({
    pageSize: 1000,
    filters: {
      competition_id: scope?.competition_id || undefined,
      date: scope?.assigned_date || undefined,
    },
  })

  const matches = matchesData?.data || []
  const [selectedMatch, setSelectedMatch] = useState(null)

  const canAssignMain = scope?.permission_type === 'full'

  return (
    <div className="space-y-6">
      <PageHeader
        title="المباريات والتعيينات"
        subtitle={`${matches.length} مباراة`}
      />

      {/* Scope Notice */}
      <div className="glass-card p-4 border-r-4 border-r-yellow-500">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/70">
            <p className="font-bold text-gold-500 mb-1">
              {canAssignMain ? '🔸 صلاحية كاملة' : '🔹 مساعدين فقط'}
            </p>
            <p>
              {canAssignMain
                ? 'يمكنك تعيين الحكام والمساعدين'
                : 'يمكنك تعيين المساعدين فقط (رئيسي + رابع للقراءة فقط)'}
            </p>
            {scope?.competitions?.name && (
              <p className="mt-1">
                المسابقة: <strong>{scope.competitions.name}</strong>
                {scope.assigned_date && (
                  <>
                    {' '}— التاريخ:{' '}
                    <strong>{new Date(scope.assigned_date).toLocaleDateString('ar-EG')}</strong>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Matches Table */}
      {isLoading ? (
        <Spinner size="lg" className="py-16" />
      ) : matches.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            title="لا توجد مباريات في نطاق صلاحياتك"
            description="تواصل مع المدير لتعيين مسابقة أو تاريخ"
          />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>المضيف</th>
                  <th>الضيف</th>
                  <th>الملعب</th>
                  <th>الطاقم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id}>
                    <td>{formatDate(m.match_date)}</td>
                    <td>{formatTime(m.match_time)}</td>
                    <td><strong className="text-white">{m.home_team?.name}</strong></td>
                    <td><strong className="text-white">{m.away_team?.name}</strong></td>
                    <td className="text-xs text-white/60">{m.stadium}</td>
                    <td className="text-xs">
                      {m.main_referee?.full_name ? (
                        <div className="space-y-0.5">
                          <div>ر: {m.main_referee.full_name}</div>
                          {m.assistant1?.full_name && <div>م1: {m.assistant1.full_name}</div>}
                          {m.assistant2?.full_name && <div>م2: {m.assistant2.full_name}</div>}
                        </div>
                      ) : (
                        <span className="text-orange-400">لم يتم التعيين</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedMatch(m)}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        <Shield className="w-3 h-3" />
                        تعيين
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Suspense fallback={<Spinner />}>
        {selectedMatch && (
          <EditorAssignmentModal
            open
            match={selectedMatch}
            scope={scope}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </Suspense>
    </div>
  )
}