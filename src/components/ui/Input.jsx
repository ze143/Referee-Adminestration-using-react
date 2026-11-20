import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
        )}
        <input
          ref={ref}
          className={cn(
            'input',
            Icon && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
})

export default Input