import { Link } from 'react-router-dom'
import { ArrowRight, Target, HeartHandshake, Sparkles } from 'lucide-react'
import { timeline } from '../data'
import { staff } from '../data/staff'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageHeaderImage from '../components/PageHeaderImage'
import aboutHero from '../assets/stock/about-team.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={aboutHero}
      label="About Us"
      title="People-First Staffing,"
      highlight="Built On Real Connections"
      subtitle="Everixa Workforce was founded on a simple idea: the right hire changes everything. Since 2006 we've built a firm that treats every placement like a long-term relationship, not a transaction."
    />
  )
}

function OurStory() {
  const ref = useScrollReveal('.reveal')
  const values = [
    { icon: <Target className="w-5 h-5 text-forest-600" />, title: 'Purpose-Driven', body: 'We measure success by long-term retention, not just filled seats.' },
    { icon: <HeartHandshake className="w-5 h-5 text-forest-600" />, title: 'People-First', body: 'Every candidate and client is a relationship we invest in for the long run.' },
    { icon: <Sparkles className="w-5 h-5 text-forest-600" />, title: 'Genuinely Curious', body: 'We take the time to understand the work, not just the job title.' },
  ]

  return (
    <section className="section-wrapper bg-white" ref={ref}>
      <div className="container-base">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="reveal">
            <p className="section-label mb-3">Our Story</p>
            <h2 className="section-title mb-5">
              Creating Connections{' '}
              <span className="text-forest-600">Since 2006</span>
            </h2>
            <p className="font-body text-base text-forest-700/70 leading-relaxed mb-4">
              Everixa Workforce started with a single recruiter and a conviction that
              staffing could be done better: with real conversations, honest assessments,
              and a genuine investment in getting the match right the first time.
            </p>
            <p className="font-body text-base text-forest-700/70 leading-relaxed">
              Two decades later, we've grown into a nationwide network — but the philosophy
              hasn't changed. We still pick up the phone, we still ask about your goals
              before your resume, and we still believe great hiring starts with people,
              not keywords.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {values.map((v) => (
              <div key={v.title}
                   className="reveal flex items-center gap-5 p-5 bg-forest-50 border border-forest-100
                              rounded-sm hover:shadow-md hover:border-forest-200 transition-all duration-300">
                <div className="w-11 h-11 bg-white border border-forest-200 rounded-sm flex items-center justify-center shrink-0">
                  {v.icon}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-forest-900">{v.title}</p>
                  <p className="font-body text-sm text-forest-700/70">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function OurJourney() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-forest-50" ref={ref}>
      <div className="container-base">
        <div className="text-center mb-14 reveal">
          <p className="section-label mb-3">Milestones</p>
          <h2 className="section-title">Our Journey</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          {timeline.map((item, i) => (
            <div key={item.year} className="reveal relative pl-10 pb-10 last:pb-0 border-l-2 border-forest-200 last:border-transparent">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-forest-600 border-4 border-forest-50" />
              <p className="font-display text-2xl font-bold text-forest-700 mb-1.5">{item.year}</p>
              <p className="font-body text-sm text-forest-700/75 leading-relaxed">{item.event}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LeadershipTeaser() {
  const ref = useScrollReveal('.reveal')
  const leaders = staff.slice(0, 4)

  return (
    <section className="section-wrapper bg-white" ref={ref}>
      <div className="container-base">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="reveal">
            <p className="section-label mb-3">Leadership</p>
            <h2 className="section-title">The People Behind Everixa</h2>
          </div>
          <Link to="/staff" className="reveal btn-outline text-sm self-start md:self-auto shrink-0">
            Meet the Full Team
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leaders.map((member) => (
            <div key={member.id} className="reveal card-base group overflow-hidden">
              <div className="relative overflow-hidden bg-forest-100" style={{ aspectRatio: '4/4' }}>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-forest-900/0 group-hover:bg-forest-900/20 transition-all duration-300" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-forest-900 mb-0.5 group-hover:text-forest-700 transition-colors">
                  {member.name}
                </h3>
                <p className="font-body text-xs font-medium text-forest-500 tracking-wide uppercase">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="section-wrapper bg-forest-900">
      <div className="container-base text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to write the next chapter with us?
        </h2>
        <p className="font-body text-base text-cream-200/60 mb-8 max-w-xl mx-auto">
          Whether you're hiring or looking for your next role, we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact" className="btn-primary bg-forest-400 hover:bg-forest-300 text-forest-950">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/jobs"
                className="inline-flex items-center gap-2 border-2 border-cream-200/30 text-cream-100
                           hover:border-cream-200/60 hover:bg-white/5 font-body font-medium
                           px-6 py-3 rounded-sm transition-all duration-300">
            View Open Positions
          </Link>
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
      <CTASection />
    </>
  )
}
