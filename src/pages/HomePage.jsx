import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronRight, Award, Star } from 'lucide-react'

import { services, industries, testimonials, stats } from '../data'
import { useScrollReveal, useCounterAnimation } from '../hooks/useScrollReveal'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import heroImage from '../assets/stock/hero-team.jpg'

// ─── Hero Section ──────────────────────────────────────────────────────────
function Hero() {
  const heroRef    = useRef(null)
  const titleRef   = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef     = useRef(null)
  const badgeRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.05 })
      tl.fromTo(badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
      .fromTo(titleRef.current.querySelectorAll('.hero-word'),
        { opacity: 0, y: 60, rotateX: -20 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo(ctaRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
        '-=0.3'
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden
                 bg-forest-950"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-forest-950/90" />
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235da45d' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-forest-950 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-forest-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-forest-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container-base pt-24 pb-16 text-center">
        {/* Badge */}
        <div ref={badgeRef} className="inline-flex items-center gap-2  border border-forest-600/40
                                       rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" />
          <span className="font-body text-sm font-bold text-white tracking-wide">
           STAFFING & RECRUITMENT SINCE 2006
          </span>
        </div>

        {/* Headline */}
        <h1 ref={titleRef} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                                       font-bold text-white leading-[1.05] mb-6 overflow-hidden"
            style={{ perspective: '1000px' }}>
          {['Creating', 'Connections', 'is'].map(word => (
            <span key={word} className="hero-word inline-block mr-[0.25em]">{word}</span>
          ))}
          <br />
          {['what', 'we do'].map(word => (
            <span key={word} className="hero-word inline-block mr-[0.25em] text-forest-400">
              {word}
            </span>
          ))}
          <span className="hero-word inline-block text-outline text-forest-400">Best.</span>
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef}
           className="font-body text-base md:text-xl text-cream-200/60 max-w-2xl mx-auto mb-10 leading-relaxed">
         Whether you are searching for your dream job or recruiting top talent, Everixa Workforce
         is here to help you build a better future through strong industry connections and a people-first
         philosophyy.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/submit-resume"
                className="inline-flex items-center gap-2 bg-forest-500 hover:bg-forest-400
                           text-white font-body font-medium px-8 py-4 rounded-sm
                           transition-all duration-300 hover:shadow-xl hover:shadow-forest-500/30
                           active:scale-95">
           Submit Your Resume
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/jobs"
                className="inline-flex items-center gap-2 border border-cream-200/30 text-cream-100
                           hover:border-cream-200/60 hover:bg-white/5
                           font-body font-medium px-8 py-4 rounded-sm transition-all duration-300">
            Browse Open Roles
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute mt-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-body text-xs text-forest-500 tracking-[0.15em] uppercase">Explore</span>
          <div className="w-px h-10 bg-gradient-to-b from-forest-500 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}

// ─── Section Badge ─────────────────────────────────────────────────────────
function SectionBadge({ number }) {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-forest-400/50 text-forest-500 font-body text-xs mb-5">
      {number}
    </span>
  )
}

// ─── Services Preview ──────────────────────────────────────────────────────
function ServicesPreview() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-base">
        <div className="text-center mb-12 reveal">
          <SectionBadge number="01" />
          <p className="section-label mb-3">What We Do</p>
          <h2 className="section-title mb-4">Staffing Solutions for Every Need</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Whether you're a candidate seeking your dream role or a company looking for exceptional talent, we're here to
            to make the right connection happen.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="reveal p-6 flex flex-col gap-4 group cursor-pointer">
              <div className="text-3xl">{service.icon}</div>
              <div>
                <h3 className="font-display text-xl font-semibold text-forest-900 mb-2 group-hover:text-forest-700 transition-colors">
                  {service.title}
                </h3>
                <p className="font-body text-sm text-forest-700/70 leading-relaxed">
                  {service.shortDesc}
                </p>
              </div>
              <Link to="/services"
                    className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium font-body
                               text-forest-600 hover:text-forest-800 transition-colors">
                Learn more <ChevronRight className="w-3 h-3" />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats Section ─────────────────────────────────────────────────────────
function StatsSection() {
  const ref = useCounterAnimation(stats)
  return (
    <section className="section-wrapper bg-forest-900 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 grid-lines-bg text-forest-700/10 pointer-events-none" />
      <div className="relative container-base">
        <div className="text-center mb-14">
          <SectionBadge number="02" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            Data-Driven <span className="text-outline text-forest-400">Results</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="font-display text-4xl lg:text-5xl font-bold text-white">
                <span data-counter>{stat.value}</span>
                <span className="text-forest-400">{stat.suffix}</span>
              </div>
              <div className="font-body text-sm font-semibold text-white/90">{stat.label}</div>
              <div className="font-body text-xs text-forest-400/80">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Industries Preview ────────────────────────────────────────────────────
function IndustriesPreview() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-white" ref={ref}>
      <div className="container-base">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="reveal">
            <SectionBadge number="03" />
            <p className="section-label mb-3">Our Focus</p>
            <h2 className="section-title">Industries We Serve</h2>
          </div>
          <Link to="/industries" className="reveal btn-outline text-sm self-start md:self-auto shrink-0">
            View All Industries
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {industries.slice(0, 8).map((ind) => (
            <div key={ind.id}
                 className={`reveal p-5 rounded-sm border ${ind.color}
                             hover:shadow-md transition-all duration-300 cursor-pointer group`}>
              <div className="">{ind.icon}</div>
              <h3 className="font-body text-lg font-semibold text-forest-900 mb-1.5 group-hover:text-forest-700 transition-colors">
                {ind.title}
              </h3>
              <p className="font-body text-sm text-forest-700/60 leading-relaxed hidden md:block">
                {ind.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function TestimonialsSection() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-forest-50" ref={ref}>
      <div className="container-base">
        <div className="text-center mb-12 reveal">
          <p className="section-label mb-3">Client Stories</p>
          <h2 className="section-title">Trusted Across the Sector</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="reveal bg-white p-7 rounded-sm border border-forest-100 shadow-sm
                                       hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-forest-700 flex items-center justify-center shrink-0">
                  <span className="font-body text-xs font-bold text-cream-100">{t.initials}</span>
                </div>
                <div>
                  <div className="font-body text-sm font-semibold text-forest-900">{t.name}</div>
                  <div className="font-body text-xs text-forest-500">{t.title} · {t.company}</div>
                </div>
              </div>
              <div className="text-forest-400 font-display text-4xl leading-none mb-2 select-none">"</div>
              <p className="font-body text-sm text-forest-700/80 leading-relaxed italic">
                {t.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Award-Winning Employee Recognition ───────────────────────────────────
function EmployeeRecognitionSection() {
  const ref    = useScrollReveal('.reveal')
  const barRef = useRef(null)

  useEffect(() => {
    if (!barRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        barRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1, duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: barRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  const highlights = [
    { icon: <Award className="w-5 h-5 text-yellow-500" />,  label: 'Recognition Awards',  value: '3x Annual' },
    { icon: <Star  className="w-5 h-5 text-forest-400" />,  label: 'Performance Bonuses', value: 'Monthly'    },
    { icon: <ChevronRight className="w-5 h-5 text-forest-500" />, label: 'Growth Pathways', value: 'Structured' },
  ]

  return (
    <section className="section-wrapper bg-cream-50 relative overflow-hidden" ref={ref}>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23193919' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative container-base">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div ref={barRef} className="w-12 h-1 bg-forest-500 mb-6 rounded-full" />
            <div className="reveal inline-flex items-center gap-2 bg-forest-100 border border-forest-200
                            rounded-full px-3 py-1 mb-5">
              <Award className="w-3.5 h-3.5 text-yellow-500" />
              <span className="font-body text-xs font-semibold text-forest-700 tracking-wide">
                Award-Winning Program
              </span>
            </div>
            <h2 className="reveal section-title mb-5 leading-tight">
              Award-Winning Employee{' '}
              <span className="text-forest-600">Recognition Program</span>
            </h2>
            <p className="reveal font-body text-base text-forest-700/70 leading-relaxed mb-6 max-w-lg">
              We proudly recognize and reward outstanding team members through our award-winning
              employee recognition program. This initiative is designed to identify individuals
              with exceptional potential and performance, providing them with opportunities for
              growth, advancement, and exclusive incentives.
            </p>
            <p className="reveal font-body text-sm text-forest-700/60 leading-relaxed mb-8 max-w-lg">
              From monthly spotlights to annual excellence awards, every contribution is seen,
              valued, and celebrated — because the best organisations are built by the best people.
            </p>
            <div className="reveal">
              <Link to="/staff" className="btn-primary">
                Meet Our Team <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="reveal flex items-center gap-5 p-5 bg-white border border-forest-100
                           rounded-sm shadow-sm hover:shadow-md hover:border-forest-200 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-forest-50 border border-forest-100 rounded-sm
                                flex items-center justify-center shrink-0 group-hover:bg-forest-100 transition-colors">
                  {h.icon}
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs text-forest-500 uppercase tracking-widest mb-0.5">{h.label}</p>
                  <p className="font-display text-lg font-semibold text-forest-900">{h.value}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-forest-300 group-hover:text-forest-500 transition-colors" />
              </div>
            ))}
            <div className="reveal p-6 bg-forest-900 rounded-sm">
              <div className="text-forest-400 font-display text-4xl leading-none mb-2 select-none">"</div>
              <p className="font-body text-sm text-cream-200/80 leading-relaxed italic mb-4">
                Our recognition program has transformed team culture. People don't just show up —
                they bring their best every single day.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center shrink-0">
                  <span className="font-body text-xs font-bold text-white">JW</span>
                </div>
                <div>
                  <p className="font-body text-xs font-semibold text-white">JAMES WHITFIELD</p>
                  <p className="font-body text-xs text-forest-400">CEO &amp; FOUNDER</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ────────────────────────────────────────────────────────────
function CTASection() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-forest-800 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 opacity-5"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='23' cy='23' r='1'/%3E%3C/g%3E%3C/svg%3E")` }} />
      <div className="relative container-base text-center">
        <div className="max-w-2xl mx-auto">
          <p className="reveal font-body text-xs font-semibold tracking-[0.2em] uppercase text-forest-300 mb-4">
            Ready to Start?
          </p>
          <h2 className="reveal font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            The right hire changes everything.
          </h2>
          <p className="reveal font-body text-base text-cream-200/60 mb-10 leading-relaxed">
            Whether you're looking for your next great role or searching for an exceptional
            environmental professional, we're here to make the connection.
          </p>
          <div className="reveal flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary bg-forest-400 hover:bg-forest-300 text-forest-950">
              Work With Us
            </Link>
            <Link to="/jobs"
                  className="inline-flex items-center gap-2 border-2 border-cream-200/30 text-cream-100
                             hover:border-cream-200/60 hover:bg-white/5 font-body font-medium
                             px-6 py-3 rounded-sm transition-all duration-300">
              View Open Positions
            </Link>
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
      <ServicesPreview />
      <StatsSection />
      <IndustriesPreview />
      <TestimonialsSection />
      <EmployeeRecognitionSection />
      <CTASection />
    </>
  )
}
