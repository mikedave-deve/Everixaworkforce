import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { services } from '../data'
import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from '../components/ui/Accordion'
import PageHeaderImage from '../components/PageHeaderImage'
import { SectionHead } from '../components/Editorial'
import servicesHero from '../assets/stock/industries-logistics.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={servicesHero}
      label="What We Offer"
      title="Staffing solutions that"
      highlight="match your scale"
      subtitle="From single contract placements to full workforce strategies, our services are built around the unique demands of the environmental sector."
    />
  )
}

function ServicesDetail() {
  const ref = useScrollReveal('.reveal')
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <div className="border-t border-ink-900/15">
          {services.map((service, i) => (
            <article
              key={service.id}
              className="reveal grid gap-8 border-b border-ink-900/15 py-14 md:py-16 lg:grid-cols-[5rem_1fr_1fr] lg:gap-14"
            >
              <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] text-ink-900">{service.title}</h2>
                <p className="mt-5 max-w-md text-[16px] leading-[1.7] text-ink-700/85">{service.description}</p>
                <Link to="/contact" className="link-arrow mt-8">Get started <ArrowRight size={14} /></Link>
              </div>
              <ul className="space-y-3.5 lg:pt-2">
                {service.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-ink-800">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" strokeWidth={2} />
                    {item}
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

function ProcessSection() {
  const ref = useScrollReveal('.reveal')
  const steps = [
    { n: '01', title: 'Discovery Call',         body: 'We learn your organization, culture, required technical competencies, and timeline. No generic intake forms.' },
    { n: '02', title: 'Search & Screening',     body: 'We search our network, conduct technical phone screens, and validate credentials before you see any resume.' },
    { n: '03', title: 'Curated Shortlist',      body: 'You receive 3-5 thoroughly vetted candidates - not a dump of 30 semi-qualified profiles.' },
    { n: '04', title: 'Interview Coordination', body: 'We schedule, brief candidates, and provide interview frameworks tailored to the role\'s technical demands.' },
    { n: '05', title: 'Offer & Close',          body: 'We facilitate offer negotiations, handle counteroffers, and ensure a smooth close with both parties.' },
    { n: '06', title: 'Onboarding Support',     body: '30/60/90-day check-ins with placed candidates and clients ensure the placement sticks.' },
  ]
  return (
    <section className="on-dark grain relative bg-ink-900 py-24 md:py-32" ref={ref}>
      <div className="container-main relative">
        <SectionHead
          index="02"
          label="How It Works"
          title={<>Our <em className="text-brass-300">process.</em></>}
          lede="A disciplined, transparent workflow from first call to first day."
        />
        <ol className="grid border-t border-cream-50/15 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.n}
              className="reveal border-b border-cream-50/15 py-9 md:pr-10 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n+1))]:pl-10"
            >
              <span className="font-num text-4xl font-light leading-none text-brass-400">{step.n}</span>
              <h3 className="mt-6 font-display text-[1.7rem] leading-tight text-cream-50">{step.title}</h3>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-cream-100/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function FAQSection() {
  const ref = useScrollReveal('.reveal')
  const faqs = [
    { q: 'What is your typical time-to-fill for a permanent placement?', a: 'For most roles, we present an initial shortlist within 7-10 business days. Our average time-to-offer is 18 business days, significantly faster than the 42-day industry average.' },
    { q: 'Do you work with clients nationwide or only in the Pacific Northwest?', a: 'We place candidates across the continental U.S. Our core hubs are Portland, Seattle, and San Francisco, but we have successfully completed searches in 38 states.' },
    { q: 'What is your placement guarantee for direct hires?', a: 'All direct placement engagements include a 90-day guarantee. If a placed candidate leaves for any reason within 90 days, we conduct a full replacement search at no additional fee.' },
    { q: 'How do you screen candidates for technical competency?', a: 'Every candidate undergoes a structured phone screen conducted by a team member with relevant field experience. We evaluate both technical knowledge and communication skills needed for the role.' },
    { q: 'Do you offer payroll and benefits administration for contract workers?', a: 'Yes. All contract placements are W-2 employees of Everixa Workforce. We handle payroll, workers\' compensation, unemployment insurance, and can include health benefits.' },
    { q: 'How are your fees structured?', a: 'Direct placement fees are a percentage of the candidate\'s first-year base salary, negotiated based on role complexity. Contract staffing is billed at an hourly bill rate inclusive of our margin.' },
  ]
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="reveal">
            <p className="eyebrow mb-6"><span className="font-num text-[13px] font-medium normal-case tracking-[0.08em]">03</span>FAQ</p>
            <h2 className="section-title">Common <em className="text-brass-700">questions.</em></h2>
          </div>
          <Accordion type="single" collapsible className="reveal border-t border-ink-900/15">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export default function ServicesPage() {
  return (
    <>
      <PageHeader />
      <ServicesDetail />
      <ProcessSection />
      <FAQSection />
    </>
  )
}
