import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import authImage1 from '../assets/stock/auth-panel.jpg'
import authImage2 from '../assets/stock/candidates-remote.jpg'
import authImage3 from '../assets/stock/jobs-videocall.jpg'
import authImage4 from '../assets/stock/contact-team.jpg'

const slides = [
  { image: authImage1, quote: 'Work from home, live on your terms.' },
  { image: authImage2, quote: 'Real jobs, fair pay, and a team that has your back.' },
  { image: authImage3, quote: 'Work from anywhere, supported from everywhere.' },
  { image: authImage4, quote: "A team that's always in your corner." },
]

const INTERVAL = 6000

/** Slow pan-and-zoom on every slide, captions that rise in, and progress bars that fill. */
function AuthImageCarousel() {
  const [active, setActive] = useState(0)

  // Restarts whenever the slide changes (including a manual click) so each slide gets its full time.
  useEffect(() => {
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), INTERVAL)
    return () => clearTimeout(id)
  }, [active])

  return (
    <div className="on-dark relative hidden overflow-hidden bg-ink-950 lg:block" aria-roledescription="carousel" aria-label="Everixa highlights">
      {slides.map((slide, i) => {
        const on = i === active
        return (
          <div
            key={slide.image}
            aria-hidden={!on}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
            style={{ opacity: on ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={on ? { animation: `${i % 2 ? 'authZoomB' : 'authZoomA'} ${INTERVAL + 1800}ms ease-out forwards` } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-ink-950/15" />
            {on && (
              <div className="relative flex h-full flex-col justify-end p-12 pb-20">
                <p
                  className="mb-4 max-w-md font-display text-[2rem] leading-[1.1] text-cream-50"
                  style={{ animation: 'riseIn 900ms cubic-bezier(.22,1,.36,1) 250ms both' }}
                >
                  {slide.quote}
                </p>
                <p
                  className="max-w-sm text-[14px] leading-relaxed text-cream-100/70"
                  style={{ animation: 'riseIn 900ms cubic-bezier(.22,1,.36,1) 450ms both' }}
                >
                  Your employee portal keeps your schedule, documents, and pay all in one place — built by the same team that found you the role.
                </p>
              </div>
            )}
          </div>
        )
      })}

      <div className="absolute inset-x-12 bottom-8 z-10 flex gap-2" role="tablist" aria-label="Choose slide">
        {slides.map((s, i) => (
          <button
            key={s.image}
            role="tab"
            aria-selected={i === active}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
            className="group h-6 flex-1 py-2.5"
          >
            <span className="relative block h-[2px] overflow-hidden bg-cream-50/25">
              <span
                key={i === active ? `on-${active}` : `off-${i}`}
                className="absolute inset-0 origin-left bg-cream-50"
                style={i === active ? { animation: `progressFill ${INTERVAL}ms linear forwards` } : { transform: `scaleX(${i < active ? 1 : 0})` }}
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="relative grid min-h-screen grid-cols-1 bg-cream-50 lg:grid-cols-2">
      <Link to="/" aria-label="Everixa Workforce — home" className="absolute left-6 top-6 z-20 block w-fit">
        <BrandMark variant="light" />
      </Link>

      <div className="flex flex-col justify-center px-6 py-24 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="mb-3 font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-ink-900">{title}</h1>
          {subtitle && <p className="mb-8 text-[15px] leading-relaxed text-ink-700/80">{subtitle}</p>}
          {children}
        </div>
      </div>

      <AuthImageCarousel />
    </div>
  )
}
