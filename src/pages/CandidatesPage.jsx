import { useScrollReveal } from '../hooks/useScrollReveal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import PageHeaderImage from '../components/PageHeaderImage'
import { SectionHead, CtaBand } from '../components/Editorial'
import WageTable from '../components/WageTable'
import candidatesHero from '../assets/stock/candidates-remote.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={candidatesHero}
      label="For Candidates"
      title="Find real work you can"
      highlight="do from home"
      subtitle="Whatever your age or experience, we will match you with a friendly, flexible work-from-home job and an approved hourly wage you can count on."
      cta="View Open Positions"
      ctaHref="/jobs"
    />
  )
}

function ProcessSection() {
  const ref = useScrollReveal('.reveal')
  const steps = [
    { title: 'Submit Your Profile',    body: 'Share your resume and career goals. We\'ll review within 48 hours and reach out if there\'s a strong match or upcoming opportunity.' },
    { title: 'A Friendly Conversation', body: 'We chat about your experience, your skills and the hours that suit your life - not a scripted intake form. New to working from home? That is fine too.' },
    { title: 'Curated Introductions',  body: 'We only introduce you to roles that genuinely match your skills, career goals, and compensation requirements. No shotgun approach.' },
    { title: 'Offer & Onboarding',     body: 'We coach you through interviews, negotiate on your behalf, and check in at 30, 60, and 90 days to ensure you\'re set up for success.' },
  ]
  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="01"
          label="How It Works"
          title={<>Your path to the <em className="text-brass-700">right role.</em></>}
        />
        <ol className="grid border-t border-ink-900/15 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="reveal border-b border-ink-900/15 py-9 sm:pr-8 lg:border-b-0 lg:[&:not(:last-child)]:border-r lg:[&:not(:first-child)]:pl-8"
            >
              <span className="font-num text-4xl font-light leading-none text-brass-500">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-6 font-display text-[1.6rem] leading-tight text-ink-900">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-700/80">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function TipList({ items }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.tip} className="grid gap-2 border-b border-ink-900/15 py-7 sm:grid-cols-[3rem_1fr_1.3fr] sm:gap-8">
          <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
          <h4 className="font-display text-[1.45rem] leading-tight text-ink-900">{item.tip}</h4>
          <p className="text-[15px] leading-relaxed text-ink-700/80">{item.body}</p>
        </li>
      ))}
    </ul>
  )
}

function ResourcesSection() {
  const ref = useScrollReveal('.reveal')

  const resumeTips = [
    { tip: 'Lead with what you do well',     body: 'Put your best skills first: typing speed, friendly phone manner, attention to detail, organization. Employers hiring for remote roles look for these straight away.' },
    { tip: 'Show real examples',             body: 'Instead of "good with customers", say "answered 60+ customer calls a day and kept a 95% happy-customer rating."' },
    { tip: 'Mention your home setup',        body: 'A quick line such as "Dedicated home office, reliable high-speed internet, headset and laptop" shows you are ready to start.' },
    { tip: 'Every kind of experience counts', body: 'Raising a family, volunteering, running a household or helping a neighbor all build real skills. Include anything that shows you are dependable.' },
  ]

  const interviewTips = [
    { tip: 'Test your tech first',         body: 'Check your camera, microphone and internet a few minutes before a video interview, and sit somewhere quiet with good light.' },
    { tip: 'Share how you stay on track',  body: 'Employers want to hear how you organize your day at home. A simple routine or to-do list is a great answer.' },
    { tip: 'Prepare a couple of stories',  body: 'Have two short examples ready of a time you solved a problem or helped someone. Keep each one under a minute.' },
    { tip: 'Ask about the first week',     body: 'Ask about training, who your team lead will be and how you will be supported. It shows you are keen and thoughtful.' },
  ]

  return (
    <section className="section-wrapper bg-cream-100" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="02"
          label="Career Resources"
          title={<>Tools to help you <em className="text-brass-700">land the job.</em></>}
        />
        <div className="reveal">
          <Tabs defaultValue="resume">
            <TabsList>
              <TabsTrigger value="resume">Resume Tips</TabsTrigger>
              <TabsTrigger value="interview">Interview Prep</TabsTrigger>
              <TabsTrigger value="salary">Approved Wages</TabsTrigger>
            </TabsList>

            <TabsContent value="resume"><TipList items={resumeTips} /></TabsContent>
            <TabsContent value="interview"><TipList items={interviewTips} /></TabsContent>

            <TabsContent value="salary">
              <div className="pt-6"><WageTable /></div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

export default function CandidatesPage() {
  return (
    <>
      <PageHeader />
      <ProcessSection />
      <ResourcesSection />
      <CtaBand
        title={<>Ready to take the <em className="text-brass-700">next step?</em></>}
        body="Submit your resume and we will be in touch when a role matches your experience and goals. No spam. No shotgun applications."
        primary={{ to: '/jobs', label: 'Browse Current Openings' }}
        secondary={{ to: '/submit-resume', label: 'Submit Your Resume' }}
      />
    </>
  )
}
