import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

import { services, industries, testimonials, stats } from '../data'
import { useScrollReveal, useCounterAnimation } from '../hooks/useScrollReveal'
import { SectionHead, CtaBand, Marquee } from '../components/Editorial'
import ceoImage from '../assets/CEO.jpeg'

// ─── Hero background: looping footage on capable screens, still photo otherwise ──
function useHeroVideoAllowed() {
  const [allowed] = useState(() => {
    if (typeof window === 'undefined') return false
    const wide = window.matchMedia('(min-width: 768px)').matches
    const calm = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = navigator.connection?.saveData === true
    return wide && calm && !saveData
  })
  return allowed
}

function HeroBackdrop() {
  const allowed = useHeroVideoAllowed()
  const [ready, setReady] = useState(false)
  return (
    <div className="absolute inset-0">
      <img src="/video/hero-poster.jpg" alt="" className="animate-ken-burns h-full w-full object-cover" loading="eager" fetchPriority="high" />
      {allowed && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ${ready ? 'opacity-100' : 'opacity-0'}`}
          src="/video/hero-team.mp4"
          poster="/video/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setReady(true)}
        />
      )}
      <div className="absolute inset-0 bg-ink-950/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-ink-950/70" />
    </div>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2.9 }) // lands as the preloader lifts
      tl.from('[data-line]', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power4.out' })
        .from('[data-fade]', { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '-=0.6')
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="on-dark grain relative flex min-h-[100svh] items-end overflow-hidden bg-ink-950"
    >
      <HeroBackdrop />

      <div className="container-main relative pb-12 pt-36 md:pb-16">
        <p data-fade className="eyebrow mb-8">Staffing &amp; Recruitment since 2006</p>

        <h1 className="display-xl text-cream-50">
          <span className="block overflow-hidden pb-[0.08em]"><span data-line className="block">Creating connections</span></span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-line className="block">is <em className="font-medium text-brass-300">what we do best.</em></span>
          </span>
        </h1>

        <div className="mt-12 grid gap-10 border-t border-cream-50/15 pt-8 md:mt-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <p data-fade className="lede text-cream-100/75">
            Whether you are searching for your dream job or recruiting top talent, Everixa Workforce
            is here to help you build a better future through strong industry connections and a
            people-first philosophy.
          </p>
          <div data-fade className="flex flex-col gap-3 sm:flex-row lg:justify-end [&>a]:w-full sm:[&>a]:w-auto">
            <Link to="/submit-resume" className="btn-light">Submit Your Resume <ArrowRight size={16} /></Link>
            <Link to="/jobs" className="btn-ghost-light">Browse Open Roles</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Services: numbered index ──────────────────────────────────────────────
function ServicesPreview() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="01"
          label="What We Do"
          title={<>Staffing solutions for <em className="text-brass-700">every need.</em></>}
          lede="Whether you're a candidate seeking your dream role or a company looking for exceptional talent, we're here to make the right connection happen."
        />
        <ul className="border-t border-ink-900/15">
          {services.map((service, i) => (
            <li key={service.id} className="reveal border-b border-ink-900/15">
              <Link
                to="/services"
                className="group grid items-baseline gap-x-8 gap-y-3 py-8 transition-colors hover:bg-ink-100/50 md:grid-cols-[5rem_1.1fr_1.4fr_auto] md:px-4 md:py-10"
              >
                <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-ink-900">{service.title}</h3>
                <p className="max-w-md text-[15px] leading-relaxed text-ink-700/80">{service.shortDesc}</p>
                <span className="mt-2 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-700 md:mt-0">
                  Learn more
                  <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Stats ─────────────────────────────────────────────────────────────────
function StatsSection() {
  const ref = useCounterAnimation(stats)
  return (
    <section className="on-dark grain relative overflow-hidden bg-ink-900 py-24 md:py-32" ref={ref}>
      <div className="container-main relative">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-6"><span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">02</span>By the numbers</p>
            <h2 className="section-title">Data-driven <em className="text-brass-300">results.</em></h2>
          </div>
        </div>
        <dl className="grid grid-cols-2 border-t border-cream-50/15 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-b border-cream-50/15 py-10 pr-6 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0"
            >
              <dd className="font-num text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-[-0.03em] text-cream-50">
                <span data-counter>{stat.value}</span>
                <span className="text-brass-300">{stat.suffix}</span>
              </dd>
              <dt className="mt-5 text-[14px] font-semibold text-cream-50">{stat.label}</dt>
              <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-cream-100/60">{stat.description}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ─── Industries: two-column index ──────────────────────────────────────────
function IndustriesPreview() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-cream-100" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="03"
          label="Our Focus"
          title={<>Industries <em className="text-brass-700">we serve.</em></>}
          action={<Link to="/industries" className="link-arrow">View all industries <ArrowRight size={14} /></Link>}
        />
        <ul className="grid border-t border-ink-900/15 md:grid-cols-2 md:gap-x-16">
          {industries.slice(0, 8).map((ind, i) => (
            <li key={ind.id} className="reveal border-b border-ink-900/15 py-7">
              <div className="flex gap-5">
                <span className="index-num pt-1">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-2xl leading-tight text-ink-900">{ind.title}</h3>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-700/75">{ind.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function TestimonialsSection() {
  const ref = useScrollReveal('.reveal')
  const [lead, ...rest] = testimonials
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="04"
          label="Client Stories"
          title={<>Trusted across <em className="text-brass-700">the sector.</em></>}
        />

        <figure className="reveal grid gap-8 border-t border-ink-900/15 pt-12 lg:grid-cols-[auto_1fr] lg:gap-16">
          <span aria-hidden="true" className="font-display text-[8rem] leading-[0.6] text-brass-400 lg:text-[11rem]">“</span>
          <div>
            <blockquote className="font-display text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.25] tracking-[-0.01em] text-ink-900">
              {lead.quote}
            </blockquote>
            <figcaption className="mt-8 text-[14px]">
              <span className="font-semibold text-ink-900">{lead.name}</span>
              <span className="text-ink-600"> — {lead.title}, {lead.company}</span>
            </figcaption>
          </div>
        </figure>

        <div className="mt-16 grid gap-10 border-t border-ink-900/15 pt-10 md:grid-cols-3 md:gap-8">
          {rest.map((t) => (
            <figure key={t.id} className="reveal">
              <blockquote className="text-[15px] leading-relaxed text-ink-800/85">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-[13px]">
                <span className="block font-semibold text-ink-900">{t.name}</span>
                <span className="text-ink-600">{t.title} · {t.company}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Recognition ───────────────────────────────────────────────────────────
function EmployeeRecognitionSection() {
  const ref = useScrollReveal('.reveal')
  const highlights = [
    { label: 'Recognition Awards', value: '3x Annual' },
    { label: 'Performance Bonuses', value: 'Monthly' },
    { label: 'Growth Pathways', value: 'Structured' },
  ]

  return (
    <section className="section-wrapper bg-cream-100" ref={ref}>
      <div className="container-main">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="reveal relative">
            <div className="aspect-[4/5] overflow-hidden bg-ink-200">
              <img src={ceoImage} alt="James Whitfield, CEO and Founder" className="h-full w-full object-cover object-top grayscale contrast-[1.05]" loading="lazy" />
            </div>
            <figure className="on-dark absolute -bottom-8 right-0 w-[88%] bg-ink-900 p-6 md:-right-8 md:w-[78%] md:p-8">
              <blockquote className="font-display text-[19px] italic leading-snug text-cream-50 md:text-[22px]">
                “Our recognition program has transformed team culture. People don't just show up — they bring their best every single day.”
              </blockquote>
              <figcaption className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-300">
                James Whitfield · CEO &amp; Founder
              </figcaption>
            </figure>
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="reveal eyebrow mb-6"><span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">05</span>Award-Winning Program</p>
            <h2 className="reveal section-title mb-8">
              Award-winning employee <em className="text-brass-700">recognition program.</em>
            </h2>
            <p className="reveal mb-5 max-w-lg text-[16px] leading-relaxed text-ink-700/85">
              We proudly recognize and reward outstanding team members through our award-winning
              employee recognition program. This initiative is designed to identify individuals
              with exceptional potential and performance, providing them with opportunities for
              growth, advancement, and exclusive incentives.
            </p>
            <p className="reveal mb-10 max-w-lg text-[15px] leading-relaxed text-ink-700/70">
              From monthly spotlights to annual excellence awards, every contribution is seen,
              valued, and celebrated — because the best organisations are built by the best people.
            </p>

            <dl className="reveal mb-10 border-t border-ink-900/15">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-baseline justify-between border-b border-ink-900/15 py-4">
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-600">{h.label}</dt>
                  <dd className="font-display text-2xl text-ink-900">{h.value}</dd>
                </div>
              ))}
            </dl>

            <Link to="/staff" className="reveal btn-primary">Meet Our Team <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={industries.slice(0, 8).map((i) => i.title)} />
      <ServicesPreview />
      <StatsSection />
      <IndustriesPreview />
      <TestimonialsSection />
      <EmployeeRecognitionSection />
      <CtaBand
        eyebrow="Ready to start?"
        title={<>The right hire <em className="text-brass-700">changes everything.</em></>}
        body="Whether you're looking for your next great role or searching for an exceptional professional, we're here to make the connection."
        primary={{ to: '/contact', label: 'Work With Us' }}
        secondary={{ to: '/jobs', label: 'View Open Positions' }}
      />
    </>
  )
}
