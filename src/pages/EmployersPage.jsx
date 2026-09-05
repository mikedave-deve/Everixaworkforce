import { Link } from 'react-router-dom'
import { CheckCircle2, Users, Zap, Award, TrendingUp } from 'lucide-react'
import { useScrollReveal, useCounterAnimation } from '../hooks/useScrollReveal'
import { stats } from '../data'
import PageHeaderImage from '../components/PageHeaderImage'
import employersHero from '../assets/stock/employers-handshake.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={employersHero}
      label="For Employers"
      title="Hire Environmental Talent"
      highlight="With Confidence"
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
      icon: <Users className="w-6 h-6 text-forest-600" />,
      title: 'Direct Placement',
      body: 'We identify, screen, and present qualified permanent hires within 7-10 days. All candidates are technically vetted by a team member with relevant environmental experience.',
      features: ['90-day placement guarantee', 'Technical screening included', 'Salary benchmarking support'],
    },
    {
      icon: <Zap className="w-6 h-6 text-forest-600" />,
      title: 'Contract Staffing',
      body: 'Mobilize skilled contractors within 48-72 hours. We manage payroll, workers\' comp, and compliance - you get productive professionals with zero administrative overhead.',
      features: ['Rapid deployment', 'W-2 employment handled', 'Contract-to-hire options'],
    },
    {
      icon: <Award className="w-6 h-6 text-forest-600" />,
      title: 'Executive Search',
      body: 'Retained search for director through C-suite roles. We map the market, approach passive candidates confidentially, and validate leadership competencies.',
      features: ['Confidential retained model', 'Market mapping included', 'Leadership assessments'],
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-forest-600" />,
      title: 'Workforce Consulting',
      body: 'Struggling to attract environmental talent? We analyze your employer brand, compensation structure, and hiring process to identify what\'s holding you back.',
      features: ['Compensation benchmarking', 'Job description optimization', 'Diversity hiring strategy'],
    },
  ]

  return (
    <section className="section-wrapper bg-white" ref={ref}>
      <div className="container-base">
        <div className="text-center mb-12 reveal">
          <p className="section-label mb-3">Hiring Solutions</p>
          <h2 className="section-title">Built for Environmental Organizations</h2>
          <p className="section-subtitle max-w-xl mx-auto mt-4">
            Every engagement is customized to your timeline, budget, and technical requirements.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((sol) => (
            <div key={sol.title}
                 className="reveal bg-forest-50 border border-forest-100 rounded-sm p-7
                            hover:shadow-md hover:border-forest-200 transition-all">
              <div className="w-12 h-12 bg-white rounded-sm border border-forest-200 flex items-center justify-center mb-5">
                {sol.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-forest-900 mb-3">{sol.title}</h3>
              <p className="font-body text-sm text-forest-700/75 leading-relaxed mb-4">{sol.body}</p>
              <ul className="space-y-2">
                {sol.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-500 shrink-0" />
                    <span className="font-body text-sm text-forest-800">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
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
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-base">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label mb-3 reveal">Why Everixa</p>
            <h2 className="section-title mb-5 reveal">Why Leading Environmental Firms Choose Us</h2>
            <p className="section-subtitle reveal">
              Three hundred-plus organizations rely on Everixa Workforce as their
              first call for environmental talent - not their last resort.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map((reason) => (
              <div key={reason.title}
                   className="reveal bg-white border border-forest-100 rounded-sm p-5
                              hover:shadow-sm hover:border-forest-200 transition-all">
                <h4 className="font-body text-sm font-semibold text-forest-900 mb-1.5">{reason.title}</h4>
                <p className="font-body text-xs text-forest-700/70 leading-relaxed">{reason.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricsSection() {
  const ref = useCounterAnimation(stats)
  return (
    <section className="section-wrapper bg-forest-800" ref={ref}>
      <div className="container-base text-center">
        <p className="section-label text-forest-400 mb-3">By the Numbers</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-10">
          Proven Track Record
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="font-display text-4xl lg:text-5xl font-bold text-forest-300">
                <span className='text-white' data-counter>{stat.value}</span>
                <span className="text-forest-400">{stat.suffix}</span>
              </div>
              <div className="font-body text-sm font-semibold text-white/90 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="section-wrapper bg-white">
      <div className="container-base">
        <div className="bg-forest-950 rounded-sm p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to find your next great hire?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <Link to="/services" className="inline-flex items-center gap-2 border-2 border-cream-200/30
                                             text-cream-100 hover:border-cream-200/60 hover:bg-white/5
                                             font-body font-medium px-6 py-3 rounded-sm transition-all">
              View All Services
            </Link>
          </div>
        </div>
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
      <CTASection />
    </>
  )
}
