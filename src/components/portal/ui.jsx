/* eslint-disable react-refresh/only-export-components -- UI kit intentionally co-locates small style constants and the toast hook with its components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

/* ── Page header ─────────────────────────────────────────────── */
export function PageHead({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-10 flex flex-col gap-6 border-b border-ink-900/10 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="font-display text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.02] tracking-[-0.02em] text-ink-900">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-700/80">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

/* ── Panel ───────────────────────────────────────────────────── */
export function Panel({ title, description, action, children, className, flush = false, tone = 'light' }) {
  const dark = tone === 'dark'
  return (
    <section
      className={cn(
        'min-w-0 border',
        dark ? 'on-dark border-ink-800 bg-ink-900 text-cream-50' : 'border-ink-900/10 bg-white',
        className
      )}
    >
      {(title || action) && (
        <header className={cn('flex items-start justify-between gap-4 px-6 pt-6', flush && 'pb-5')}>
          <div>
            {title && <h2 className={cn('font-display text-[1.55rem] leading-tight', dark ? 'text-cream-50' : 'text-ink-900')}>{title}</h2>}
            {description && <p className={cn('mt-1 text-[13px] leading-relaxed', dark ? 'text-cream-100/65' : 'text-ink-600')}>{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn(!flush && 'p-6', title && !flush && 'pt-5')}>{children}</div>
    </section>
  )
}

/* ── Stat ────────────────────────────────────────────────────── */
export function Stat({ label, value, hint, className }) {
  return (
    <div className={cn('min-w-0 border border-ink-900/10 bg-white p-4 sm:p-5', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">{label}</p>
      <p className="font-num mt-3 text-[1.65rem] leading-none text-ink-900 sm:text-[2.2rem]">{value}</p>
      {hint && <p className="mt-2 text-[12px] text-ink-600">{hint}</p>}
    </div>
  )
}

/* ── Pill ────────────────────────────────────────────────────── */
const pillTones = {
  neutral: 'bg-ink-100 text-ink-700',
  brass: 'bg-brass-300/35 text-brass-700',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
  onDark: 'bg-cream-50/10 text-brass-300',
}
export function Pill({ tone = 'neutral', children, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]', pillTones[tone], className)}>
      {children}
    </span>
  )
}

/* ── Progress ────────────────────────────────────────────────── */
export function ProgressBar({ value, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-1.5 w-full bg-ink-100">
        <div className="h-full bg-brass-500 transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/* ── Form bits ───────────────────────────────────────────────── */
export const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

export function Field({ id, label, hint, children, className }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-ink-600">{hint}</p>}
    </div>
  )
}

export function EmptyState({ title, body }) {
  return (
    <div className="border border-dashed border-ink-900/20 px-6 py-12 text-center">
      <p className="font-display text-2xl text-ink-800">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-sm text-[14px] text-ink-600">{body}</p>}
    </div>
  )
}

/* ── Table wrapper (scrolls on small screens) ────────────────── */
export function TableWrap({ children, min = '36rem' }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-[14px]" style={{ minWidth: min }}>{children}</table>
    </div>
  )
}
export const th = 'py-3 pr-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600'
export const td = 'py-4 pr-4 align-middle text-ink-800'

/* ── Toast ───────────────────────────────────────────────────── */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 3800)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        {toast && (
          <div key={toast.id} className="on-dark pointer-events-auto flex items-center gap-3 border border-ink-700 bg-ink-900 py-3 pl-4 pr-3 text-[14px] text-cream-50 shadow-xl">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-brass-300" />
            {toast.message}
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="ml-2 p-1 text-cream-100/60 hover:text-cream-50">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  )
}
