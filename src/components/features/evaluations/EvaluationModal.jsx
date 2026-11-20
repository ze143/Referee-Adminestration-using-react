import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useSaveEvaluations } from '@/hooks/useEvaluations'
import { formatDate, formatTime } from '@/lib/utils'

const ROLE_LABELS = {
  main: 'رئيسي',
  assistant1: 'مساعد 1',
  assistant2: 'مساعد 2',
  fourth: 'رابع',
  var: 'VAR',
  avar: 'AVAR',
}

const ROLE_COLORS = {
  main: 'border-r-blue-500',
  assistant1: 'border-r-green-500',
  assistant2: 'border-r-green-500',
  fourth: 'border-r-yellow-500',
  var: 'border-r-red-500',
  avar: 'border-r-red-500',
}

export default function EvaluationModal({ open, onClose, match, evaluations = [] }) {
  const saveMutation = useSaveEvaluations()
  const [scores, setScores] = useState({})

  const referees = [
    { role: 'main', data: match?.main_referee },
    { role: 'assistant1', data: match?.assistant1 },
    { role: 'assistant2', data: match?.assistant2 },
    { role: 'fourth', data: match?.fourth_referee },
    { role: 'var', data: match?.var_referee },
    { role: 'avar', data: match?.avar_referee },
  ].filter((r) => r.data)

  // تعبئة التقييمات الموجودة
  useEffect(() => {
    if (open && match) {
      const initial = {}
      referees.forEach((r) => {
        const existing = evaluations.find(
          (e) => e.match_id === match.id && e.referee_id === r.data.id
        )
        initial[r.data.id] = {
          rating: existing?.rating || '',
          notes: existing?.notes || '',
        }
      })
      setScores(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, match])

  if (!match) return null

  const updateScore = (refereeId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [refereeId]: { ...prev[refereeId], [field]: value },
    }))
  }

  const handleSave = async () => {
    const evaluationsToSave = []
    for (const ref of referees) {
      const data = scores[ref.data.id] || {}
      if (data.rating === '' || data.rating === undefined) continue
      const rating = parseInt(data.rating)
      if (isNaN(rating) || rating < 0 || rating > 100) continue

      evaluationsToSave.push({
        match_id: match.id,
        referee_id: ref.data.id,
        referee_role: ref.role,
        rating,
        notes: data.notes || null,
      })
    }

    if (evaluationsToSave.length === 0) return

    try {
      await saveMutation.mutateAsync({ matchId: match.id, evaluations: evaluationsToSave })
      onClose()
    } catch (e) {
      // errors handled in hook
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تقييم حكام المباراة"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saveMutation.isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSave} loading={saveMutation.isPending}>
            حفظ التقييمات
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* معلومات المباراة */}
        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="font-bold text-white mb-1">
            {match.home_team?.name} × {match.away_team?.name}
          </h4>
          <p className="text-xs text-white/60">
            {match.competitions?.name} | {formatDate(match.match_date)} | {formatTime(match.match_time)}
          </p>
        </div>

        {/* الحكام */}
        <div className="space-y-3">
          {referees.map((ref) => (
            <div
              key={ref.data.id}
              className={`bg-white/5 rounded-lg p-4 border-r-4 ${ROLE_COLORS[ref.role]}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gold-500">
                  {ROLE_LABELS[ref.role]}
                </span>
                <span className="font-bold text-white">{ref.data.full_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 - 100"
                  value={scores[ref.data.id]?.rating || ''}
                  onChange={(e) => updateScore(ref.data.id, 'rating', e.target.value)}
                  className="w-32 text-center font-bold"
                />
                <span className="text-sm text-white/60">/ 100</span>
                <Input
                  type="text"
                  placeholder="ملاحظات (اختياري)"
                  value={scores[ref.data.id]?.notes || ''}
                  onChange={(e) => updateScore(ref.data.id, 'notes', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}