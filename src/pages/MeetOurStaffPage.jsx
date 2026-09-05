import { useEffect, useRef } from 'react'
import { Award } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { staff, employeeOfTheMonthId } from '../data/staff'
import staffHero from '../assets/stock/contact-team.jpg'

gsap.registerPlugin(ScrollTrigger)

// ─── Page Header ──────────────────────────────────────────────────────────
function PageHeader() {
  const headerRef = useRef(null)
  const titleRef  = useRef(null)
  const subRef    = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })
      tl.fromTo(
        titleRef.current.querySelectorAll('.header-word'),
        { opacity: 0, y: 40, rotateX: -15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.75, stagger: 0.08, ease: 'power3.out' }
      ).fromTo(
        subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.35'
      )
    }, headerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={headerRef} className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="absolute inset-0">
        <img src={staffHero} alt="" className="w-full h-full object-cover animate-ken-burns" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/85 to-forest-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-transparent" />
      </div>
      <div className="relative container-base">
        <p className="section-label text-forest-400 mb-3">Our People</p>
        <h1
          ref={titleRef}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-2xl mb-6"
          style={{ perspective: '800px' }}
        >
          {['Meet', 'Our'].map(w => (
            <span key={w} className="header-word inline-block mr-[0.25em]">{w}</span>
          ))}
          <span className="header-word inline-block text-forest-400">Staff</span>
        </h1>
        <p ref={subRef} className="font-body text-base md:text-lg text-cream-200/60 max-w-xl leading-relaxed">
          The talented individuals behind every successful placement. We're a team of specialists
          who are deeply passionate about connecting great people with great opportunities.
        </p>
      </div>
    </div>
  )
}

// ─── Single Staff Card ────────────────────────────────────────────────────
function StaffCard({ member }) {
  return (
    <div className="reveal card-base group overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden bg-forest-100" style={{ aspectRatio: '4/4' }}>
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={e => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2d5a2d&color=fff&size=400`
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-forest-900/0 group-hover:bg-forest-900/20 transition-all duration-300" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-forest-900 mb-0.5 group-hover:text-forest-700 transition-colors">
          {member.name}
        </h3>
        <p className="font-body text-xs font-medium text-forest-500 tracking-wide uppercase mb-2">
          {member.role}
        </p>
        {member.bio && (
          <p className="font-body text-xs text-forest-700/60 leading-relaxed">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Staff Grid ───────────────────────────────────────────────────────────
function StaffGrid() {
  const ref = useScrollReveal('.reveal')
  const eotmMember = staff.find(s => s.id === employeeOfTheMonthId) ?? staff[0]
  const gridMembers = staff.filter(s => s.id !== employeeOfTheMonthId)

  return (
    <section className="section-wrapper bg-white" ref={ref}>
      <div className="container-base">
        <div className="text-center mb-12 reveal">
          <p className="section-label mb-3">The Team</p>
          <h2 className="section-title mb-4">People You'll Work With</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Each member of our team brings deep sector expertise and a genuine commitment
            to getting the right result for every candidate and employer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gridMembers.map(member => (
            <StaffCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Employee of the Month ─────────────────────────────────────────────────
function EmployeeOfTheMonth() {
  const ref     = useScrollReveal('.reveal')
  const cardRef = useRef(null)
  const eotm    = staff.find(s => s.id === employeeOfTheMonthId) ?? staff[0]

  useEffect(() => {
    if (!cardRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="section-wrapper bg-forest-50 border-t border-forest-100" ref={ref}>
      <div className="container-base">
        {/* Section heading */}
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 bg-forest-700 text-cream-100 px-4 py-1.5 rounded-full mb-5">
            <Award className="w-4 h-4 text-yellow-300" />
            <span className="font-body text-xs font-semibold tracking-widest uppercase">
              Employee Recognition
            </span>
          </div>
          <h2 className="section-title mb-4">
            Employee of{' '}
            <span className="text-forest-600">the Month</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Each month we celebrate a team member who exemplifies our values of integrity,
            dedication, and outstanding client service.
          </p>
        </div>

        {/* Featured card */}
        <div ref={cardRef} className="max-w-4xl mx-auto">
          <div className="bg-white border border-forest-200 rounded-sm shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">

              {/* Image column */}
              <div className="relative overflow-hidden bg-forest-100" style={{ minHeight: '380px' }}>
                <img
                  src={eotm.image}
                  alt={eotm.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  onError={e => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(eotm.name)}&background=2d5a2d&color=fff&size=600`
                  }}
                />
                {/* Gold accent overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/40 to-transparent" />
                {/* Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-yellow-400 text-forest-900
                                px-3 py-1 rounded-full shadow-md">
                  <Award className="w-3.5 h-3.5" />
                  <span className="font-body text-xs font-bold tracking-wide">Employee of the Month</span>
                </div>
              </div>

              {/* Content column */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <p className="section-label mb-3">This Month's Honoree</p>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-forest-900 mb-2 leading-tight">
                  {eotm.name}
                </h3>
                <p className="font-body text-sm font-medium text-forest-500 tracking-widest uppercase mb-5">
                  {eotm.role}
                </p>
                {eotm.bio && (
                  <p className="font-body text-base text-forest-700/70 leading-relaxed mb-6">
                    {eotm.bio}
                  </p>
                )}
                <blockquote className="border-l-2 border-forest-400 pl-4 italic font-body text-sm text-forest-700/60 leading-relaxed">
                  "Outstanding performance, consistent excellence, and an unwavering commitment to
                  the team. This recognition is well deserved."
                </blockquote>
                <p className="font-body text-xs text-forest-400 mt-3">— James Whitfield, CEO & Founder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function MeetOurStaffPage() {
  return (
    <>
      <PageHeader />
      <StaffGrid />
      <EmployeeOfTheMonth />
    </>
  )
}
