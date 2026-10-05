import { industries } from '../data'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageHeaderImage from '../components/PageHeaderImage'
import industriesHero from '../assets/stock/industries-team.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={industriesHero}
      label="Sector Focus"
      title="Deep expertise across"
      highlight="every industrial discipline"
      subtitle="We're devoted to bringing you the best. Our practice spans every major discipline within the sector."
    />
  )
}

const extendedIndustries = [
  ...industries,
  {
    id: 'climate',
    title: 'Climate & Sustainability',
    description: 'Corporate sustainability, carbon accounting, and climate strategy professionals.',
  },
  {
    id: 'mining',
    title: 'Mining & Reclamation',
    description: 'Mine closure, reclamation bonds, and post-mining land use specialists.',
  },
  {
    id: 'waste',
    title: 'Waste Management',
    description: 'Solid waste, hazardous materials, and landfill operations professionals.',
  },
  {
    id: 'oil',
    title: 'Oil & Gas Environmental',
    description: 'Upstream and midstream environmental compliance, spill response, and permitting.',
  },
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
    { stat: '94%', label: '1-Year Retention', desc: 'Because we validate true fit, not just keywords' },
    { stat: '18d', label: 'Avg. Time-to-Offer', desc: 'vs. 42 days industry average' },
    { stat: '8', label: 'Technical Disciplines', desc: 'Covered by our specialized practice teams' },
  ]
  return (
    <section className="on-dark grain relative bg-ink-900 py-24 md:py-32" ref={ref}>
      <div className="container-main relative">
        <div className="mb-16 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div className="reveal">
            <p className="eyebrow mb-6">Why it matters</p>
            <h2 className="section-title">Specialization produces <em className="text-brass-300">better outcomes.</em></h2>
          </div>
          <p className="reveal section-subtitle">
            A generalist recruiter views the environmental sector as a category.
            We view it as a calling. That difference shows up in every conversation,
            every screen, and every placement.
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
