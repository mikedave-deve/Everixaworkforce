import { industries } from '../data'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageHeaderImage from '../components/PageHeaderImage'
import industriesHero from '../assets/stock/industries-team.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={industriesHero}
      label="Where you can work"
      title="Work-from-home roles across"
      highlight="every kind of business"
      subtitle="From customer support to bookkeeping, there is a remote role for almost every skill, schedule and stage of life."
    />
  )
}

const extendedIndustries = [
  ...industries,
  { id: 'ecommerce', title: 'E-commerce Support', description: 'Help online shoppers with orders, deliveries and returns, all from your own desk.' },
  { id: 'education', title: 'Education & Tutoring Support', description: 'Support schools and tutoring companies with scheduling, student questions and records.' },
  { id: 'real-estate', title: 'Real Estate Administration', description: 'Keep listings, appointments and paperwork organized for busy real estate teams.' },
  { id: 'insurance', title: 'Insurance Support', description: 'Answer policy questions and process simple claims paperwork for insurance providers.' },
]

function IndustriesGrid() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <ul className="grid border-t border-ink-900/15 md:grid-cols-2 md:gap-x-16">
          {extendedIndustries.map((ind, i) => (
            <li key={ind.id} className="reveal group border-b border-ink-900/15 py-9">
              <div className="grid grid-cols-[3.2rem_1fr] gap-4">
                <span className="index-num pt-1 transition-colors group-hover:text-ink-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="font-display text-[1.9rem] leading-tight text-ink-900">{ind.title}</h2>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-700/80">{ind.description}</p>
                  <div className="mt-6 h-px w-10 bg-brass-500 transition-all duration-500 ease-out group-hover:w-24" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function WhySpecialize() {
  const ref = useScrollReveal('.reveal')
  const items = [
    { stat: '94%', label: '1-Year Retention', desc: 'Because we match people to roles that truly fit their lives' },
    { stat: '18d', label: 'Avg. Time-to-Offer', desc: 'vs. 42 days industry average' },
    { stat: '12', label: 'Role Families', desc: 'Remote roles across the fields on this page' },
  ]
  return (
    <section className="on-dark grain relative bg-ink-900 py-24 md:py-32" ref={ref}>
      <div className="container-main relative">
        <div className="mb-16 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div className="reveal">
            <p className="eyebrow mb-6">Why it matters</p>
            <h2 className="section-title">Remote work, <em className="text-brass-300">done right.</em></h2>
          </div>
          <p className="reveal section-subtitle">
            Working from home only works when the role, the schedule and the person all fit.
            We take the time to understand all three, so people stay happy in their jobs and
            employers keep the team members they hire.
          </p>
        </div>
        <dl className="grid border-t border-cream-50/15 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="reveal border-b border-cream-50/15 py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <dd className="font-num text-[clamp(3.4rem,6vw,5.5rem)] leading-none tracking-[-0.03em] text-cream-50">{item.stat}</dd>
              <dt className="mt-5 text-[14px] font-semibold text-cream-50">{item.label}</dt>
              <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-cream-100/60">{item.desc}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default function IndustriesPage() {
  return (
    <>
      <PageHeader />
      <IndustriesGrid />
      <WhySpecialize />
    </>
  )
}
