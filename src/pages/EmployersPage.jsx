import { Check } from 'lucide-react'
import { useScrollReveal, useCounterAnimation } from '../hooks/useScrollReveal'
import { stats } from '../data'
import PageHeaderImage from '../components/PageHeaderImage'
import { SectionHead, CtaBand } from '../components/Editorial'
import WageTable from '../components/WageTable'
import employersHero from '../assets/stock/employers-handshake.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={employersHero}
      label="For Employers"
      title="Hire work-from-home talent"
      highlight="with confidence"
      subtitle="Friendly, reliable remote team members for customer support, data entry, bookkeeping, administration and more, all paid at approved hourly wages."
      cta="Start Hiring Today"
      ctaHref="/contact"
    />
  )
}

function HiringSolutions() {
  const ref = useScrollReveal('.reveal')
  const solutions = [
    {
      title: 'Direct Placement',
      body: 'We find, screen and introduce permanent work-from-home hires within 7-10 days. Every candidate has been interviewed by our team and checked for a ready home-office setup.',
      features: ['90-day placement guarantee', 'Friendly phone screening included', 'Approved hourly wage guidance'],
    },
    {
      title: 'Flexible & Part-Time Staffing',
      body: 'Get trained remote help within 48-72 hours for busy seasons, evening cover or short projects. We handle payroll, workers\' comp and paperwork so you do not have to.',
      features: ['Fast start', 'W-2 employment handled', 'Contract-to-hire options'],
    },
    {
      title: 'Virtual Team Building',
      body: 'Need a whole support desk or back-office team? We recruit, organize and onboard a full remote team, with a team lead and a simple plan for the first 30 days.',
      features: ['Right-sized for your workload', 'Team lead included', 'Regular check-ins'],
    },
    {
      title: 'Remote Workforce Consulting',
      body: 'Unsure how to hire, pay or manage people who work from home? We share plain, practical advice on wages, job descriptions and keeping remote teams happy.',
      features: ['Hourly wage benchmarking', 'Simple job descriptions', 'Remote onboarding checklists'],
    },
  ]

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="01"
          label="Hiring Solutions"
          title={<>Built for teams that <em className="text-brass-700">work remotely.</em></>}
          lede="Every engagement is tailored to your schedule, budget and the work you need done."
        />
        <div className="grid border-t border-ink-900/15 md:grid-cols-2">
          {solutions.map((sol, i) => (
            <article
              key={sol.title}
              className="reveal border-b border-ink-900/15 py-10 md:py-12 md:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:pr-12 md:[&:nth-child(even)]:pl-12"
            >
              <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 font-display text-[2.1rem] leading-tight text-ink-900">{sol.title}</h3>
              <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-ink-700/80">{sol.body}</p>
              <ul className="mt-7 space-y-3">
                {sol.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-ink-800">
                    <Check className="h-4 w-4 shrink-0 text-brass-600" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyChooseUs() {
  const ref = useScrollReveal('.reveal')
  const reasons = [
    { title: 'Remote Experts',        body: 'Work from home is all we do. We know what makes remote team members successful.' },
    { title: 'Ready-to-Start People', body: 'Every candidate has a computer, reliable internet and a quiet place to work.' },
    { title: 'Speed Without Sacrifice', body: 'Average 18 days to offer, without lowering the quality of the people we introduce.' },
    { title: 'Honest Partnership',    body: 'No resume dumps. Regular updates. Honest feedback on every candidate.' },
    { title: 'Nationwide Network',    body: 'Reach in 38 states, with thousands of remote-ready people in our active pipeline.' },
    { title: 'Proven Retention',      body: '94% of our placements stay with their employer one year after starting.' },
  ]
  return (
    <section className="section-wrapper bg-cream-100" ref={ref}>
      <div className="container-main">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="reveal lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-6"><span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">02</span>Why Everixa</p>
            <h2 className="section-title mb-8">Why employers <em className="text-brass-700">choose us.</em></h2>
            <p className="section-subtitle">
              Three hundred-plus organizations rely on Everixa Workforce as their
              first call for remote talent, not their last resort.
            </p>
          </div>
          <ul className="border-t border-ink-900/15">
            {reasons.map((reason) => (
              <li key={reason.title} className="reveal grid gap-2 border-b border-ink-900/15 py-7 sm:grid-cols-[14rem_1fr] sm:gap-8">
                <h3 className="font-display text-[1.5rem] leading-tight text-ink-900">{reason.title}</h3>
                <p className="text-[15px] leading-relaxed text-ink-700/80">{reason.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function WageSection() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="03"
          label="Approved wages"
          title={<>Approved hourly wages for <em className="text-brass-700">U.S. employers.</em></>}
          lede="Clear, fair wage ranges for every remote role we place, so you can budget with confidence and candidates know what to expect."
        />
        <div className="reveal"><WageTable /></div>
      </div>
    </section>
  )
}

function MetricsSection() {
  const ref = useCounterAnimation(stats)
  return (
    <section className="on-dark grain relative bg-ink-900 py-24 md:py-28" ref={ref}>
      <div className="container-main relative">
        <p className="eyebrow mb-6">By the numbers</p>
        <h2 className="section-title mb-14">Proven <em className="text-brass-300">track record.</em></h2>
        <dl className="grid grid-cols-2 border-t border-cream-50/15 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-b border-cream-50/15 py-9 pr-6 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
              <dd className="font-num text-[clamp(2.8rem,5vw,4.6rem)] leading-none tracking-[-0.03em] text-cream-50">
                <span data-counter>{stat.value}</span>
                <span className="text-brass-300">{stat.suffix}</span>
              </dd>
              <dt className="mt-4 text-[14px] font-semibold text-cream-50">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default function EmployersPage() {
  return (
    <>
      <PageHeader />
      <HiringSolutions />
      <WhyChooseUs />
      <WageSection />
      <MetricsSection />
      <CtaBand
        title={<>Ready to find your next <em className="text-brass-700">great hire?</em></>}
        primary={{ to: '/contact', label: 'Start Hiring Today' }}
        secondary={{ to: '/services', label: 'View All Services' }}
      />
    </>
  )
}
