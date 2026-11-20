import { useState, useMemo, lazy, Suspense } from 'react'
import { Plus, Trophy, Users, Layers, ListOrdered, BarChart3, Search, X } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useCompetitions, useDeleteCompetition } from '@/hooks/useCompetitions'
import { useStages, useDeleteStage } from '@/hooks/useStages'
import { useGroups, useDeleteGroup } from '@/hooks/useGroups'
import { useTeams, useDeleteTeam } from '@/hooks/useTeams'
import CompetitionTable from '@/components/features/competitions/CompetitionTable'
import StageTable from '@/components/features/competitions/StageTable'
import GroupTable from '@/components/features/competitions/GroupTable'
import TeamTable from '@/components/features/competitions/TeamTable'

const CompetitionFormModal = lazy(() => import('@/components/features/competitions/CompetitionFormModal'))
const StageFormModal = lazy(() => import('@/components/features/competitions/StageFormModal'))
const GroupFormModal = lazy(() => import('@/components/features/competitions/GroupFormModal'))
const TeamFormModal = lazy(() => import('@/components/features/competitions/TeamFormModal'))

const TABS = [
  { id: 'competitions', label: 'المسابقات', icon: Trophy },
  { id: 'stages', label: 'المراحل', icon: ListOrdered },
  { id: 'groups', label: 'المجموعات', icon: Layers },
  { id: 'teams', label: 'الفرق', icon: Users },
]

export default function Competitions() {
  const [tab, setTab] = useState('competitions')
  const [selectedComp, setSelectedComp] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  // ✅ فلاتر الفرق (مرتبطة بالمسابقة)
  const [teamSearch, setTeamSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Data
  const { data: competitions = [], isLoading: compLoading } = useCompetitions()
  const { data: stages = [], isLoading: stagesLoading } = useStages(
    tab === 'stages' || tab === 'groups' || tab === 'teams' ? selectedComp : undefined
  )
  const { data: groups = [], isLoading: groupsLoading } = useGroups(
    tab === 'groups' && selectedStage ? selectedStage : undefined
  )
  // ✅ teams متاحة في تاب "الفرق" و"المجموعات" (عشان الإحصائيات)
  const { data: teams = [], isLoading: teamsLoading } = useTeams(
    tab === 'teams' || tab === 'groups' ? selectedComp : undefined
  )

  // ✅ كل مجموعات المسابقة (للفلترة في تاب الفرق)
  const { data: allGroups = [] } = useGroups(
    tab === 'teams' && selectedComp ? selectedComp : undefined
  )

  // Mutations
  const deleteCompetition = useDeleteCompetition()
  const deleteStage = useDeleteStage()
  const deleteGroup = useDeleteGroup()
  const deleteTeam = useDeleteTeam()

  // Modal state
  const [compModal, setCompModal] = useState({ open: false, item: null })
  const [stageModal, setStageModal] = useState({ open: false, item: null })
  const [groupModal, setGroupModal] = useState({ open: false, item: null })
  const [teamModal, setTeamModal] = useState({ open: false, item: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, kind: null, item: null, loading: false })

  // ============================================
  // ✅ إحصائيات الفرق
  // ============================================
  const teamStats = useMemo(() => {
    if (!teams.length) return null

    const total = teams.length
    const inGroups = teams.filter((t) => t.group_id).length
    const withoutGroup = teams.filter((t) => !t.group_id).length
    const inStages = teams.filter((t) => t.stage_id).length
    const withoutStage = teams.filter((t) => !t.stage_id).length

    const byGroup = {}
    teams.forEach((t) => {
      const groupName = t.group?.name || 'بدون مجموعة'
      byGroup[groupName] = (byGroup[groupName] || 0) + 1
    })

    const byStage = {}
    teams.forEach((t) => {
      const stageName = t.stage?.name || 'بدون مرحلة'
      byStage[stageName] = (byStage[stageName] || 0) + 1
    })

    return { total, inGroups, withoutGroup, inStages, withoutStage, byGroup, byStage }
  }, [teams])

  // ============================================
  // ✅ فلترة الفرق (مرتبطة بالمسابقة)
  // ============================================
  const filteredTeams = useMemo(() => {
    let result = teams

    // بحث بالاسم
    if (teamSearch) {
      const s = teamSearch.toLowerCase()
      result = result.filter((t) => t.name?.toLowerCase().includes(s))
    }

    // فلتر المرحلة
    if (filterStage) {
      result = filterStage === '__none__'
        ? result.filter((t) => !t.stage_id)
        : result.filter((t) => t.stage_id === filterStage)
    }

    // فلتر المجموعة
    if (filterGroup) {
      result = filterGroup === '__none__'
        ? result.filter((t) => !t.group_id)
        : result.filter((t) => t.group_id === filterGroup)
    }

    // فلتر الحالة
    if (filterStatus === 'in_group') result = result.filter((t) => t.group_id)
    if (filterStatus === 'without_group') result = result.filter((t) => !t.group_id)

    return result
  }, [teams, teamSearch, filterStage, filterGroup, filterStatus])

  // ✅ مسح فلاتر الفرق
  const clearTeamFilters = () => {
    setTeamSearch('')
    setFilterStage('')
    setFilterGroup('')
    setFilterStatus('')
  }

  const hasTeamFilters = teamSearch || filterStage || filterGroup || filterStatus

  // ✅ لما نغيّر المسابقة، نصفّر فلاتر الفرق
  const handleCompChange = (value) => {
    setSelectedComp(value)
    setSelectedStage('')
    clearTeamFilters()
  }

  // ✅ لما نغيّر التاب، نصفّر فلاتر الفرق
  const handleTabChange = (newTab) => {
    setTab(newTab)
    clearTeamFilters()
  }

  const openDelete = (kind, item) => setDeleteDialog({ open: true, kind, item, loading: false })

  const handleDelete = async () => {
    const { kind, item } = deleteDialog
    if (!item) return
    setDeleteDialog((s) => ({ ...s, loading: true }))
    try {
      if (kind === 'competition') await deleteCompetition.mutateAsync(item.id)
      if (kind === 'stage') await deleteStage.mutateAsync({ id: item.id, competition_id: selectedComp })
      if (kind === 'group') await deleteGroup.mutateAsync({ id: item.id, stage_id: selectedStage })
      if (kind === 'team') await deleteTeam.mutateAsync(item.id)
      setDeleteDialog({ open: false, kind: null, item: null, loading: false })
    } catch (e) {
      setDeleteDialog((s) => ({ ...s, loading: false }))
    }
  }

  const renderActionButton = () => {
    if (tab === 'competitions') {
      return (
        <Button icon={Plus} onClick={() => setCompModal({ open: true, item: null })}>
          إضافة مسابقة
        </Button>
      )
    }
    if (!selectedComp) return null
    if (tab === 'stages') {
      return (
        <Button icon={Plus} onClick={() => setStageModal({ open: true, item: null })}>
          إضافة مرحلة
        </Button>
      )
    }
    if (tab === 'groups') {
      if (!selectedStage) return null
      return (
        <Button icon={Plus} onClick={() => setGroupModal({ open: true, item: null })}>
          إضافة مجموعة
        </Button>
      )
    }
    if (tab === 'teams') {
      return (
        <Button icon={Plus} onClick={() => setTeamModal({ open: true, item: null })}>
          إضافة فريق
        </Button>
      )
    }
    return null
  }

  const renderSelector = () => {
    if (tab === 'competitions') return null
    return (
      <div className="glass-card p-4 space-y-3">
        <Select
          label="اختر المسابقة"
          value={selectedComp}
          onChange={handleCompChange}
        >
          <option value="">— اختر مسابقة —</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        {tab === 'groups' && selectedComp && (
          <Select
            label="اختر المرحلة"
            value={selectedStage}
            onChange={(value) => setSelectedStage(value)}
          >
            <option value="">— اختر مرحلة —</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        )}
      </div>
    )
  }

  // ============================================
  // ✅ شريط فلاتر الفرق (تاب "الفرق" بس)
  // ============================================
  const renderTeamFilters = () => {
    if (tab !== 'teams' || !selectedComp) return null

    return (
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="ابحث باسم الفريق..."
              icon={Search}
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
            />
          </div>

          <Select
            value={filterStage}
            onChange={(v) => setFilterStage(v)}
            placeholder="كل المراحل"
            clearable
            options={[
              { value: '__none__', label: 'بدون مرحلة' },
              ...stages.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <Select
            value={filterGroup}
            onChange={(v) => setFilterGroup(v)}
            placeholder="كل المجموعات"
            clearable
            options={[
              { value: '__none__', label: 'بدون مجموعة' },
              ...allGroups.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />

          <Select
            value={filterStatus}
            onChange={(v) => setFilterStatus(v)}
            placeholder="كل الحالات"
            clearable
            options={[
              { value: 'in_group', label: 'في مجموعة' },
              { value: 'without_group', label: 'بدون مجموعة' },
            ]}
          />
        </div>

        {hasTeamFilters && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-white/50">
              عرض {filteredTeams.length} من {teams.length} فريق
            </p>
            <Button variant="ghost" onClick={clearTeamFilters}>
              <X className="w-4 h-4" />
              مسح الفلاتر
            </Button>
          </div>
        )}
      </div>
    )
  }

  // ✅ إحصائيات الفرق
  const renderTeamStats = () => {
    if (tab !== 'teams' || !selectedComp || !teamStats) return null

    return (
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-gold-500 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          إحصائيات الفرق
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatBox label="إجمالي الفرق" value={teamStats.total} color="text-white" />
          <StatBox label="في مجموعات" value={teamStats.inGroups} color="text-blue-400" />
          <StatBox label="بدون مجموعة" value={teamStats.withoutGroup} color="text-yellow-400" />
          <StatBox label="في مراحل" value={teamStats.inStages} color="text-green-400" />
        </div>

        {Object.keys(teamStats.byGroup).length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-white/60 mb-2">توزيع الفرق على المجموعات</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(teamStats.byGroup).map(([name, count]) => (
                <div
                  key={name}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 text-center"
                >
                  <div className="text-xl font-bold text-gold-500">{count}</div>
                  <div className="text-xs text-white/60 mt-1 truncate" title={name}>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(teamStats.byStage).length > 1 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-white/60 mb-2">توزيع الفرق على المراحل</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(teamStats.byStage).map(([name, count]) => (
                <div
                  key={name}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 text-center"
                >
                  <div className="text-xl font-bold text-blue-400">{count}</div>
                  <div className="text-xs text-white/60 mt-1 truncate" title={name}>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ✅ إحصائيات المجموعات
  const renderGroupStats = () => {
    if (tab !== 'groups' || !selectedStage || !groups.length) return null

    return (
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-gold-500 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          عدد الفرق في كل مجموعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {groups.map((g) => {
            const count = teams.filter((t) => t.group_id === g.id).length
            return (
              <div
                key={g.id}
                className="bg-white/5 rounded-lg p-3 border border-white/10 text-center"
              >
                <div className="text-xl font-bold text-gold-500">{count}</div>
                <div className="text-xs text-white/60 mt-1 truncate" title={g.name}>
                  {g.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (tab === 'competitions') {
      return (
        <CompetitionTable
          competitions={competitions}
          loading={compLoading}
          onEdit={(item) => setCompModal({ open: true, item })}
          onDelete={(item) => openDelete('competition', item)}
        />
      )
    }
    if (!selectedComp) {
      return <div className="p-8 text-center text-white/40">اختر مسابقة أولاً</div>
    }
    if (tab === 'stages') {
      return (
        <StageTable
          stages={stages}
          loading={stagesLoading}
          onEdit={(item) => setStageModal({ open: true, item })}
          onDelete={(item) => openDelete('stage', item)}
        />
      )
    }
    if (tab === 'groups') {
      if (!selectedStage) {
        return <div className="p-8 text-center text-white/40">اختر مرحلة أولاً</div>
      }
      return (
        <GroupTable
          groups={groups}
          loading={groupsLoading}
          onEdit={(item) => setGroupModal({ open: true, item })}
          onDelete={(item) => openDelete('group', item)}
        />
      )
    }
    if (tab === 'teams') {
      return (
        <TeamTable
          teams={filteredTeams}
          loading={teamsLoading}
          onEdit={(item) => setTeamModal({ open: true, item })}
          onDelete={(item) => openDelete('team', item)}
        />
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="المسابقات والفرق"
        subtitle={`${competitions.length} مسابقة`}
        actions={renderActionButton()}
      />

      {/* Tabs */}
      <div className="glass-card p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-medium text-sm ${
              tab === t.id ? 'bg-gradient-brand text-white' : 'text-white/60 hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {renderSelector()}

      {/* ✅ شريط فلاتر الفرق (تاب "الفرق" بس) */}
      {renderTeamFilters()}

      {/* ✅ إحصائيات الفرق */}
      {renderTeamStats()}

      {/* ✅ إحصائيات المجموعات */}
      {renderGroupStats()}

      <div className="glass-card overflow-hidden">{renderContent()}</div>

      {/* Modals */}
      <Suspense fallback={<Spinner />}>
        {compModal.open && (
          <CompetitionFormModal
            open
            onClose={() => setCompModal({ open: false, item: null })}
            competition={compModal.item}
          />
        )}
      </Suspense>

      <Suspense fallback={<Spinner />}>
        {stageModal.open && selectedComp && (
          <StageFormModal
            open
            onClose={() => setStageModal({ open: false, item: null })}
            stage={stageModal.item}
            competitionId={selectedComp}
          />
        )}
      </Suspense>

      <Suspense fallback={<Spinner />}>
        {groupModal.open && selectedStage && (
          <GroupFormModal
            open
            onClose={() => setGroupModal({ open: false, item: null })}
            group={groupModal.item}
            stageId={selectedStage}
          />
        )}
      </Suspense>

      <Suspense fallback={<Spinner />}>
        {teamModal.open && selectedComp && (
          <TeamFormModal
            open
            onClose={() => setTeamModal({ open: false, item: null })}
            team={teamModal.item}
            competitionId={selectedComp}
          />
        )}
      </Suspense>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, kind: null, item: null, loading: false })}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف "${deleteDialog.item?.name}"؟`}
        confirmText="نعم، احذف"
        loading={deleteDialog.loading}
      />
    </div>
  )
}

// ✅ مكون StatBox
function StatBox({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/60 mt-1">{label}</div>
    </div>
  )
}