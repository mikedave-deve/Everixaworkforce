import { useScrollReveal } from '../hooks/useScrollReveal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import PageHeaderImage from '../components/PageHeaderImage'
import { SectionHead, CtaBand } from '../components/Editorial'
import candidatesHero from '../assets/stock/candidates-remote.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={candidatesHero}
      label="For Candidates"
      title="A recruiter who actually"
      highlight="understands your work"
      subtitle="We do not read resumes with a keyword highlighter. We read them with years of field and consulting experience behind us."
      cta="View Open Positions"
      ctaHref="/jobs"
    />
  )
}

function ProcessSection() {
  const ref = useScrollReveal('.reveal')
  const steps = [
    { title: 'Submit Your Profile',    body: 'Share your resume and career goals. We\'ll review within 48 hours and reach out if there\'s a strong match or upcoming opportunity.' },
    { title: 'Technical Consultation', body: 'We conduct a real conversation about your experience - not a scripted intake form. We need to understand your expertise to represent you well.' },
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
    { tip: 'Lead with your technical expertise', body: 'Environmental employers scan for specific skills: site characterization, NEPA, 404 permitting, AERMOD. Put these front and center in a skills section above your work history.' },
    { tip: 'Quantify field experience',          body: 'Don\'t say "conducted site assessments." Say "completed 40+ Phase I and Phase II ESAs for commercial and industrial clients across Oregon and Washington."' },
    { tip: 'List certifications prominently',    body: 'PG, PE, PWS, CHMM, and other credentials should be visible at the top of your resume. Don\'t bury them at the bottom.' },
    { tip: 'Tailor to the discipline',           body: 'A remediation resume looks different than an EHS resume. Customize your summary and skills to the specific role and sector you\'re targeting.' },
  ]

  const interviewTips = [
    { tip: 'Know the regulatory landscape',       body: 'Research the primary regulations governing the role: RCRA, CWA, NEPA, CAA, etc. Know how they apply to the company\'s sector.' },
    { tip: 'Prepare project case studies',        body: 'Have 3-4 detailed examples of complex projects you\'ve led or contributed to, including challenges, approach, and outcome.' },
    { tip: 'Ask technical questions',             body: 'Asking about the specific tools, software, and methods the team uses signals genuine interest and technical engagement.' },
    { tip: 'Discuss regulatory relationships',    body: 'For senior roles, discuss your experience working directly with EPA, state agencies, or Army Corps. This is a differentiator.' },
  ]

  const salaries = [
    ['Administrative Assistant',       'Entry (0-3 yrs)', '$41,000 – $44,000'],
    ['Payroll Specialist',             'Entry (0-3 yrs)', '$50,000 – $65,000'],
    ['Customer Service Representative', 'Entry (0-3 yrs)', '$39,000 - $43,000'],
    ['EHS Manager',                    'Entry (0-3 yrs)', '$85,000 - $115,000'],
    ['Data Entry Clerk',               'Entry (0-3 yrs)', '$35,000 – $45,000'],
    ['Medical Specialist',             'Entry (0-3 yrs)', '$45,000 - $60,000'],
    ['Sales & Business Development',   'Entry (0-3 yrs)', '$55,000 – $75,000'],
  ]

  return (
    <section className="section-wrapper bg-cream-100" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="02"
          label="Career Resources"
          title={<>Tools to help you <em className="text-brass-700">land the role.</em></>}
        />
        <div className="reveal">
          <Tabs defaultValue="resume">
            <TabsList>
              <TabsTrigger value="resume">Resume Tips</TabsTrigger>
              <TabsTrigger value="interview">Interview Prep</TabsTrigger>
              <TabsTrigger value="salary">Salary Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="resume"><TipList items={resumeTips} /></TabsContent>
            <TabsContent value="interview"><TipList items={interviewTips} /></TabsContent>

            <TabsContent value="salary">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-[15px]">
                  <thead>
                    <tr className="border-b border-ink-900/15 text-[11px] uppercase tracking-[0.16em] text-ink-600">
                      <th scope="col" className="py-5 pr-4 font-semibold">Role</th>
                      <th scope="col" className="py-5 pr-4 font-semibold">Experience</th>
                      <th scope="col" className="py-5 font-semibold">Salary Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map(([role, exp, salary]) => (
                      <tr key={role} className="border-b border-ink-900/10">
                        <td className="py-5 pr-4 font-display text-[1.3rem] text-ink-900">{role}</td>
                        <td className="py-5 pr-4 text-ink-600">{exp}</td>
                        <td className="py-5 font-semibold text-ink-800">{salary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink-600">
                Ranges reflect Pacific Northwest market rates. Compensation varies by location, firm size, and specialization. Contact us for a personalized salary discussion.
              </p>
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
