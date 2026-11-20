import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  Phone,
  Trophy,
  Calendar,
  Eye,
  Video,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { REGIONS } from '@/types/constants'

// ✅ hook: تفاصيل المراقب
function useSupervisorDetails(id) {
  return useQuery({
    queryKey: ['supervisor-details', id],
    queryFn: async () => {
      if (!id) return null

      const { data: supervisor, error: sErr } = await supabase
        .from('supervisors')
        .select('*')
        .eq('id', id)
        .single()
      if (sErr) throw sErr

      const { data: matches, error: mErr } = await supabase
        .from('matches')
        .select(`
          *,
          competitions(name),
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .or(`supervisor_id.eq.${id},video_supervisor_id.eq.${id}`)
        .order('match_date', { ascending: false })
      if (mErr) throw mErr

      const asRegular = matches?.filter((m) => m.supervisor_id === id).length || 0
      const asVideo = matches?.filter((m) => m.video_supervisor_id === id).length || 0

      return {
        supervisor,
        matches: matches || [],
        stats: {
          total: matches?.length || 0,
          asRegular,
          asVideo,
        },
      }
    },
    enabled: !!id,
  })
}

export default function SupervisorDetailsModal({ open, onClose, supervisorId }) {
  const { data, isLoading } = useSupervisorDetails(supervisorId)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ملف المراقب"
      size="full"
      footer={
        <button className="btn-secondary" onClick={onClose}>
          إغلاق
        </button>
      }
    >
      {isLoading ? (
        <Spinner size="lg" className="py-16" />
      ) : !data ? (
        <EmptyState title="المراقب غير موجود" />
      ) : (
        <SupervisorDetails data={data} />
      )}
    </Modal>
  )
}

function SupervisorDetails({ data }) {
  const { supervisor, matches, stats } = data
  const regionLabel = REGIONS.find((r) => r.value === supervisor.region)?.label || supervisor.region || '-'

  const typeInfo = {
    regular: { label: 'مراقب حكام', icon: Eye, variant: 'info' },
    video: { label: 'مراقب فيديو', icon: Video, variant: 'danger' },
    both: { label: 'مراقب حكام وفيديو', icon: Eye, variant: 'gold' },
  }[supervisor.supervisor_type || 'regular']

  const TypeIcon = typeInfo.icon

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* العمود الأول: معلومات شخصية */}
      <div className="lg:col-span-1 space-y-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-brand flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">
              {supervisor.full_name?.charAt(0) || '?'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{supervisor.full_name}</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant={typeInfo.variant}>
              <TypeIcon className="w-3 h-3 inline mr-1" />
              {typeInfo.label}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <InfoRow icon={MapPin} label="المنطقة" value={regionLabel} />
          <InfoRow icon={Phone} label="الهاتف" value={supervisor.phone || '-'} />
        </div>
      </div>

      {/* العمود الثاني: إحصائيات + مباريات */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h4 className="text-lg font-bold text-gold-500 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            إحصائيات المباريات
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="إجمالي" value={stats.total} color="text-white" />
            <StatBox label="كمراقب حكام" value={stats.asRegular} color="text-blue-400" />
            <StatBox label="كمراقب فيديو" value={stats.asVideo} color="text-red-400" />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-gold-500 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            آخر المباريات
          </h4>
          {matches.length === 0 ? (
            <EmptyState title="لا توجد مباريات" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right py-2 text-gold-500 font-semibold">التاريخ</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">المسابقة</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">المضيف</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">الضيف</th>
                    <th className="text-right py-2 text-gold-500 font-semibold">الدور</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 10).map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2">{formatDate(m.match_date)}</td>
                      <td className="py-2 text-white/80">{m.competitions?.name || '-'}</td>
                      <td className="py-2">{m.home_team?.name || '-'}</td>
                      <td className="py-2">{m.away_team?.name || '-'}</td>
                      <td className="py-2">
                        {m.supervisor_id === supervisor.id && m.video_supervisor_id === supervisor.id ? (
                          <Badge variant="gold" size="sm">الاتنين</Badge>
                        ) : m.supervisor_id === supervisor.id ? (
                          <Badge variant="info" size="sm">مراقب حكام</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">مراقب فيديو</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length > 10 && (
                <p className="text-center text-white/40 text-xs mt-2">
                  عرض 10 من أصل {matches.length} مباراة
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
      <Icon className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40">{label}</p>
        <div className="text-sm text-white/80 break-words">{value}</div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/60 mt-1">{label}</div>
    </div>
  )
}