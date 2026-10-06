import { cn } from '../lib/utils'

/**
 * Everixa wordmark — one framed line in the same italic serif: EVERIXA WORKFORCE.
 * It scales down on phones so it never crowds the screen.
 *
 * variant="dark"  → cream on a dark surface
 * variant="light" → ink on a light surface
 * draw            → animate the frame stroke in (used once in the header, timed to land as the preloader lifts)
 */
const SIZES = {
  sm: 'px-2.5 py-1 text-[12.5px] sm:px-3 sm:py-1.5 sm:text-[16px]',
  md: 'px-2.5 py-1.5 text-[13.5px] sm:px-4 sm:py-2 sm:text-[19px]',
  lg: 'px-4 py-2.5 text-[20px] sm:px-6 sm:py-3.5 sm:text-[30px]',
}

export default function BrandMark({ variant = 'dark', className, draw = false, size = 'md' }) {
  const isDark = variant === 'dark'

  return (
    <span
      className={cn(
        'relative inline-flex items-center whitespace-nowrap font-display font-semibold italic leading-none tracking-[0.06em]',
        SIZES[size] ?? SIZES.md,
        isDark ? 'text-cream-50' : 'text-ink-800',
        className
      )}
      aria-label="Everixa Workforce"
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
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
      EVERIXA WORKFORCE
    </span>
  )
}
