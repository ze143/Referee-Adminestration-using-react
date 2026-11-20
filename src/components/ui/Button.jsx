import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-gradient-brand text-white hover:shadow-lg hover:shadow-brand-500/30 focus:ring-brand-500',
  secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10 focus:ring-white/30',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-gold-500 text-ink-900 hover:bg-gold-600 focus:ring-gold-500',
  ghost: 'text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/30',
  outline: 'border border-white/20 text-white hover:bg-white/10 focus:ring-white/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  'aria-label': ariaLabel,
  ...props
}) {
  // ✅ fallback: لو مفيش aria-label، نستخدم النص
  const accessibleLabel =
    ariaLabel ||
    (typeof children === 'string' ? children : undefined) ||
    (Icon ? Icon.displayName || Icon.name : undefined)

  return (
    <button
      disabled={disabled || loading}
      aria-label={accessibleLabel}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  )
}