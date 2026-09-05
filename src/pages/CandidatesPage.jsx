import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Search, UserCheck, Star } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import PageHeaderImage from '../components/PageHeaderImage'
import candidatesHero from '../assets/stock/candidates-remote.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={candidatesHero}
      label="For Candidates"
      title="A Recruiter Who Actually"
      highlight="Understands Your Work"
      subtitle="We do not read resumes with a keyword highlighter. We read them with years of field and consulting experience behind us."
      cta="View Open Positions"
      ctaHref="/jobs"
    />
  )
}

function ProcessSection() {
  const ref = useScrollReveal('.reveal')
  const steps = [
    { icon: <Search className="w-5 h-5" />,    title: 'Submit Your Profile',    body: 'Share your resume and career goals. We\'ll review within 48 hours and reach out if there\'s a strong match or upcoming opportunity.' },
    { icon: <FileText className="w-5 h-5" />,  title: 'Technical Consultation', body: 'We conduct a real conversation about your experience - not a scripted intake form. We need to understand your expertise to represent you well.' },
    { icon: <UserCheck className="w-5 h-5" />, title: 'Curated Introductions',  body: 'We only introduce you to roles that genuinely match your skills, career goals, and compensation requirements. No shotgun approach.' },
    { icon: <Star className="w-5 h-5" />,      title: 'Offer & Onboarding',     body: 'We coach you through interviews, negotiate on your behalf, and check in at 30, 60, and 90 days to ensure you\'re set up for success.' },
  ]
  return (
    <section className="section-wrapper bg-white" ref={ref}>
      <div className="container-base">
        <div className="text-center mb-12 reveal">
          <p className="section-label mb-3">How It Works</p>
          <h2 className="section-title">Your Path to the Right Role</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="reveal relative">
              <div className="bg-forest-50 border border-forest-100 rounded-sm p-6 h-full
                              hover:shadow-md hover:border-forest-200 transition-all">
                <div className="w-10 h-10 bg-forest-700 rounded-sm flex items-center justify-center text-cream-100 mb-4">
                  {step.icon}
                </div>
                <div className="absolute -top-3 right-4 font-display text-5xl font-bold text-forest-100">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-lg font-semibold text-forest-900 mb-2">{step.title}</h3>
                <p className="font-body text-sm text-forest-700/70 leading-relaxed">{step.body}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-3 z-10">
                  <ArrowRight className="w-5 h-5 text-forest-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
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

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-base max-w-4xl">
        <div className="text-center mb-10 reveal">
          <p className="section-label mb-3">Career Resources</p>
          <h2 className="section-title">Tools to Help You Land the Role</h2>
        </div>
        <div className="reveal">
          <Tabs defaultValue="resume">
            <TabsList className="mb-6">
              <TabsTrigger value="resume">Resume Tips</TabsTrigger>
              <TabsTrigger value="interview">Interview Prep</TabsTrigger>
              <TabsTrigger value="salary">Salary Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="resume">
              <div className="space-y-4">
                {resumeTips.map((item) => (
                  <div key={item.tip}
                       className="bg-white border border-forest-100 rounded-sm p-5 hover:border-forest-200 transition-all">
                    <h4 className="font-body text-sm font-semibold text-forest-900 mb-2">{item.tip}</h4>
                    <p className="font-body text-sm text-forest-700/70 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="interview">
              <div className="space-y-4">
                {interviewTips.map((item) => (
                  <div key={item.tip}
                       className="bg-white border border-forest-100 rounded-sm p-5 hover:border-forest-200 transition-all">
                    <h4 className="font-body text-sm font-semibold text-forest-900 mb-2">{item.tip}</h4>
                    <p className="font-body text-sm text-forest-700/70 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="salary">
              <div className="bg-white border border-forest-100 rounded-sm overflow-hidden">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="bg-forest-50 border-b border-forest-100">
                      <th className="text-left p-4 font-semibold text-forest-800">Role</th>
                      <th className="text-left p-4 font-semibold text-forest-800">Experience</th>
                      <th className="text-left p-4 font-semibold text-forest-800">Salary Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Administrative Assistant',       'Entry (0-3 yrs)',   '$41,000 – $44,000'],
                      ['Payroll Specialist',       'Entry (0-3 yrs)',     '$50,000 – $65,000'],
                      ['ustomer Service Representative', 'Entry (0-3 yrs)',   '$39,000 - $43,000'],
                      ['EHS Manager',                   'Entry (0-3 yrs)',        '$85,000 - $115,000'],
                      ['Data Entry Clerk',   'Entry (0-3 yrs)',        '$35,000 – $45,000'],
                      ['Medical Specialist',        'Entry (0-3 yrs)',  '$45,000 - $60,000'],
                      ['Sales & Business Development',   'Entry (0-3 yrs)',           '$55,000 – $75,000'],
                    ].map(([role, exp, salary]) => (
                      <tr key={role + exp} className="border-b border-forest-50 hover:bg-forest-50/50 transition-colors">
                        <td className="p-4 text-forest-900 font-medium">{role}</td>
                        <td className="p-4 text-forest-600">{exp}</td>
                        <td className="p-4 text-forest-700 font-semibold">{salary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="p-4 text-xs text-forest-400 font-body border-t border-forest-100">
                  Ranges reflect Pacific Northwest market rates. Compensation varies by location, firm size, and specialization. Contact us for a personalized salary discussion.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="section-wrapper bg-forest-800">
      <div className="container-base text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to take the next step?
        </h2>
        <p className="font-body text-base text-cream-200/60 mb-8 max-w-xl mx-auto">
          Submit your resume and we will be in touch when a role matches your experience and goals.
          No spam. No shotgun applications.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/jobs"    className="btn-primary bg-forest-400 hover:bg-forest-300 text-forest-950">Browse Current Openings</Link>
          <Link to="/submit-resume" className="inline-flex items-center gap-2 border-2 border-cream-200/30
                                          text-cream-100 hover:border-cream-200/60 hover:bg-white/5
                                          font-body font-medium px-6 py-3 rounded-sm transition-all">
            Submit Your Resume
          </Link>
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
      <CTASection />
    </>
  )
}
