import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'

/** Section heading: eyebrow, serif title, optional lede and trailing action. */
export function SectionHead({ index, label, title, lede, action, className, align = 'left' }) {
  return (
    <div
      className={cn(
        'mb-14 grid gap-6 md:mb-20 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16',
        align === 'center' && 'lg:grid-cols-1 text-center [&_.eyebrow]:justify-center',
        className
      )}
    >
      <div className="reveal">
        <p className="eyebrow mb-6">
          {index && <span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">{index}</span>}
          {label}
        </p>
        <h2 className="section-title">{title}</h2>
      </div>
      {(lede || action) && (
        <div className="reveal lg:pb-2">
          {lede && <p className="section-subtitle">{lede}</p>}
          {action && <div className="mt-6">{action}</div>}
        </div>
      )}
    </div>
  )
}

/** Closing call-to-action band (light, so it never stacks against the dark footer): one primary, one quiet secondary. */
export function CtaBand({ eyebrow, title, body, primary, secondary }) {
  return (
    <section className="relative overflow-hidden bg-cream-200 py-24 md:py-32">
      <div className="container-main relative">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16">
          <div className="reveal">
            {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
            <h2 className="font-display text-[clamp(2.4rem,5.6vw,4.8rem)] leading-[1] tracking-[-0.025em] text-ink-900">
              {title}
            </h2>
          </div>
          <div className="reveal">
            {body && <p className="lede mb-8 text-ink-700/80">{body}</p>}
            <div className="flex flex-wrap gap-3">
              {primary && (
                <Link to={primary.to} className="btn-primary">{primary.label} <ArrowRight size={16} /></Link>
              )}
              {secondary && (
                <Link to={secondary.to} className="btn-outline">{secondary.label}</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Infinite, slow text marquee used as a visual divider. Pauses on hover and for reduced motion. */
export function Marquee({ items }) {
  const row = [...items, ...items]
  return (
    <div className="on-dark overflow-hidden border-y border-cream-50/10 bg-ink-950 py-6" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-[clamp(1.6rem,3vw,2.4rem)] italic text-cream-50/80">
            {item}
            <span className="h-1.5 w-1.5 rotate-45 bg-brass-500" />
          </span>
        ))}
      </div>
    </div>
  )
}
