import { ChevronRight, ChevronLeft } from 'lucide-react'
import Button from './Button'

export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-t border-white/10">
      <p className="text-sm text-white/60">
        صفحة <span className="text-gold-500 font-bold">{page + 1}</span> من{' '}
        <span className="text-white">{totalPages}</span> — إجمالي {total} عنصر
      </p>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
        >
          التالي
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}