import { cn } from '@/lib/utils'
import Spinner from './Spinner'
import EmptyState from './EmptyState'

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  rowClassName,
}) {
  if (loading) {
    return (
      <div className="table-container">
        <Spinner className="py-16" size="lg" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <EmptyState title={emptyMessage} />
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick?.(row)}
              className={cn(
                onRowClick && 'cursor-pointer',
                rowClassName?.(row)
              )}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.accessor
                    ? col.accessor(row)
                    : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}