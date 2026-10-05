import { Check } from 'lucide-react'
import { useScrollReveal, useCounterAnimation } from '../hooks/useScrollReveal'
import { stats } from '../data'
import PageHeaderImage from '../components/PageHeaderImage'
import { SectionHead, CtaBand } from '../components/Editorial'
import employersHero from '../assets/stock/employers-handshake.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={employersHero}
      label="For Employers"
      title="Hire environmental talent"
      highlight="with confidence"
      subtitle="We're not a generalist staffing agency that happens to send environmental resumes. We're the firm that environmental organizations call first."
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
      body: 'We identify, screen, and present qualified permanent hires within 7-10 days. All candidates are technically vetted by a team member with relevant environmental experience.',
      features: ['90-day placement guarantee', 'Technical screening included', 'Salary benchmarking support'],
    },
    {
      title: 'Contract Staffing',
      body: 'Mobilize skilled contractors within 48-72 hours. We manage payroll, workers\' comp, and compliance - you get productive professionals with zero administrative overhead.',
      features: ['Rapid deployment', 'W-2 employment handled', 'Contract-to-hire options'],
    },
    {
      title: 'Executive Search',
      body: 'Retained search for director through C-suite roles. We map the market, approach passive candidates confidentially, and validate leadership competencies.',
      features: ['Confidential retained model', 'Market mapping included', 'Leadership assessments'],
    },
    {
      title: 'Workforce Consulting',
      body: 'Struggling to attract environmental talent? We analyze your employer brand, compensation structure, and hiring process to identify what\'s holding you back.',
      features: ['Compensation benchmarking', 'Job description optimization', 'Diversity hiring strategy'],
    },
  ]

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="01"
          label="Hiring Solutions"
          title={<>Built for environmental <em className="text-brass-700">organizations.</em></>}
          lede="Every engagement is customized to your timeline, budget, and technical requirements."
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
    { title: 'Sector Exclusivity',    body: '100% of our placements are in the environmental sector. Zero generalism.' },
    { title: 'Technical Credibility', body: 'Our consultants hold degrees and experience in environmental fields.' },
    { title: 'Speed Without Sacrifice', body: 'Average 18 days to offer without compromising candidate quality.' },
    { title: 'Transparent Partnership', body: 'No resume dumps. Regular status updates. Honest candidate assessments.' },
    { title: 'Nationwide Network',    body: '38-state reach with 12,000+ environmental professionals in our active pipeline.' },
    { title: 'Proven Retention',      body: '94% of our placements remain with client firms 1 year post-hire.' },
  ]
  return (
    <section className="section-wrapper bg-cream-100" ref={ref}>
      <div className="container-main">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="reveal lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-6"><span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">02</span>Why Everixa</p>
            <h2 className="section-title mb-8">Why leading firms <em className="text-brass-700">choose us.</em></h2>
            <p className="section-subtitle">
              Three hundred-plus organizations rely on Everixa Workforce as their
              first call for environmental talent - not their last resort.
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
      <MetricsSection />
      <CtaBand
        title={<>Ready to find your next <em className="text-brass-700">great hire?</em></>}
        primary={{ to: '/contact', label: 'Start Hiring Today' }}
        secondary={{ to: '/services', label: 'View All Services' }}
      />
    </>
  )
}
