import { cn } from '@/lib/utils'

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'glass-card p-6',
        hover && 'glass-card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}