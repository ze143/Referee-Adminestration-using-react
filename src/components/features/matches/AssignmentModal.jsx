import { useState, useEffect } from 'react'
import { ChevronDown, Flag, Video, Eye, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import { useReferees } from '@/hooks/useReferees'
import { useSupervisors } from '@/hooks/useSupervisors'
import { useAssignCrewBulk } from '@/hooks/useMatches'
import { supabase } from '@/lib/supabase'
import { formatDate, formatTime } from '@/lib/utils'

const CREW_FIELDS = [
  { key: 'main_referee_id', role: 'main', label: 'الحكم الرئيسي', icon: Flag, filterRole: 'main' },
  { key: 'assistant1_referee_id', role: 'assistant1', label: 'مساعد أول', icon: Flag, filterRole: 'assistant' },
  { key: 'assistant2_referee_id', role: 'assistant2', label: 'مساعد ثاني', icon: Flag, filterRole: 'assistant' },
  { key: 'fourth_referee_id', role: 'fourth', label: 'الحكم الرابع', icon: Flag, filterRole: 'main' },
  { key: 'var_referee_id', role: 'var', label: 'VAR', icon: Video, filterRole: 'var', varOnly: true },
  { key: 'avar_referee_id', role: 'avar', label: 'AVAR', icon: Video, filterRole: 'avar', varOnly: true },
]

// ✅ hook: جلب كل الإيقافات
function useAllSuspensions() {
  return useQuery({
    queryKey: ['all-suspensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suspensions_history')
        .select('referee_id, start_date, end_date, reason')
      if (error) throw error
      return data || []
    },
    staleTime: 30_000,
  })
}

// ✅ hook: عدد مباريات كل حكم في مسابقة
function useRefereeMatchCounts(competitionId) {
  return useQuery({
    queryKey: ['referee-match-counts', competitionId],
    queryFn: async () => {
      if (!competitionId) return {}
      const { data, error } = await supabase
        .from('matches')
        .select(`
          main_referee_id,
          assistant1_referee_id,
          assistant2_referee_id,
          fourth_referee_id,
          var_referee_id,
          avar_referee_id
        `)
        .eq('competition_id', competitionId)
      if (error) throw error

      const counts = {}
      data?.forEach((m) => {
        const ids = [
          m.main_referee_id,
          m.assistant1_referee_id,
          m.assistant2_referee_id,
          m.fourth_referee_id,
          m.var_referee_id,
          m.avar_referee_id,
        ].filter(Boolean)
        ids.forEach((id) => {
          counts[id] = (counts[id] || 0) + 1
        })
      })
      return counts
    },
    enabled: !!competitionId,
    staleTime: 30_000,
  })
}

// ✅ hook: عدد مباريات كل مراقب في مسابقة
function useSupervisorMatchCounts(competitionId) {
  return useQuery({
    queryKey: ['supervisor-match-counts', competitionId],
    queryFn: async () => {
      if (!competitionId) return {}
      const { data, error } = await supabase
        .from('matches')
        .select('supervisor_id, video_supervisor_id')
        .eq('competition_id', competitionId)
      if (error) throw error

      const counts = {}
      data?.forEach((m) => {
        if (m.supervisor_id) counts[m.supervisor_id] = (counts[m.supervisor_id] || 0) + 1
        if (m.video_supervisor_id) counts[m.video_supervisor_id] = (counts[m.video_supervisor_id] || 0) + 1
      })
      return counts
    },
    enabled: !!competitionId,
    staleTime: 30_000,
  })
}

// ✅ دالة: هل الحكم موقوف في تاريخ معين؟
function isRefereeSuspendedOnDate(refereeId, matchDate, suspensions, referee) {
  if (!matchDate) return false
  const matchDay = matchDate

  if (referee?.is_suspended) {
    if (!referee.suspension_until) return true
    if (matchDay <= referee.suspension_until) return true
  }

  return suspensions.some((s) => {
    if (s.referee_id !== refereeId) return false
    if (!s.end_date) return matchDay >= s.start_date
    return matchDay >= s.start_date && matchDay <= s.end_date
  })
}

export default function AssignmentModal({ open, onClose, matches = [], onSuccess }) {
  const { data: refereesData, isLoading: refLoading } = useReferees({ pageSize: 1000 })
  const referees = Array.isArray(refereesData) ? refereesData : (refereesData?.data || [])

  const { data: suspensions = [] } = useAllSuspensions()

  // ✅ المسابقة (من أول مباراة — كلهم نفس المسابقة)
  const competitionId = matches[0]?.competition_id
  const { data: refereeCounts = {} } = useRefereeMatchCounts(competitionId)
  const { data: supervisorCounts = {} } = useSupervisorMatchCounts(competitionId)

  const { data: supervisorsData } = useSupervisors({ onlyVideo: false })
  const regularSupervisors = Array.isArray(supervisorsData)
    ? supervisorsData
    : (supervisorsData?.data || [])

  const { data: videoSupervisorsData } = useSupervisors({ onlyVideo: true })
  const videoSupervisors = Array.isArray(videoSupervisorsData)
    ? videoSupervisorsData
    : (videoSupervisorsData?.data || [])

  const assignBulk = useAssignCrewBulk()

  const [assignments, setAssignments] = useState({})
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    if (open && matches.length > 0) {
      const initial = {}
      const expandedInit = {}
      matches.forEach((m, idx) => {
        initial[m.id] = {
          main_referee_id: m.main_referee_id || '',
          assistant1_referee_id: m.assistant1_referee_id || '',
          assistant2_referee_id: m.assistant2_referee_id || '',
          fourth_referee_id: m.fourth_referee_id || '',
          var_referee_id: m.var_referee_id || '',
          avar_referee_id: m.avar_referee_id || '',
          supervisor_id: m.supervisor_id || '',
          video_supervisor_id: m.video_supervisor_id || '',
        }
        expandedInit[m.id] = idx === 0
      })
      setAssignments(initial)
      setExpanded(expandedInit)
    }
  }, [open, matches])

  const updateField = (matchId, field, value) => {
    setAssignments((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value },
    }))
  }

  const toggleExpanded = (matchId) => {
    setExpanded((prev) => ({ ...prev, [matchId]: !prev[matchId] }))
  }

  const handleSave = async () => {
    const errors = []
    matches.forEach((m) => {
      const a = assignments[m.id] || {}
      const refereeFields = [
        { key: 'main_referee_id', label: 'الحكم الرئيسي' },
        { key: 'assistant1_referee_id', label: 'مساعد أول' },
        { key: 'assistant2_referee_id', label: 'مساعد ثاني' },
        { key: 'fourth_referee_id', label: 'الحكم الرابع' },
        { key: 'var_referee_id', label: 'VAR' },
        { key: 'avar_referee_id', label: 'AVAR' },
      ]

      refereeFields.forEach(({ key, label }) => {
        const refId = a[key]
        if (!refId) return
        const ref = referees.find((r) => r.id === refId)
        if (!ref) return
        if (isRefereeSuspendedOnDate(refId, m.match_date, suspensions, ref)) {
          errors.push(
            `${ref.full_name} (${label}) موقوف في تاريخ مباراة ${m.home_team?.name} × ${m.away_team?.name} (${m.match_date})`
          )
        }
      })
    })

    if (errors.length > 0) {
      alert('⛔ مينفعش تحفظ:\n\n' + errors.join('\n'))
      return
    }

    const payload = matches.map((m) => {
      const a = assignments[m.id] || {}
      return {
        id: m.id,
        main_referee_id: a.main_referee_id || null,
        assistant1_referee_id: a.assistant1_referee_id || null,
        assistant2_referee_id: a.assistant2_referee_id || null,
        fourth_referee_id: a.fourth_referee_id || null,
        var_referee_id: a.var_referee_id || null,
        avar_referee_id: a.avar_referee_id || null,
        supervisor_id: a.supervisor_id || null,
        video_supervisor_id: a.video_supervisor_id || null,
      }
    })

    try {
      await assignBulk.mutateAsync(payload)
      onClose()
      onSuccess?.()
    } catch (e) {
      // errors handled in hook
    }
  }

  const getRefereesForRole = (role, matchDate) => {
    if (!Array.isArray(referees)) return []

    const available = referees.filter(
      (r) => !isRefereeSuspendedOnDate(r.id, matchDate, suspensions, r)
    )

    if (role === 'main') {
      return available.filter((r) => ['referee', 'both'].includes(r.job) || r.degree === 'New')
    }
    if (role === 'assistant') {
      return available.filter((r) => ['assistant', 'both'].includes(r.job) || r.degree === 'New')
    }
    if (role === 'var') {
      return available.filter((r) => r.has_var_license)
    }
    if (role === 'avar') {
      return available.filter((r) => r.has_avar_license)
    }
    return available
  }

  const isPremierLeague = (match) => {
    return match.competitions?.name === 'الدوري المصري الممتاز'
  }

  const getAssignedCount = (matchId) => {
    const a = assignments[matchId] || {}
    return Object.entries(a).filter(
      ([k, v]) => k !== 'supervisor_id' && k !== 'video_supervisor_id' && v
    ).length
  }

  if (refLoading) {
    return (
      <Modal open={open} onClose={onClose} title="تعيين الطاقم" size="full">
        <Spinner size="lg" className="py-16" />
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`تعيين طاقم الحكام — ${matches.length} مباراة`}
      size="full"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={assignBulk.isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSave} loading={assignBulk.isPending}>
            حفظ الكل ({matches.length})
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {matches.map((match, idx) => {
          const isOpen = expanded[match.id]
          const assigned = getAssignedCount(match.id)
          const showVar = isPremierLeague(match)
          const fields = CREW_FIELDS.filter((f) => !f.varOnly || showVar)

          return (
            <div
              key={match.id}
              className="glass-card border border-white/10 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleExpanded(match.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-right">
                  <ChevronDown
                    className={`w-5 h-5 text-gold-500 transition-transform ${
                      isOpen ? '' : '-rotate-90'
                    }`}
                  />
                  <span className="text-sm font-bold text-gold-500">
                    مباراة #{idx + 1}
                  </span>
                  <span className="text-white/80">
                    <strong>{match.home_team?.name || '—'}</strong>
                    <span className="mx-2 text-red-400">×</span>
                    <strong>{match.away_team?.name || '—'}</strong>
                  </span>
                  <span className="text-xs text-white/40">
                    {formatDate(match.match_date)} — {formatTime(match.match_time)}
                  </span>
                </div>
                <Badge variant={assigned > 0 ? 'success' : 'gray'}>
                  {assigned} حكم معين
                </Badge>
              </button>

              {isOpen && (
                <div className="p-4 pt-0 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {fields.map((field) => {
                      const Icon = field.icon
                      const value = assignments[match.id]?.[field.key] || ''
                      const options = getRefereesForRole(field.filterRole, match.match_date)

                      const currentAssignments = assignments[match.id] || {}
                      const usedIds = Object.entries(currentAssignments)
                        .filter(([k, v]) => k !== field.key && v)
                        .map(([, v]) => v)

                      return (
                        <div key={field.key}>
                          <label className="label flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gold-500" />
                            {field.label}
                          </label>
                          <Select
                            value={value}
                            onChange={(v) => updateField(match.id, field.key, v)}
                            placeholder="— بدون —"
                            searchable
                            clearable
                            variant="modal"
                            options={options.map((r) => ({
                              value: r.id,
                              // ✅ عدد المباريات
                              label: `${r.full_name}${r.region ? ` (${r.region})` : ''} — ${refereeCounts[r.id] || 0} مباراة`,
                              disabled: usedIds.includes(r.id) && r.id !== value,
                            }))}
                          />
                        </div>
                      )
                    })}

                    <div>
                      <label className="label flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gold-500" />
                        مراقب الحكام
                      </label>
                      <Select
                        value={assignments[match.id]?.supervisor_id || ''}
                        onChange={(v) => updateField(match.id, 'supervisor_id', v)}
                        placeholder="— بدون —"
                        searchable
                        clearable
                        variant="modal"
                        options={regularSupervisors.map((s) => ({
                          value: s.id,
                          label: `${s.full_name}${s.region ? ` (${s.region})` : ''} — ${supervisorCounts[s.id] || 0} مباراة`,
                        }))}
                      />
                    </div>

                    {showVar && (
                      <div>
                        <label className="label flex items-center gap-2">
                          <Video className="w-4 h-4 text-red-400" />
                          مراقب الفيديو
                        </label>
                        <Select
                          value={assignments[match.id]?.video_supervisor_id || ''}
                          onChange={(v) => updateField(match.id, 'video_supervisor_id', v)}
                          placeholder="— بدون —"
                          searchable
                          clearable
                          variant="modal"
                          options={videoSupervisors.map((s) => ({
                            value: s.id,
                            label: `${s.full_name}${s.region ? ` (${s.region})` : ''} — ${supervisorCounts[s.id] || 0} مباراة`,
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}