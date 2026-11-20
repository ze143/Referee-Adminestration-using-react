import { useState, useRef, useEffect, useMemo, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ✅ اكتشاف المودال
function useIsInModal() {
  const [isInModal, setIsInModal] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    let parent = ref.current.parentElement
    while (parent) {
      if (
        parent.classList.contains('modal-content') ||
        parent.classList.contains('modal-dialog') ||
        parent.getAttribute('role') === 'dialog' ||
        parent.style.position === 'fixed'
      ) {
        setIsInModal(true)
        return
      }
      parent = parent.parentElement
    }
  }, [])

  return { isInModal, ref }
}

const Select = forwardRef(function Select(
  {
    options,
    value,
    onChange,
    placeholder = 'اختر...',
    searchable = false,
    clearable = false,
    label,
    error,
    disabled = false,
    className,
    children,
    dropdownParent,
    variant,
    ...rest
  },
  ref
) {
  // ============================================
  // Legacy Mode — children (native <select>)
  // ✅ بيبعت value دايماً (مش event)
  // ============================================
  if (children !== undefined) {
    return (
      <div className={cn('w-full', className)}>
        {label && <label className="label">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={cn(
              'input appearance-none pl-10 cursor-pointer bg-ink-900 border-white/20',
              error && 'border-red-500'
            )}
            {...rest}
          >
            {children}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    )
  }

  // ============================================
  // Custom Mode — options array
  // ============================================
  return (
    <CustomSelect
      options={options || []}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchable={searchable}
      clearable={clearable}
      label={label}
      error={error}
      disabled={disabled}
      className={className}
      dropdownParent={dropdownParent}
      variant={variant}
    />
  )
})

export default Select

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  searchable,
  clearable,
  label,
  error,
  disabled,
  className,
  dropdownParent,
  variant,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)
  const { isInModal } = useIsInModal()

  const effectiveVariant = variant || (isInModal ? 'modal' : 'default')

  const triggerClasses =
    effectiveVariant === 'modal'
      ? 'bg-ink-900 border-white/20 hover:bg-ink-800'
      : 'bg-white/5 border-white/10 hover:bg-white/10'

  const placeholderClasses =
    effectiveVariant === 'modal' ? 'text-white/50' : 'text-white/40'

  const dropdownClasses =
    effectiveVariant === 'modal'
      ? 'bg-ink-900 border-white/20'
      : 'bg-ink-800/95 border-white/10'

  const updatePosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownHeight = 300
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

    setDropdownPosition({
      top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (open) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      setTimeout(() => searchRef.current?.focus(), 50)
    }
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    const handleClick = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        dropdownRef.current?.contains(e.target)
      ) return
      setOpen(false)
      setSearch('')
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    const s = search.toLowerCase()
    return options.filter((o) => o.label?.toLowerCase().includes(s))
  }, [options, search])

  const selected = options.find((o) => o.value === value)

  const handleSelect = (option) => {
    if (option.disabled) return
    onChange?.(option.value)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.('')
  }

  return (
    <div className={cn('w-full', className)}>
      {label && <label className="label">{label}</label>}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-right transition-all',
          triggerClasses,
          'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          open && 'border-brand-500 ring-2 ring-brand-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selected?.icon && (
            <selected.icon className="w-4 h-4 flex-shrink-0 text-gold-500" />
          )}
          <span className={cn('truncate text-sm', selected ? 'text-white' : placeholderClasses)}>
            {selected?.label || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {clearable && selected && (
            <span onClick={handleClear} className="p-0.5 rounded hover:bg-white/10 cursor-pointer" title="مسح">
              <X className="w-3.5 h-3.5 text-white/40" />
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 text-white/40 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 99999,
            }}
            className={cn(
              'rounded-lg overflow-hidden backdrop-blur-xl shadow-2xl animate-fade-in border',
              dropdownClasses
            )}
          >
            {searchable && (
              <div className="p-2 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث..."
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 pr-8 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-white/40 text-sm">لا توجد نتائج</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-right text-sm transition-colors',
                        'hover:bg-white/10',
                        isSelected && 'bg-brand-500/10 text-brand-500',
                        option.disabled && 'opacity-40 cursor-not-allowed',
                        !isSelected && 'text-white/80'
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )}

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
}