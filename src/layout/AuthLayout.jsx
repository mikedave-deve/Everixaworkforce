import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import authImage1 from '../assets/stock/auth-panel.jpg'
import authImage2 from '../assets/stock/candidates-remote.jpg'
import authImage3 from '../assets/stock/jobs-videocall.jpg'
import authImage4 from '../assets/stock/contact-team.jpg'

const slides = [
  { image: authImage1, quote: 'Creating connections is what we do best.' },
  { image: authImage2, quote: 'Real people, real opportunities, every day.' },
  { image: authImage3, quote: 'Work from anywhere, supported from everywhere.' },
  { image: authImage4, quote: 'A team that\'s always in your corner.' },
]

const SLIDE_DURATION = 30000

function AuthImageCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive(i => (i + 1) % slides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hidden lg:block relative overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-ink-950/10" />
          <div className="relative h-full flex flex-col justify-end p-12">
            <p className="font-display text-2xl font-semibold text-white leading-snug mb-3 max-w-md">
              {slide.quote}
            </p>
            <p className="font-body text-sm text-cream-200/70 max-w-sm leading-relaxed">
              Your employee portal keeps your schedule, documents, and recognition
              all in one place — built by the same team that found you the role.
            </p>
          </div>
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
        {slides.map((slide, i) => (
          <span
            key={slide.image}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-cream-50">
      <Link to="/" className="absolute top-6 left-6 z-20 w-fit block">
        <BrandMark variant="light" />
      </Link>

      {/* Form column */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="max-w-sm w-full mx-auto">
          {eyebrow && <p className="section-label mb-3">{eyebrow}</p>}
          <h1 className="font-display text-3xl md:text-4xl font-medium text-ink-900 mb-3 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-sm text-ink-700/70 leading-relaxed mb-8">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      {/* Image column */}
      <AuthImageCarousel />
    </div>
  )
}
