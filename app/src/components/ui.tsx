import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { AlertCircle, ChevronDown, Loader2, X } from 'lucide-react'
import { initials } from '../lib/format'

/* ------------------------------------------------------------------ Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sage'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-forest-700 text-cream-50 shadow-soft hover:bg-forest-800 active:bg-forest-900 disabled:bg-forest-700/40',
  secondary:
    'border border-forest-700/15 bg-cream-50 text-forest-800 shadow-soft hover:border-forest-700/30 hover:bg-cream-100 disabled:opacity-50',
  ghost: 'text-forest-800 hover:bg-forest-700/8 active:bg-forest-700/12 disabled:opacity-40',
  danger: 'bg-clay-600 text-cream-50 shadow-soft hover:bg-clay-700 disabled:bg-clay-600/40',
  sage: 'bg-sage-100 text-forest-900 hover:bg-sage-200 disabled:opacity-50',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-[13px]',
  md: 'h-11 gap-2 rounded-2xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-2xl px-5 text-[15px]',
  icon: 'h-10 w-10 rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  full?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  full = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition duration-150 active:scale-[0.985] disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

export function IconButton({
  label,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`inline-grid h-10 w-10 place-items-center rounded-xl text-forest-800 transition hover:bg-forest-700/8 active:scale-95 ${className}`}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------- Badge */

export function Badge({
  children,
  className = '',
  dot = false,
}: {
  children: ReactNode
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none ${className}`}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------- Card */

export function Card({
  children,
  className = '',
  as: Tag = 'section',
  id,
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'article' | 'div'
  id?: string
}) {
  return (
    <Tag
      id={id}
      className={`rounded-3xl border border-forest-700/10 bg-cream-50 shadow-soft ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({
  title,
  action,
  hint,
  className = '',
}: {
  title: string
  action?: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={`mb-3 flex items-end justify-between gap-3 ${className}`}>
      <div>
        <h2 className="text-[19px] font-semibold leading-tight text-ink-900">{title}</h2>
        {hint ? <p className="mt-1 text-[12.5px] text-ink-500">{hint}</p> : null}
      </div>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------------- Form */

interface FieldShellProps {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  htmlFor?: string
  className?: string
}

export function Field({ label, hint, error, children, htmlFor, className = '' }: FieldShellProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-[12.5px] font-semibold text-ink-700">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-[12px] font-medium text-clay-600">
          <AlertCircle size={12} aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px] leading-snug text-ink-400">{hint}</p>
      ) : null}
    </div>
  )
}

const controlClass =
  'w-full rounded-2xl border border-forest-700/15 bg-cream-50 px-3.5 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 transition focus:border-forest-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-forest-700/10 disabled:bg-cream-200'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${controlClass} ${className}`} />
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`${controlClass} min-h-[104px] resize-y ${className}`} />
}

export function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={`${controlClass} appearance-none pr-10 ${className}`}>
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400"
        aria-hidden
      />
    </div>
  )
}

/* ---------------------------------------------------------------- Feedback */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center px-6 py-10 text-center ${className}`}>
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-sage-100 text-forest-700">
        {icon}
      </div>
      <h3 className="text-[17px] font-semibold text-ink-900">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  className = '',
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={`rounded-3xl border border-clay-600/20 bg-clay-100/60 p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-clay-600" size={18} aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-semibold text-clay-700">Something needs attention</p>
          <p className="mt-1 text-[13px] leading-relaxed text-clay-700/80">{message}</p>
          {onRetry ? (
            <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden />
}

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden />
}

/* ------------------------------------------------------------- Segmented */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: {
  options: Array<{ value: T; label: string; count?: number }>
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex rounded-2xl border border-forest-700/10 bg-cream-100 p-1 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition ${
              active ? 'bg-cream-50 text-forest-800 shadow-soft' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {option.label}
            {typeof option.count === 'number' ? (
              <span className={`ml-1.5 ${active ? 'text-forest-600' : 'text-ink-400'}`}>
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------------- Avatar */

export function Avatar({
  name,
  color = '#3A5A40',
  size = 36,
  className = '',
}: {
  name?: string | null
  color?: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-cream-50 ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: Math.max(10, size * 0.34),
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

/* ------------------------------------------------------------------ Sheet */

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      focusable?.focus()
    }, 60)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`animate-sheet-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-forest-700/10 bg-cream-50 shadow-lift sm:max-h-[86vh] sm:rounded-[26px] ${
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex items-start gap-3 border-b border-cream-300 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[19px] font-semibold leading-tight text-ink-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[12.5px] leading-snug text-ink-500">{description}</p>
            ) : null}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-1.5 -mt-1">
            <X size={18} />
          </IconButton>
        </div>
        <div className="hv-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="safe-bottom border-t border-cream-300 bg-cream-100/60 px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Stat */

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'clay' | 'amber'
}) {
  const iconTone =
    tone === 'clay'
      ? 'bg-clay-100 text-clay-600'
      : tone === 'amber'
        ? 'bg-amber-100 text-amber-600'
        : 'bg-sage-100 text-forest-700'

  return (
    <div className="rounded-2xl border border-forest-700/10 bg-cream-50 p-3.5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="label-caps">{label}</p>
        {icon ? <span className={`grid h-7 w-7 place-items-center rounded-lg ${iconTone}`}>{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold leading-none text-ink-900 tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[11px] leading-tight text-ink-400">{hint}</p> : null}
    </div>
  )
}
