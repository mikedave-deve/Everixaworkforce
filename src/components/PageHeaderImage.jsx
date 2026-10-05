import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'

/**
 * Inner-page hero. Full-bleed photograph under a forest-green wash, oversized serif
 * headline anchored bottom-left, supporting copy and CTA in a second column.
 */
export default function PageHeaderImage({ label, title, highlight, subtitle, image, cta, ctaHref = '/contact' }) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-in]', {
        opacity: 0, y: 32, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.15,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <header
      ref={rootRef}
      className="on-dark grain relative flex min-h-[78svh] items-end overflow-hidden bg-ink-950 pb-14 pt-40 md:min-h-[72vh] md:pb-20"
    >
      <div className="absolute inset-0">
        <img src={image} alt="" className="animate-ken-burns h-full w-full object-cover" loading="eager" fetchPriority="high" />
        <div className="absolute inset-0 bg-ink-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/60" />
      </div>

      <div className="container-main relative">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p data-hero-in className="eyebrow mb-7">{label}</p>
            <h1 data-hero-in className="page-title text-cream-50">
              {title}
              {highlight && <em className="block font-medium italic text-brass-300">{highlight}</em>}
            </h1>
          </div>
          <div data-hero-in className="lg:pb-3">
            {subtitle && <p className="lede text-cream-100/75">{subtitle}</p>}
            {cta && (
              <Link to={ctaHref} className="btn-light mt-8">
                {cta} <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
