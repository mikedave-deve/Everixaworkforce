import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { timeline } from '../data'
import { staff } from '../data/staff'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageHeaderImage from '../components/PageHeaderImage'
import { SectionHead, CtaBand } from '../components/Editorial'
import aboutHero from '../assets/stock/about-team.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={aboutHero}
      label="About Us"
      title="People-first staffing,"
      highlight="built on real connections"
      subtitle="Everixa Workforce was founded on a simple idea: the right hire changes everything. Since 2006 we've built a firm that treats every placement like a long-term relationship, not a transaction."
    />
  )
}

function OurStory() {
  const ref = useScrollReveal('.reveal')
  const values = [
    { title: 'Purpose-Driven', body: 'We measure success by long-term retention, not just filled seats.' },
    { title: 'People-First', body: 'Every candidate and client is a relationship we invest in for the long run.' },
    { title: 'Genuinely Curious', body: 'We take the time to understand the work, not just the job title.' },
  ]

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <div className="reveal">
            <p className="eyebrow mb-6"><span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">01</span>Our Story</p>
            <h2 className="section-title mb-10">
              Creating connections <em className="text-brass-700">since 2006.</em>
            </h2>
            <div className="space-y-5 text-[16px] leading-[1.75] text-ink-700/85 md:text-[17px]">
              <p>
                Everixa Workforce started with a single recruiter and a conviction that
                staffing could be done better: with real conversations, honest assessments,
                and a genuine investment in getting the match right the first time.
              </p>
              <p>
                Two decades later, we've grown into a nationwide network — but the philosophy
                hasn't changed. We still pick up the phone, we still ask about your goals
                before your resume, and we still believe great hiring starts with people,
                not keywords.
              </p>
            </div>
          </div>

          <ul className="border-t border-ink-900/15 lg:mt-16">
            {values.map((v, i) => (
              <li key={v.title} className="reveal grid grid-cols-[3rem_1fr] gap-4 border-b border-ink-900/15 py-8">
                <span className="index-num pt-1">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-[1.8rem] leading-tight text-ink-900">{v.title}</h3>
                  <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-700/80">{v.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function OurJourney() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="on-dark grain relative bg-ink-900 py-24 md:py-32" ref={ref}>
      <div className="container-main relative">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="reveal lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-6"><span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">02</span>Milestones</p>
            <h2 className="section-title">Our <em className="text-brass-300">journey.</em></h2>
          </div>
          <ol className="border-t border-cream-50/15">
            {timeline.map((item) => (
              <li key={item.year} className="reveal grid gap-3 border-b border-cream-50/15 py-8 sm:grid-cols-[7rem_1fr] sm:gap-8">
                <p className="font-num text-3xl font-light leading-none text-brass-300">{item.year}</p>
                <p className="max-w-lg text-[15px] leading-relaxed text-cream-100/75">{item.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function LeadershipTeaser() {
  const ref = useScrollReveal('.reveal')
  const leaders = staff.slice(0, 4)

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="03"
          label="Leadership"
          title={<>The people behind <em className="text-brass-700">Everixa.</em></>}
          action={<Link to="/staff" className="link-arrow">Meet the full team <ArrowRight size={14} /></Link>}
        />
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
          {leaders.map((member) => (
            <article key={member.id} className="reveal group">
              <div className="aspect-[4/5] overflow-hidden bg-ink-100">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover object-top grayscale contrast-[1.05] transition-[transform,filter] duration-[900ms] ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <h3 className="mt-5 font-display text-[1.5rem] leading-tight text-ink-900">{member.name}</h3>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">{member.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <PageHeader />
      <OurStory />
      <OurJourney />
      <LeadershipTeaser />
      <CtaBand
        title={<>Ready to write the next <em className="text-brass-700">chapter with us?</em></>}
        body="Whether you're hiring or looking for your next role, we'd love to hear from you."
        primary={{ to: '/contact', label: 'Get in Touch' }}
        secondary={{ to: '/jobs', label: 'View Open Positions' }}
      />
    </>
  )
}
