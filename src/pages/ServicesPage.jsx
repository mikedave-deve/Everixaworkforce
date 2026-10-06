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
      subtitle="From a single part-time hire to a whole remote team, our services are built around people who work from home, and the employers who hire them."
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
    { n: '01', title: 'Discovery Call',         body: 'We learn about your business, the work to be done, the hours you need covered and your budget. No long forms.' },
    { n: '02', title: 'Search & Screening',     body: 'We search our network, talk with each candidate by phone, and check their skills and home-office setup before you see a single resume.' },
    { n: '03', title: 'Curated Shortlist',      body: 'You receive 3-5 carefully chosen candidates, not a pile of 30 profiles to sort through.' },
    { n: '04', title: 'Interview Coordination', body: 'We schedule the video or phone interviews, brief the candidates and give you simple interview questions for the role.' },
    { n: '05', title: 'Offer & Close',          body: 'We help with the offer, agree the approved hourly wage and make sure both sides are happy before the first day.' },
    { n: '06', title: 'Onboarding Support',     body: '30/60/90-day check-ins with new team members and with you help the placement stick.' },
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
    { q: 'How quickly can I get someone started?', a: 'For most roles we present a shortlist within 7-10 business days. Part-time and flexible roles can often start within 48-72 hours.' },
    { q: 'Can people really work from anywhere in the U.S.?', a: 'Yes. All of our roles are work from home and we place people across the continental U.S. We handle payroll and paperwork for each state.' },
    { q: 'What is your placement guarantee for direct hires?', a: 'All direct placements include a 90-day guarantee. If a placed team member leaves for any reason within 90 days, we run a replacement search at no extra fee.' },
    { q: 'How do you check candidates before you introduce them?', a: 'Every candidate has a friendly phone conversation with our team. We check their skills, their availability and that they have a computer, internet and a quiet place to work.' },
    { q: 'Do you handle payroll for part-time and contract workers?', a: 'Yes. Contract and part-time team members are W-2 employees of Everixa Workforce. We handle payroll, taxes and workers\' compensation, and can include health benefits.' },
    { q: 'How are your fees structured?', a: 'Direct placement fees are a percentage of the first-year pay, agreed in advance. Contract staffing is billed at an hourly rate that includes our fee. Wages follow the approved hourly ranges.' },
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
