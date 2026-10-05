import { cn } from '../lib/utils'

/**
 * Everixa wordmark — the same framed, italic EVERIXA that draws itself on the preloader.
 * variant="dark"  → cream on a dark surface
 * variant="light" → forest on a light surface
 * draw            → animate the frame stroke in (used once in the header, timed to land as the preloader lifts)
 */
export default function BrandMark({ variant = 'dark', className, draw = false, size = 'md' }) {
  const isDark = variant === 'dark'
  const sizes = {
    sm: 'px-3 py-1.5 text-[19px]',
    md: 'px-4 py-2 text-[23px]',
    lg: 'px-6 py-3.5 text-[34px]',
  }

  return (
    <span
      className={cn(
        'relative inline-flex items-center font-display italic font-semibold leading-none tracking-[0.06em]',
        sizes[size],
        isDark ? 'text-cream-50' : 'text-ink-800',
        className
      )}
      aria-label="Everixa Workforce"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <rect
          x="0.75" y="0.75"
          width="calc(100% - 1.5px)" height="calc(100% - 1.5px)"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity={isDark ? 0.75 : 0.9}
          pathLength="1"
          vectorEffect="non-scaling-stroke"
          style={
            draw
              ? { strokeDasharray: 1, strokeDashoffset: 1, animation: 'drawFrame 1.4s cubic-bezier(.65,0,.35,1) 2.3s forwards' }
              : undefined
          }
        />
      </svg>
      EVERIXA
    </span>
  )
}
